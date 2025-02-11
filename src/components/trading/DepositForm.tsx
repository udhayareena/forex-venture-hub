
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DepositForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "crypto">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: "upi" | "crypto") => setPaymentMethod(value)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi">UPI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="crypto" id="crypto" />
              <Label htmlFor="crypto">Crypto</Label>
            </div>
          </RadioGroup>
        </div>

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
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Submit Deposit"}
        </Button>
      </form>
    </Card>
  );
};
