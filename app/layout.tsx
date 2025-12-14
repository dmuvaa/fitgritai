import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./global.css"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "FitGrit AI - Stop Making Excuses, Start Losing Weight",
  description:
    "AI-powered weight loss companion with honest feedback and personalized guidance. Track progress, get tough-love coaching, and achieve real results.",
  keywords: "weight loss, AI coach, fitness tracking, health app, accountability, nutrition",
  authors: [{ name: "FitGrit AI Team" }],
  openGraph: {
    title: "FitGrit AI - AI-Powered Weight Loss",
    description: "Stop making excuses. Start losing weight with honest AI guidance.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitGrit AI - AI-Powered Weight Loss",
    description: "Stop making excuses. Start losing weight with honest AI guidance.",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "FitGrit AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "Inter, system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  )
}
