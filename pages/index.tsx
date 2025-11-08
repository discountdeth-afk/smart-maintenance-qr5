import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold mb-6">Smart Maintenance QR System</h1>
      <p className="mb-10 text-gray-700">
        修理マニュアルをQR化・AIタグ・PDF/Excel出力までワンクリックで。
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/generate">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700">
            📸 QR生成+AIマニュアル
          </button>
        </Link>
        <Link href="/repair">
          <button className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700">
            🔧 修理履歴登録
          </button>
        </Link>
        <Link href="/manage">
          <button className="px-6 py-3 bg-gray-600 text-white rounded-xl shadow-md hover:bg-gray-700">
            📊 一覧とデータ出力
          </button>
        </Link>
      </div>
    </main>
  )
}
