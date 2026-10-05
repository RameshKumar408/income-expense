"use client"

import { LoaderProvider } from './context/LoaderContext'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

export default function AppWrapper({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingToast = window.sessionStorage.getItem('pendingToast')
      const pendingToastType = window.sessionStorage.getItem('pendingToastType') || 'success'
      
      if (pendingToast) {
        setTimeout(() => {
          if (pendingToastType === 'error') {
            toast.error(pendingToast)
          } else {
            toast.success(pendingToast)
          }
        }, 500)
        window.sessionStorage.removeItem('pendingToast')
        window.sessionStorage.removeItem('pendingToastType')
      }
    }
  }, [])

  return <LoaderProvider>{children}</LoaderProvider>
}
