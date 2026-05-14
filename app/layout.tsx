import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { Suspense } from 'react'
import "./globals.css"
import { ProgressBar } from '@/components/providers/progress-bar'

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "LumichFlock",
  description: "ERP sistem peternakan ayam petelur",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#7aadd4",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense>
          <ProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
