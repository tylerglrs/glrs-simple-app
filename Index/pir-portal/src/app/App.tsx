import { BrowserRouter } from 'react-router-dom'
import { Providers } from './providers'
import { AppRoutes } from './routes'
import { InstallPrompt } from '@/components/InstallPrompt'
import { NotificationToast, NotificationPermissionPrompt } from '@/components/NotificationToast'

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
        <InstallPrompt />
        <NotificationToast />
        <NotificationPermissionPrompt />
      </Providers>
    </BrowserRouter>
  )
}

export default App
