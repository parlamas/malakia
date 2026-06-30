//app/auth/page.tsx

export default function AuthIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Welcome to Malakia</h1>
        <div className="space-y-4">
          <a 
            href="/auth/signin" 
            className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 font-medium"
          >
            Sign In
          </a>
          <a 
            href="/auth/signup" 
            className="block w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 font-medium"
          >
            Create Account
          </a>
          <div className="pt-4 border-t mt-6">
            <p className="text-gray-600 text-sm">
              Having issues with verification links?<br/>
              Please try clearing your browser cache or use an incognito window.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
