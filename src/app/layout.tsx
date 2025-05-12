import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: '天地图 GIS应用',
  description: '基于天地图API的WebGIS应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <Script 
          id="tianditu-heatmap-script"
          src="https://lbs.tianditu.gov.cn/api/js4.0/opensource/openlibrary/HeatmapOverlay.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
} 