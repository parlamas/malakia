export default function AuthVerificationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-green-500">✓</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now sign in to your account.
        </p>
        <div className="space-y-3">
          <a
            href="/auth/signin"
            className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 font-medium"
          >
            Sign In Now
          </a>
          <a
            href="/"
            className="block w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 font-medium"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}
