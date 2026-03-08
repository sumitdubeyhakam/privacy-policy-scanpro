import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">ReviewGrow</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Collect more 5-star reviews. Grow your business.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/signup"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition"
          >
            Get Started — Sign Up Free
          </Link>
          <Link
            href="/login"
            className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition"
          >
            Log In
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-sm text-gray-600">Mobile-first customer funnel</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-1">⭐</div>
            <p className="text-sm text-gray-600">AI-suggested review text</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-sm text-gray-600">Live dashboard & QR code</p>
          </div>
        </div>
      </div>
    </div>
  );
}
