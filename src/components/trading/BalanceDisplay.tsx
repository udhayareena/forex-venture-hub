
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type TransferDirection = "to_trading" | "to_wallet";

export const BalanceDisplay = () => {
  const [walletBalance, setWalletBalance] = useState<number>(1000); // Default balance for demo
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferDirection, setTransferDirection] = useState<TransferDirection>("to_trading");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    try {
      setIsTransferring(true);
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Check if sufficient balance
      if (amount > walletBalance) {
        toast.error("Insufficient balance");
        return;
      }

      // Mock transfer - in a real app, this would update the database
      setTimeout(() => {
        setWalletBalance(prev => prev - amount);
        toast.success("Transfer completed successfully");
        setTransferAmount("");
        setIsTransferring(false);
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.message);
      setIsTransferring(false);
    }
  };

  return (
    <Card className="p-6 mb-0">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Wallet Balance</h2>
          <p className="text-3xl font-bold text-secondary">${walletBalance.toFixed(2)}</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Transfer Funds</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Transfer Direction</Label>
                <RadioGroup
                  value={transferDirection}
                  onValueChange={(value: TransferDirection) => setTransferDirection(value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="to_trading" id="to_trading" />
                    <Label htmlFor="to_trading">Wallet → Trading</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="to_wallet" id="to_wallet" />
                    <Label htmlFor="to_wallet">Trading → Wallet</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleTransfer}
                disabled={isTransferring || !transferAmount}
              >
                {isTransferring ? "Processing..." : "Confirm Transfer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
