import './globals.css'
import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
} 