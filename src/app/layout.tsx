import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { SessionProvider } from "next-auth/react";
import './globals.css'
import Sidebar from '@/components/Sidebar'
import ClientSessionProvider from './ClientSesionProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'User Management System',
  description: 'Manage users efficiently and securely',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientSessionProvider>
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <Sidebar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
    
    </ClientSessionProvider>
  )
}