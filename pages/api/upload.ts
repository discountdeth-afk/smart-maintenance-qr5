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
    
    if (!file || !filename) {
      return res.status(400).json({ error: 'File and filename required' })
    }
    
    // Base64デコード
    const base64Data = file.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    // BufferをBlobに変換
    const blob = new Blob([buffer], { type: 'image/jpeg' })
    
    // Vercel Blobにアップロード
    const result = await put(filename, blob, {
      access: 'public',
    })

    res.status(200).json({ url: result.url })
  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message || 'Upload failed' })
  }
}
