import './index.css'
import './app/theme'
import './i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { registerServiceWorker } from './realtime/push'
import { ConfirmProvider } from './ui/dialog'
import { TooltipProvider } from './ui/feedback'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true, throwOnError: (_error, query) => query.state.data === undefined } },
})

void registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider delayDuration={300}>
          <ConfirmProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ConfirmProvider>
        </TooltipProvider>
        <Toaster position="top-right" offset={16} gap={8} visibleToasts={4} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
