import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'

export default function Manage() {
  const [qrCodes, setQrCodes] = useState<any[]>([])

  useEffect(() => {
    loadQRCodes()
  }, [])

  const loadQRCodes = async () => {
    const { data } = await supabase.from('qr_codes').select('*').order('created_at', { ascending: false })
    setQrCodes(data || [])
  }

  const downloadPDF = async () => {
    const pdf = new jsPDF()
    for (let i = 0; i < qrCodes.length; i++) {
      const canvas = await QRCode.toCanvas(qrCodes[i].url)
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 20, 20, 50, 50)
      pdf.text(qrCodes[i].description || qrCodes[i].url, 80, 50)
      if (i < qrCodes.length - 1) pdf.addPage()
    }
    pdf.save('QR_manuals.pdf')
  }

  const downloadExcel = async () => {
    const res = await fetch('/api/export-excel')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'repair_history.xlsx'
    a.click()
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">📊 QR一覧 & データ出力</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📄 QRコードPDF出力
        </button>
        <button
          onClick={downloadExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          📊 修理履歴Excel出力
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {qrCodes.map((qr) => (
          <div key={qr.id} className="bg-white p-4 rounded shadow">
            <p className="font-bold">{qr.description}</p>
            <p className="text-xs text-gray-600 mt-1 break-words">{qr.url}</p>
            {qr.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {qr.tags.map((tag: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
