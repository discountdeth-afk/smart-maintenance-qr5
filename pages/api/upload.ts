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
    const buffer = Buffer.from(file.split(',')[1], 'base64')
    
    // Vercel Blobにアップロード
    const blob = await put(filename, buffer, {
      access: 'public',
    })

    res.status(200).json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}
