"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const LoaderContext = createContext()

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Fallback: hide splash after a maximum of 2 seconds if no loader is triggered
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading > 0 || initialLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading, initialLoading]);

  const showLoader = useCallback(() => setLoading(p => p + 1), [])
  const hideLoader = useCallback(() => {
    setLoading(p => Math.max(0, p - 1))
    setInitialLoading(false) // Hide splash screen when first data fetch completes
  }, [])

  const value = useMemo(() => ({ loading: loading > 0, showLoader, hideLoader }), [loading, showLoader, hideLoader])

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {(loading > 0 || initialLoading) && (
        <div className='app-loader-overlay' style={{ background: initialLoading ? '#000000' : 'rgba(0, 0, 0, 0.72)', zIndex: 99999 }}>
          {initialLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <img src="/icon.png" alt="Splash Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                <div className='skype-loader' style={{ transform: 'scale(0.8)' }}>
                  <div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div>
                </div>
            </div>
          ) : (
            <div className='skype-loader'>
              <div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>
          )}
        </div>
      )}
    </LoaderContext.Provider>
  )
}

export const useLoader = () => useContext(LoaderContext)
