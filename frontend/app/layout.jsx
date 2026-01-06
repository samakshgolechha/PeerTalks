import NavBar from '@/components/NavBar'
import './globals.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'PeerTalks',
  description: 'Chatting with Peers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Balinese&display=swap" rel="stylesheet"></link>
      </head>
      <body className='relative selection:bg-primary-400 selection:text-white' style={{ fontFamily: "Poppins, sans-serif" }} >
      <ToastContainer
        pauseOnHover={false}
        autoClose={2000}
      />
        <NavBar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
