'use client'

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Users, QrCode, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 glow-primary">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Somnia ENS
            </h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Somnia Blockchain</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Voucher & Name Service
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamlessly create QR-based vouchers and manage human-readable names on the Somnia blockchain — built for speed, simplicity, and security.
          </p>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-2 gap-8 mb-24">
          {/* Name Service */}
          <Card className="group gradient-card border-border/40 hover:border-primary/50 transition-all duration-300 hover:glow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Somnia Name Service</CardTitle>
                  <CardDescription>Human-readable blockchain names</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 z-10 relative">
              <p className="text-muted-foreground leading-relaxed">
                Register memorable names like <code>you.somnia</code> linked to wallet addresses. Streamline transactions and identity on-chain.
              </p>
              <Button asChild className="w-full gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                <Link href="/name-service" className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 mr-2" />
                  Launch Name Service
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Voucher Redemption */}
          <Card className="group gradient-card border-border/40 hover:border-primary/50 transition-all duration-300 hover:glow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300">
                  <Gift className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Voucher Redemption</CardTitle>
                  <CardDescription>Create & redeem QR vouchers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 z-10 relative">
              <p className="text-muted-foreground leading-relaxed">
                Lock tokens behind a unique voucher ID and redeem via QR code or ID. Perfect for gifts, promos, or secure fund transfers.
              </p>
              <div className="flex gap-3">
                <Button asChild className="w-full gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                  <Link href="/create-voucher" className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 mr-2" />
                    Create Voucher
                  </Link>
                </Button>
                <Button asChild className="w-full gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                  <Link href="/redeem-voucher" className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 mr-2" />
                    Redeem Voucher
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How it Works */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              How It Works
            </h3>
            <p className="text-muted-foreground text-lg">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Connect Wallet", desc: "Use MetaMask to connect and authenticate securely." },
              { step: "2", title: "Create or Redeem", desc: "Generate QR-based vouchers or redeem them easily." },
              { step: "3", title: "Manage Names", desc: "Reserve and edit your Somnia-readable name." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow-primary">
                  <span className="text-2xl font-bold text-primary">{step}</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">{title}</h4>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
