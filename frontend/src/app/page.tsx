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
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Somnia Blockchain</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Voucher & Name Service
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create QR-based vouchers and manage human-readable names on the Somnia blockchain. 
            Built for the hackathon with modern Web3 technology.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* Voucher Redemption */}
          <Card className="group gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300">
                  <Gift className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Voucher Redemption</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Create and redeem QR-based vouchers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <p className="text-muted-foreground leading-relaxed">
                Lock funds with a unique voucher ID and share via QR code. 
                Recipients can redeem vouchers by scanning or pasting the voucher ID.
              </p>
              <div className="flex gap-3">
                <Button asChild className="flex-1 gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                  <Link href="/create-voucher" className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Create Voucher
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                  <Link href="/redeem-voucher" className="flex items-center justify-center gap-2">
                    Redeem Voucher
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Name Service */}
          <Card className="group gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Somnia Name Service</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Human-readable names for addresses
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <p className="text-muted-foreground leading-relaxed">
                Register human-readable names like "rishi.somnia" that map to 
                wallet addresses. Perfect for easy transfers and identification.
              </p>
              <div className="flex gap-3">
                <Button asChild className="flex-1 gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                  <Link href="/name-service" className="flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    Name Service
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              How it works
            </h3>
            <p className="text-muted-foreground text-lg">
              Simple steps to get started with our platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow-primary">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Connect MetaMask</h4>
              <p className="text-muted-foreground leading-relaxed">
                Connect your MetaMask wallet to interact with the Somnia blockchain
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow-primary">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Create or Redeem</h4>
              <p className="text-muted-foreground leading-relaxed">
                Create vouchers with QR codes or redeem existing ones
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow-primary">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Manage Names</h4>
              <p className="text-muted-foreground leading-relaxed">
                Register and manage human-readable names for addresses
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
