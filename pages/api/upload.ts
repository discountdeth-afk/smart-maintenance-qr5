import { put } from '@vercel/blob'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { file, filename } = req.body
    
    // Base64デコード
    const base64Data = file.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Vercel Blobにアップロード（正しい引数順序）
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    })

    res.status(200).json({ url: blob.url })
  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message || 'Upload failed' })
  }
}
