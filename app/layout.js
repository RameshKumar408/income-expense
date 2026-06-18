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
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        <ToastContainer />
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
