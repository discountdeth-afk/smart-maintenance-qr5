import { useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'

export default function Generate() {
  const [url, setUrl] = useState('')
  const [qr, setQr] = useState('')
  const [aiTags, setAiTags] = useState<string[]>([])
  const [desc, setDesc] = useState('')
  const [uploadedImage, setUploadedImage] = useState('')
  const [manual, setManual] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 画像アップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string

      // Vercel Blobにアップロード
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          filename: `repair-${Date.now()}.jpg`,
        }),
      })
      const data = await res.json()
      setUploadedImage(data.url)
      setUrl(data.url) // QRコードのURLとしても使用
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  // AI自動マニュアル生成
  const handleGenerateManual = async () => {
    if (!uploadedImage) return alert('画像をアップロードしてください')

    setLoading(true)
    const res = await fetch('/api/ai-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: uploadedImage,
        description: desc,
      }),
    })
    const data = await res.json()
    setManual(data)
    setLoading(false)
  }

  // QRコード生成＋DB保存
  const handleGenerate = async () => {
    if (!url) return alert('URLまたは画像をアップロードしてください')

    const qrCode = await QRCode.toDataURL(url)
    setQr(qrCode)

    // AIタグ提案
    const tagRes = await fetch('/api/ai-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desc: manual?.analysis || desc }),
    })
    const tagData = await tagRes.json()
    setAiTags(tagData.tags || [])

    // Supabaseに保存
    const { data, error } = await supabase.from('qr_codes').insert({
      url,
      description: desc,
      qr_image: qrCode,
      tags: tagData.tags,
    }).select()

    if (error) console.error('DB Error:', error)
    else alert('QRコードを保存しました！')
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">📸 QRコード自動生成 + AIマニュアル作成</h1>

      {/* 画像アップロード */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <label className="block font-bold mb-2">修理作業の写真をアップロード</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border p-2 w-full rounded"
        />
        {uploadedImage && (
          <img src={uploadedImage} alt="Uploaded" className="mt-3 max-w-md mx-auto" />
        )}
      </div>

      {/* 説明入力 */}
      <textarea
        className="border p-2 w-full rounded mb-3"
        placeholder="作業内容の説明（AIマニュアル生成用）"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      {/* AIマニュアル生成 */}
      {uploadedImage && (
        <button
          onClick={handleGenerateManual}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded mb-4 disabled:bg-gray-400"
        >
          {loading ? '生成中...' : '🤖 AIマニュアル自動生成'}
        </button>
      )}

      {/* マニュアル表示 */}
      {manual && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-bold text-lg mb-2">📋 自動生成マニュアル</h3>
          <pre className="whitespace-pre-wrap text-sm mb-3">{manual.analysis}</pre>
          {manual.illustrationUrl && (
            <img src={manual.illustrationUrl} alt="Illustration" className="max-w-md mx-auto" />
          )}
        </div>
      )}

      {/* QRコード生成 */}
      <input
        className="border p-2 w-full rounded mb-3"
        placeholder="または直接URLを入力"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        QRコード生成＋保存
      </button>

      {/* QRコード表示 */}
      {qr && (
        <div className="mt-6 bg-white p-4 rounded shadow text-center">
          <img src={qr} alt="QR" className="mx-auto" />
          <p className="mt-2 text-sm break-words">{url}</p>
          {aiTags.length > 0 && (
            <div className="mt-3">
              <p className="font-bold">AI提案タグ：</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {aiTags.map((tag, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
