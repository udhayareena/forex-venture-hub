
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createTradingAccount, getMinimumDeposit, AccountType } from "@/services/AccountService";

interface AccountCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: AccountType;
  userId?: string;
}

export const AccountCreationDialog = ({ isOpen, onClose, accountType, userId }: AccountCreationDialogProps) => {
  const [initialDeposit, setInitialDeposit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const minimumDeposit = getMinimumDeposit(accountType);
  
  const handleCreateAccount = async () => {
    try {
      setIsSubmitting(true);
      
      const deposit = parseFloat(initialDeposit);
      if (isNaN(deposit) || deposit < minimumDeposit) {
        toast.error(`Minimum deposit for this account is $${minimumDeposit}`);
        return;
      }
      
      if (!userId) {
        toast.error("You must be logged in to create an account");
        return;
      }
      
      // Create the account
      const accountId = await createTradingAccount(accountType, deposit, userId);
      
      toast.success(`Account created successfully! Your account ID is ${accountId}`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Open {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="initialDeposit">Initial Deposit</Label>
            <Input
              id="initialDeposit"
              type="number"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              placeholder={`Minimum $${minimumDeposit}`}
              min={minimumDeposit}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum deposit for {accountType} account is ${minimumDeposit}
            </p>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleCreateAccount} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Create Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
