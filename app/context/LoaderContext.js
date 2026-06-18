"use client"

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const LoaderContext = createContext()

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(0)

  const showLoader = useCallback(() => setLoading(p => p + 1), [])
  const hideLoader = useCallback(() => setLoading(p => Math.max(0, p - 1)), [])

  const value = useMemo(() => ({ loading: loading > 0, showLoader, hideLoader }), [loading, showLoader, hideLoader])

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {loading > 0 && (
        <div className='app-loader-overlay'>
          <div className='loader' />
        </div>
      )}
    </LoaderContext.Provider>
  )
}

export const useLoader = () => useContext(LoaderContext)
