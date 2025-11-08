import type { NextApiRequest, NextApiResponse } from 'next'
import ExcelJS from 'exceljs'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 修理履歴を取得
    const { data: repairs, error } = await supabase
      .from('repair_history')
      .select(`
        *,
        qr_codes (url, description, tags)
      `)
      .order('repair_date', { ascending: false })

    if (error) throw error

    // Excelワークブック作成
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('修理履歴')

    // ヘッダー設定
    worksheet.columns = [
      { header: '修理日時', key: 'repair_date', width: 20 },
      { header: '担当者', key: 'technician_name', width: 15 },
      { header: '機器URL', key: 'url', width: 30 },
      { header: '機器説明', key: 'description', width: 30 },
      { header: '修理内容', key: 'repair_details', width: 40 },
      { header: 'タグ', key: 'tags', width: 20 },
    ]

    // データ追加
    repairs?.forEach((repair: any) => {
      worksheet.addRow({
        repair_date: new Date(repair.repair_date).toLocaleString('ja-JP'),
        technician_name: repair.technician_name,
        url: repair.qr_codes?.url || '',
        description: repair.qr_codes?.description || '',
        repair_details: repair.repair_details,
        tags: repair.qr_codes?.tags?.join(', ') || '',
      })
    })

    // スタイル適用
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    }

    // Excelファイルをバッファに変換
    const buffer = await workbook.xlsx.writeBuffer()

    // レスポンス設定
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=repair_history.xlsx')
    res.send(buffer)
  } catch (error: any) {
    console.error('Excel Export Error:', error)
    res.status(500).json({ error: error.message })
  }
}
