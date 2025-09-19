'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { useState } from 'react'

interface QRCodeDisplayProps {
  voucherId: string
  amount: string
  onCopy?: () => void
}

export function QRCodeDisplay({ voucherId, amount, onCopy }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucherId)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `voucher-${voucherId.slice(0, 8)}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto gradient-card border-border/50 glow-card">
      <CardHeader className="text-center pb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Voucher Created</span>
        </div>
        <CardTitle className="text-2xl">Success!</CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Amount: <span className="font-semibold text-primary">{amount} SOM</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center p-6 bg-card rounded-2xl border border-border/50">
          <QRCodeSVG
            id="qr-code-svg"
            value={voucherId}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Voucher ID:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={voucherId}
              readOnly
              className="flex-1 px-4 py-3 text-sm bg-muted border border-border rounded-xl font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1 flex items-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Download QR
          </Button>
        </div>

        <div className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-xl">
          Share this QR code or voucher ID with someone to redeem the voucher
        </div>
      </CardContent>
    </Card>
  )
}
