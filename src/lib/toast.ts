import { toast as hotToast, ToastOptions } from 'react-hot-toast'

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
}

export const toast = {
  success: (message: string, options?: ToastOptions) => 
    hotToast.success(message, { ...defaultOptions, ...options }),
  
  error: (message: string, options?: ToastOptions) => 
    hotToast.error(message, { ...defaultOptions, ...options }),
  
  loading: (message: string, options?: ToastOptions) => 
    hotToast.loading(message, { ...defaultOptions, ...options }),
  
  dismiss: hotToast.dismiss,
} 