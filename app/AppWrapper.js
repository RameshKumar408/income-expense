"use client"

import { LoaderProvider } from './context/LoaderContext'

export default function AppWrapper({ children }) {
  return <LoaderProvider>{children}</LoaderProvider>
}
