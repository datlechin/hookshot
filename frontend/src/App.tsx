import { useState } from 'react'
import { Moon, Sun, Github } from 'lucide-react'
import { Button } from '@/components/ui/index.ts'

function App() {
  const [darkMode, setDarkMode] = useState(true)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--accent-blue)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <h1 className="text-xl font-bold">Hookshot</h1>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://github.com/datlechin/hookshot', '_blank')}
                  aria-label="View on GitHub"
                >
                  <Github className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-[var(--text-primary)]">Welcome to Hookshot</h2>
              <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                A self-hosted webhook testing tool built with Rust, React, and TypeScript. Test and
                debug your webhooks with ease.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button variant="primary" size="lg">
                Create Endpoint
              </Button>
              <Button variant="secondary" size="lg">
                View Requests
              </Button>
              <Button variant="outline" size="lg">
                Documentation
              </Button>
              <Button variant="ghost" size="lg">
                Learn More
              </Button>
              <Button variant="danger" size="lg">
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="text-[var(--accent-blue)] mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20">
                <span className="w-2 h-2 bg-[var(--accent-green)] rounded-full mr-2 animate-pulse"></span>
                Frontend Setup Complete
              </span>
            </div>
          </div>
        </main>

        <footer className="border-t border-[var(--border)] mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-[var(--text-tertiary)] text-sm">
              Built with Vite, React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: 'Real-time Updates',
    description: 'WebSocket-based live updates when requests arrive at your endpoints',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    ),
    title: 'Custom Responses',
    description: 'Configure custom status codes, headers, and response bodies for testing',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: 'Request Inspection',
    description: 'View detailed information about headers, body, and metadata for each request',
  },
]

export default App
