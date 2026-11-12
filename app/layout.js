import { Inter, DM_Sans, Manrope, Plus_Jakarta_Sans } from "next/font/google";
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

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

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
    statusBarStyle: "black",
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
    <html lang="en" data-font="Inter" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var f = localStorage.getItem('appFont') || 'Inter';
                  document.documentElement.setAttribute('data-font', f);

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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Expenses" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${inter.variable} ${dmSans.variable} ${manrope.variable} ${plusJakartaSans.variable}`}
        suppressHydrationWarning
      >
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
