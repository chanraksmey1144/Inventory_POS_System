import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import '@/app/providers/i18n'
import App from './App.jsx'
import useThemeStore from '@/app/store/useThemeStore'
import { setLanguage } from '@/app/providers/i18n'
import ToastViewport from '@/components/ui/Toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
})

useThemeStore.getState().init()
setLanguage(localStorage.getItem('language') || 'en')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastViewport />
    </QueryClientProvider>
  </StrictMode>,
)
