//app/auth/reset-password/page.tsx

import { Suspense } from "react"
import ResetPasswordClient from "./ResetPasswordClient"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main style={{ background: '#EDEAE2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading…</p>
      </main>
    }>
      <ResetPasswordClient />
    </Suspense>
  )
}