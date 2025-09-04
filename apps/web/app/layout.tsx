import '@repo/ui/styles.css'
import './globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'zapChat',
  description: 'A chat app built with Next.js, Turborepo, and Tailwind CSS'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={geist.className}>
        {' '}
        <Toaster
          position='top-center'
          toastOptions={{
            style: {
              background: '#2e2e2e',
              color: '#fff'
            }
          }}
        />
        {children}
      </body>
    </html>
  )
}
