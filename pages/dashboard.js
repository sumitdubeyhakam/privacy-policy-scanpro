import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.json()
      )
    ])
      .then(([meData, statsData]) => {
        if (!meData.business) {
          router.push('/login');
          return;
        }
        setBusiness(meData.business);
        setStats(statsData);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const reviewUrl = business
    ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}/review/${business.id}`
    : '';

  const qrUrl = reviewUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reviewUrl)}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(reviewUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareQr = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Leave us a review!', url: reviewUrl });
    } else {
      copyLink();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-700">{business.business_name}</h1>
            <p className="text-xs text-gray-400">{business.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reviews" value={stats.total} color="border-indigo-500" />
            <StatCard label="Positive" value={stats.positive} color="border-green-500" />
            <StatCard label="Negative Feedback" value={stats.negative} color="border-red-400" />
            <StatCard label="Avg Rating" value={stats.avg} color="border-yellow-400" />
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Your Review QR Code</h2>
          <p className="text-sm text-gray-500 mb-4">
            Print or display this QR code for customers to scan and leave a review.
          </p>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="Review QR code"
                className="w-48 h-48 rounded-lg border border-gray-200"
              />
            )}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={reviewUrl}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50"
                />
                <button
                  onClick={copyLink}
                  className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex gap-3">
                <a
                  href={qrUrl}
                  download="review-qr.png"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Download QR
                </a>
                <button
                  onClick={shareQr}
                  className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
                >
                  Share
                </button>
              </div>
              {business.google_review_link && (
                <a
                  href={business.google_review_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:underline"
                >
                  View your Google Reviews →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        {stats && stats.recent && stats.recent.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Customer</th>
                    <th className="pb-2 pr-4">Service</th>
                    <th className="pb-2 pr-4">Rating</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{r.customer_name}</td>
                      <td className="py-2 pr-4 text-gray-500">{r.service || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className="text-yellow-500">{'★'.repeat(r.experience_rating)}</span>
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.review_type === 'positive'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {r.review_type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400 text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Negative Feedback */}
        {stats && stats.feedbacks && stats.feedbacks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Feedback</h2>
            <div className="space-y-3">
              {stats.feedbacks.map((f, i) => (
                <div key={i} className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">&ldquo;{f.feedback_message}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-1">
                    — {f.customer_name} · {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
