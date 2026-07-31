import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Rodrigo Burdet | Portfolio',
  description: 'Personal portfolio of Rodrigo Burdet, Software Engineer and Problem Solver',
  generator: 'v0.dev',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="font-mono">
        {children}
        <Script
          id="register-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(error) {
                      console.log('Service Worker registration failed: ', error);
                    }
                  );
                });
              }
            `,
          }}
        />
        <Script src="/pwa-status.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
