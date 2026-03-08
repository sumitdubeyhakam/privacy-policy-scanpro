import { useState } from 'react';

const STEPS = {
  FORM: 'form',
  RATING: 'rating',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  DONE: 'done'
};

function StarRating({ value, onChange, label }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-3xl transition ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:scale-110`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage({ businessId, businessName, googleReviewLink }) {
  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState({
    customer_name: '',
    phone_number: '',
    service: '',
    staff: ''
  });
  const [experienceRating, setExperienceRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [aiText, setAiText] = useState('');
  const [reviewId, setReviewId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitReview = async () => {
    if (!form.customer_name || !form.phone_number) {
      setError('Name and phone number are required.');
      return;
    }
    if (experienceRating === 0) {
      setError('Please rate your experience.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          customer_name: form.customer_name,
          phone_number: form.phone_number,
          service: form.service,
          staff: form.staff,
          experience_rating: experienceRating,
          staff_behavior_rating: staffRating
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setReviewId(data.review_id);
      if (data.review_type === 'positive') {
        setAiText(data.ai_review_text || '');
        setStep(STEPS.POSITIVE);
      } else {
        setStep(STEPS.NEGATIVE);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyAndRedirect = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(aiText);
      copied = true;
      setTextCopied(true);
    } catch {
      // Clipboard unavailable — alert user
      alert('Could not copy automatically. Please copy the text manually before proceeding.');
    }
    // Mark as clicked
    if (reviewId) {
      fetch('/api/review/mark-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId })
      }).catch(() => {});
    }
    if (copied && googleReviewLink) {
      setTimeout(() => {
        window.location.href = googleReviewLink;
      }, 800);
    } else if (!copied && googleReviewLink) {
      // Still redirect after a longer pause so user can copy manually
      setTimeout(() => {
        window.location.href = googleReviewLink;
      }, 3000);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      setError('Please enter your feedback.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/review/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, feedback_message: feedbackText })
      });
      if (res.ok) {
        setFeedbackSent(true);
        setStep(STEPS.DONE);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit feedback.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 flex items-start justify-center p-4 pt-8">
      <div className="max-w-md w-full">
        {/* Step: Info Form */}
        {step === STEPS.FORM && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {businessName ? `Share Your Experience at ${businessName}` : 'Share Your Experience'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Tell us about your visit — it only takes a minute!
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service / Product
                </label>
                <input
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. Teeth Cleaning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member (optional)
                </label>
                <input
                  name="staff"
                  value={form.staff}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. Dr. Rao"
                />
              </div>

              <StarRating
                value={experienceRating}
                onChange={setExperienceRating}
                label="How was your overall experience? *"
              />
              <StarRating
                value={staffRating}
                onChange={setStaffRating}
                label="How was the staff behaviour?"
              />

              <button
                onClick={submitReview}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Positive — show AI text and redirect */}
        {step === STEPS.POSITIVE && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Thank you so much!</h2>
            <p className="text-sm text-gray-500 mb-4">
              We&apos;ve drafted a Google review for you. Just copy it and paste it on Google!
            </p>
            <textarea
              readOnly
              value={aiText}
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 mb-4 resize-none"
            />
            <button
              onClick={copyAndRedirect}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition mb-3"
            >
              {textCopied ? '✓ Copied! Opening Google…' : 'Copy & Post Review on Google'}
            </button>
            {!googleReviewLink && (
              <p className="text-xs text-gray-400">
                (No Google link configured for this business yet)
              </p>
            )}
          </div>
        )}

        {/* Step: Negative — collect feedback */}
        {step === STEPS.NEGATIVE && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-3 text-center">😔</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
              We&apos;re sorry to hear that
            </h2>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Your feedback helps us improve. Please tell us what went wrong.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
              placeholder="Tell us what we can do better…"
            />
            <button
              onClick={submitFeedback}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send Feedback'}
            </button>
          </div>
        )}

        {/* Step: Done */}
        {step === STEPS.DONE && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Feedback received!</h2>
            <p className="text-sm text-gray-500">
              Thank you for letting us know. We&apos;ll use your feedback to improve our service.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/business/${id}`);
    if (!res.ok) {
      return { notFound: true };
    }
    const data = await res.json();
    return {
      props: {
        businessId: data.business.id,
        businessName: data.business.business_name,
        googleReviewLink: data.business.google_review_link || null
      }
    };
  } catch {
    return { notFound: true };
  }
}
