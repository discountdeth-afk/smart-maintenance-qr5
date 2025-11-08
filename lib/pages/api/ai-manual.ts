import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imageUrl, description } = req.body

  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' })

  try {
    // 1. 画像から修理内容を分析
    const visionResponse = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `この修理作業の画像から以下を抽出してください：
1. 作業内容の要約（50文字以内）
2. 必要な工具・部品
3. 作業手順（3-5ステップ）
4. 注意点

${description ? `追加情報: ${description}` : ''}`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    const analysis = visionResponse.choices[0].message?.content || ''

    // 2. イラスト生成用プロンプト作成
    const illustrationPrompt = `Simple technical illustration for repair manual: ${analysis.substring(0, 200)}`

    // 3. DALL-E でイラスト生成
    const imageResponse = await client.images.generate({
      model: 'dall-e-3',
      prompt: illustrationPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const illustrationUrl = imageResponse.data[0].url

    res.status(200).json({
      analysis,
      illustrationUrl,
    })
  } catch (error: any) {
    console.error('AI Manual Error:', error)
    res.status(500).json({ error: error.message })
  }
}
