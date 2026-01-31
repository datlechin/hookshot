import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Enable axe-core accessibility testing in development
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    import('react').then((React) => {
      import('react-dom').then((ReactDOM) => {
        axe.default(React, ReactDOM, 1000, {
          rules: [
            // Enable all WCAG 2.1 Level AA rules
            { id: 'color-contrast', enabled: true },
            { id: 'aria-required-children', enabled: true },
            { id: 'aria-required-parent', enabled: true },
            { id: 'label', enabled: true },
            { id: 'button-name', enabled: true },
            { id: 'link-name', enabled: true },
          ],
        })
      })
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
