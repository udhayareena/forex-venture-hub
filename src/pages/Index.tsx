
import { AuthForm } from "@/components/auth/AuthForm";
import { ChevronRight, Shield, Zap, Download, Monitor, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceDisplay } from "@/components/trading/BalanceDisplay";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/integrations/firebase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AccountCreationDialog } from "@/components/trading/AccountCreationDialog";
import { AccountType } from "@/services/AccountService";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>("standard");
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setUserId(user?.uid);
    });

    return () => unsubscribe();
  }, [auth]);
  
  const openAccountDialog = (accountType: AccountType) => {
    setSelectedAccountType(accountType);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-8 px-6 md:px-12 lg:px-24 bg-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/54d3d90c-1c8e-4006-82de-078744600d13.png" 
                alt="iTradeFX Logo" 
                className="h-12 w-auto shadow-lg rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary/70">
                  iTradeFX
                </h1>
                <p className="text-sm text-muted-foreground">
                  Professional Trading Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <BalanceDisplay />
              {!isAuthenticated && (
                <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                  Start Trading <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {isAuthenticated ? (
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Open Trading Account</CardTitle>
                <CardDescription>
                  Start your trading journey with iTradeFX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Standard Account</h3>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span>Minimum deposit: $100</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-green-500" />
                        <span>Leverage up to 1:100</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-green-500" />
                        <span>Full MT4/MT5 access</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      onClick={() => openAccountDialog("standard")}
                    >
                      Open Standard Account
                    </Button>
                  </Card>

                  <Card className="p-6 border-secondary">
                    <h3 className="text-xl font-semibold mb-4">Premium Account</h3>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-secondary" />
                        <span>Minimum deposit: $1000</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-secondary" />
                        <span>Leverage up to 1:200</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-secondary" />
                        <span>Advanced trading tools</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => openAccountDialog("premium")}
                    >
                      Open Premium Account
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">VIP Account</h3>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <span>Minimum deposit: $10,000</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        <span>Leverage up to 1:400</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-purple-500" />
                        <span>Personal account manager</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      onClick={() => openAccountDialog("vip")}
                    >
                      Open VIP Account
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-xl font-medium text-secondary">
                    Maximize Your Potential, Minimize Your Risk
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Access global forex markets with advanced trading tools, real-time analytics, and expert insights.
                  </p>
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
              <AuthForm />
            </div>
          )}
        </div>
      </section>

      {isAuthenticated && (
        <>
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
                  <Monitor className="h-10 w-10 text-secondary mb-4" />
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
        </>
      )}
      
      {/* Account Creation Dialog */}
      <AccountCreationDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        accountType={selectedAccountType}
        userId={userId}
      />
    </div>
  );
};

export default Index;
