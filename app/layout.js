import { Inter } from "next/font/google";
import "./globals.css";
import "./createDetail/createdeails.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppWrapper from './AppWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expenses Tracker",
  description: "Track your income and expenses",
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Expenses",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Expenses" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <ToastContainer 
          closeOnClick 
          theme="dark" 
          toastClassName="liquid-toast-container"
          bodyClassName="liquid-toast-body"
        />
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
