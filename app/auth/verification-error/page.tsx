export default function AuthVerificationError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-red-500">✗</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-6">
          The verification link is invalid or has expired.
        </p>
        <div className="space-y-3">
          <a
            href="/auth/signin"
            className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 font-medium"
          >
            Go to Sign In
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
