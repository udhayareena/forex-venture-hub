
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WithdrawForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "crypto" | "upi">("bank");
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to make a withdrawal");
        return;
      }

      let bankStatementPath = null;
      if (paymentMethod === "bank" && bankStatement) {
        const fileExt = bankStatement.name.split('.').pop();
        const fileName = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('bank_statements')
          .upload(fileName, bankStatement);

        if (uploadError) throw uploadError;
        bankStatementPath = fileName;
      }

      const withdrawalData: any = {
        user_id: session.user.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
      };

      if (paymentMethod === "bank") {
        withdrawalData.bank_statement_path = bankStatementPath;
        withdrawalData.bank_details = bankDetails;
      } else if (paymentMethod === "crypto") {
        withdrawalData.crypto_address = cryptoAddress;
      } else {
        withdrawalData.upi_id = upiId;
      }

      const { error } = await supabase
        .from('withdrawals')
        .insert(withdrawalData);

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully");
      setAmount("");
      setBankStatement(null);
      setBankDetails({ accountNumber: "", ifscCode: "", accountHolderName: "" });
      setCryptoAddress("");
      setUpiId("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: "bank" | "crypto" | "upi") => setPaymentMethod(value)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank">Bank Transfer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="crypto" id="crypto" />
              <Label htmlFor="crypto">Crypto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi">UPI</Label>
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

        {paymentMethod === "bank" && (
          <>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Enter account number"
                required
              />
            </div>
            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                placeholder="Enter IFSC code"
                required
              />
            </div>
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                placeholder="Enter account holder name"
                required
              />
            </div>
            <div>
              <Label htmlFor="bankStatement">Bank Statement</Label>
              <Input
                id="bankStatement"
                type="file"
                onChange={(e) => setBankStatement(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
            </div>
          </>
        )}

        {paymentMethod === "crypto" && (
          <div>
            <Label htmlFor="cryptoAddress">Crypto Address</Label>
            <Input
              id="cryptoAddress"
              type="text"
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
              placeholder="Enter crypto address"
              required
            />
          </div>
        )}

        {paymentMethod === "upi" && (
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Enter UPI ID"
              required
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Submit Withdrawal"}
        </Button>
      </form>
    </Card>
  );
};
