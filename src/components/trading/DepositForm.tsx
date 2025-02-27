
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const DepositForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "crypto" | "bank">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountName: "iTradeFX Inc.",
    accountNumber: "1234567890",
    bankName: "Global Finance Bank",
    ifscCode: "GFBK0001234"
  });

  useEffect(() => {
    const fetchQrCode = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('payment_qr_code')
        .single();

      if (data) {
        setQrCode(data.payment_qr_code);
      }
    };

    fetchQrCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to make a deposit");
        return;
      }

      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: session.user.id,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          transaction_id: transactionId,
          qr_code_url: qrCode
        });

      if (error) throw error;

      toast.success("Deposit request submitted successfully");
      setAmount("");
      setTransactionId("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Make a Deposit</h2>
      
      <Tabs defaultValue="deposit-form" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="deposit-form">Deposit Form</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deposit-form">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "upi" | "crypto" | "bank") => setPaymentMethod(value)}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto">Crypto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank">Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "upi" && qrCode && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    View UPI QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Scan QR Code to Pay</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center p-4">
                    <img src={qrCode} alt="Payment QR Code" className="max-w-full h-auto" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Scan with any UPI app to make payment
                  </p>
                </DialogContent>
              </Dialog>
            )}

            {paymentMethod === "crypto" && (
              <div className="space-y-2">
                <Label>Crypto Deposit Address</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-mono">
                  0x1Ab5C8fE9D6fEb89d83c881Ea78F97f1D3dF7f18
                </div>
                <p className="text-xs text-muted-foreground">
                  Send USDT (TRC20) or USDC to this address
                </p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="space-y-2">
                <Label>Bank Account Details</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="col-span-2 font-medium">{bankDetails.accountName}</span>
                    
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="col-span-2 font-medium">{bankDetails.accountNumber}</span>
                    
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="col-span-2 font-medium">{bankDetails.bankName}</span>
                    
                    <span className="text-muted-foreground">IFSC Code:</span>
                    <span className="col-span-2 font-medium">{bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {paymentMethod === "upi" ? "Enter UPI reference number" : 
                 paymentMethod === "crypto" ? "Enter transaction hash" : 
                 "Enter bank transfer reference"}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Submit Deposit"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="payment-methods">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">UPI Payment</h3>
              <p className="text-sm text-muted-foreground">
                Make instant deposits using any UPI app like Google Pay, PhonePe, Paytm, or your bank's UPI app.
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                <li>Instant processing</li>
                <li>No additional fees</li>
                <li>Minimum deposit: $10</li>
              </ul>
              {qrCode && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View UPI QR</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>UPI QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <img src={qrCode} alt="UPI QR Code" className="max-w-full h-auto" />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Cryptocurrency</h3>
              <p className="text-sm text-muted-foreground">
                Deposit using USDT (TRC20) or USDC for secure and fast transactions.
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                <li>Processing time: 10-30 minutes</li>
                <li>Network fee applies</li>
                <li>Minimum deposit: $50</li>
              </ul>
              <div className="p-2 bg-muted rounded-md text-sm font-mono text-xs">
                0x1Ab5C8fE9D6fEb89d83c881Ea78F97f1D3dF7f18
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Bank Transfer</h3>
              <p className="text-sm text-muted-foreground">
                Make a direct bank transfer to our account for larger deposits.
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                <li>Processing time: 1-2 business days</li>
                <li>Bank charges may apply</li>
                <li>Minimum deposit: $100</li>
              </ul>
              <div className="p-3 bg-muted rounded-md text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="col-span-2 font-medium">{bankDetails.accountName}</span>
                  
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="col-span-2 font-medium">{bankDetails.accountNumber}</span>
                  
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="col-span-2 font-medium">{bankDetails.bankName}</span>
                  
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <span className="col-span-2 font-medium">{bankDetails.ifscCode}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
