import { Inter } from "next/font/google";
import "./globals.css";
import "./createDetail/createdeails.css";
import "./loginRegister.css";
import "@/components/PrimaryButton.css";
import { ToastContainer } from 'react-toastify';
import AppWrapper from './AppWrapper';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Expenses Tracker",
  description: "Track your income and expenses",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Expenses",
    statusBarStyle: "default",
    startupImage: [
      {
        url: "/apple-touch-icon.png",
      },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-font="Inter"
      suppressHydrationWarning
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var f = localStorage.getItem('appFont') || 'Inter';
                  document.documentElement.setAttribute('data-font', f);

                  // Fast-track unauthenticated users on protected entry to login
                  if (
                    (window.location.pathname === '/createDetail' || window.location.pathname === '/viewDetails') &&
                    !localStorage.getItem('token')
                  ) {
                    window.location.replace('/');
                  }

                  // Fast-track authenticated users straight to createDetail without waiting for full login bundle hydration
                  if (
                    window.location.pathname === '/' &&
                    localStorage.getItem('token') &&
                    !window.location.search.includes('add=1')
                  ) {
                    window.location.replace('/createDetail');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Expenses" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={inter.variable}
        style={{ backgroundColor: "#000000", color: "#ffffff" }}
        suppressHydrationWarning
      >
        <ToastContainer 
          autoClose={3000}
          closeOnClick 
          theme="dark" 
          hideProgressBar={true}
          toastClassName="liquid-toast-container"
          bodyClassName="liquid-toast-body"
        />
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
