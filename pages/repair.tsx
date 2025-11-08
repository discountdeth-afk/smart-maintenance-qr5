import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Repair() {
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [selectedQR, setSelectedQR] = useState('')
  const [technicianName, setTechnicianName] = useState('')
  const [repairDetails, setRepairDetails] = useState('')

  useEffect(() => {
    loadQRCodes()
  }, [])

  const loadQRCodes = async () => {
    const { data } = await supabase.from('qr_codes').select('*').order('created_at', { ascending: false })
    setQrCodes(data || [])
  }

  const handleSubmit = async () => {
    if (!selectedQR || !technicianName || !repairDetails) {
      return alert('すべての項目を入力してください')
    }

    const { error } = await supabase.from('repair_history').insert({
      qr_id: selectedQR,
      technician_name: technicianName,
      repair_details: repairDetails,
    })

    if (error) {
      alert('エラーが発生しました')
      console.error(error)
    } else {
      alert('修理履歴を登録しました！')
      setTechnicianName('')
      setRepairDetails('')
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">🔧 修理履歴登録</h1>

      <div className="bg-white p-6 rounded shadow max-w-2xl">
        <label className="block font-bold mb-2">対象機器</label>
        <select
          value={selectedQR}
          onChange={(e) => setSelectedQR(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        >
          <option value="">選択してください</option>
          {qrCodes.map((qr) => (
            <option key={qr.id} value={qr.id}>
              {qr.description || qr.url}
            </option>
          ))}
        </select>

        <label className="block font-bold mb-2">担当者名</label>
        <input
          value={technicianName}
          onChange={(e) => setTechnicianName(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          placeholder="山田太郎"
        />

        <label className="block font-bold mb-2">修理内容</label>
        <textarea
          value={repairDetails}
          onChange={(e) => setRepairDetails(e.target.value)}
          className="border p-2 w-full rounded mb-4 h-32"
          placeholder="実施した修理内容を記入..."
        />

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded w-full hover:bg-green-700"
        >
          登録
        </button>
      </div>
    </main>
  )
}
