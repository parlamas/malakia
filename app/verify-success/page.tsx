// app/auth/verification-success/page.tsx

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verified Successfully!</h1>
          <p className="text-gray-600">
            Your email address has been verified. You can now sign in to your account.
          </p>
        </div>
        
        <a
          href="/auth/signin"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 font-medium"
        >
          Sign In Now
        </a>
      </div>
    </div>
  );
}