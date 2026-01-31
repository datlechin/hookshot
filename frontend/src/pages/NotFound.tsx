import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

export function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-(--background)">
      <div className="max-w-md p-6 text-center">
        <AlertCircle className="w-16 h-16 text-(--accent-yellow) mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2 text-(--text-primary)">404</h1>
        <h2 className="text-xl font-semibold mb-4 text-(--text-primary)">Page Not Found</h2>
        <p className="text-(--text-secondary) mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => (window.location.href = '/')}>Go to Home</Button>
      </div>
    </div>
  )
}
