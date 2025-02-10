
import { AuthForm } from "@/components/auth/AuthForm";
import { ChevronRight, LineChart, Shield, Zap, Download, Monitor, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForexChart } from "@/components/ForexChart";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                  iTradeFX - Professional Trading Platform
                </span>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Welcome to iTradeFX
                </h1>
                <p className="text-lg text-muted-foreground">
                  Access global forex markets with advanced trading tools, real-time analytics, and expert insights.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  Start Trading <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-muted-foreground">Market Access</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0.01%</div>
                  <div className="text-sm text-muted-foreground">Low Spread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100+</div>
                  <div className="text-sm text-muted-foreground">Currency Pairs</div>
                </div>
              </div>
            </div>
            <div className="lg:pl-12">
              <AuthForm />
            </div>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <ForexChart />
        </div>
      </section>

      {/* MT4 Platforms Section */}
      <section className="py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Download MT4 Trading Platforms</h2>
            <p className="text-muted-foreground mt-4">
              Access the markets from anywhere with our powerful trading platforms
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass p-6 rounded-2xl text-center">
              <Monitor className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">MT4 Desktop</h3>
              <p className="text-muted-foreground mb-6">
                Advanced trading platform for Windows
              </p>
              <Button className="w-full" variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Download for Windows
              </Button>
            </div>
            <div className="glass p-6 rounded-2xl text-center">
              <Monitor className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">MT4 Web Terminal</h3>
              <p className="text-muted-foreground mb-6">
                Trade directly from your browser
              </p>
              <Button className="w-full" variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Launch WebTrader
              </Button>
            </div>
            <div className="glass p-6 rounded-2xl text-center lg:col-span-1 md:col-span-2 lg:col-start-3">
              <Phone className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">MT4 Mobile</h3>
              <p className="text-muted-foreground mb-6">
                Trade on the go with our mobile apps
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary">
                  <Download className="mr-2 h-4 w-4" /> iOS
                </Button>
                <Button variant="secondary">
                  <Download className="mr-2 h-4 w-4" /> Android
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Us</h2>
            <p className="text-muted-foreground mt-4">
              Experience the advantages of trading with a trusted platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-6 rounded-2xl">
              <LineChart className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Real-time market analysis and professional trading tools
              </p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <Shield className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Trading</h3>
              <p className="text-muted-foreground">
                Industry-leading security measures to protect your assets
              </p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <Zap className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Execution</h3>
              <p className="text-muted-foreground">
                Lightning-fast trade execution with minimal slippage
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
