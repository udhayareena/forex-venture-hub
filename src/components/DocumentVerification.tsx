
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileCheck2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ForexChart } from "@/components/ForexChart";
import { BalanceDisplay } from "@/components/trading/BalanceDisplay";
import { DepositForm } from "@/components/trading/DepositForm";
import { WithdrawForm } from "@/components/trading/WithdrawForm";

export const DocumentVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");
  const [idDocUploaded, setIdDocUploaded] = useState(false);
  const [addressDocUploaded, setAddressDocUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to view verification status");
        return;
      }

      const { data, error } = await supabase
        .from("user_verification")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setVerificationStatus(data.verification_status);
        setIdDocUploaded(!!data.id_document_path);
        setAddressDocUploaded(!!data.address_proof_path);
      }
    } catch (error: any) {
      console.error("Error checking verification status:", error);
      toast.error("Failed to check verification status");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: 'id' | 'address') => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        toast.error("Please select a file to upload");
        return;
      }

      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to upload documents");
        return;
      }

      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;

      // First, ensure the storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('verification_docs');

      if (bucketError && bucketError.message.includes('does not exist')) {
        await supabase.storage.createBucket('verification_docs', {
          public: false,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/*', 'application/pdf']
        });
      }

      const { error: uploadError } = await supabase.storage
        .from('verification_docs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Check if a record already exists
      const { data: existingRecord } = await supabase
        .from('user_verification')
        .select('*')
        .eq('id', userId)
        .single();

      const verificationData = {
        id: userId,
        [docType === 'id' ? 'id_document_path' : 'address_proof_path']: fileName,
        verification_status: docType === 'id' && addressDocUploaded || docType === 'address' && idDocUploaded ? 'approved' : 'pending'
      };

      let updateError;
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('user_verification')
          .update(verificationData)
          .eq('id', userId);
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_verification')
          .insert([verificationData]);
        updateError = error;
      }

      if (updateError) throw updateError;

      docType === 'id' ? setIdDocUploaded(true) : setAddressDocUploaded(true);
      
      // If both documents are uploaded, set status to approved
      if ((docType === 'id' && addressDocUploaded) || (docType === 'address' && idDocUploaded)) {
        setVerificationStatus('approved');
        toast.success("Documents verified successfully! You can now access the trading terminal.");
      } else {
        toast.success(`${docType === 'id' ? 'ID Document' : 'Address Proof'} uploaded successfully`);
      }
      
      await checkVerificationStatus();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error uploading document");
    } finally {
      setLoading(false);
    }
  };

  if (verificationStatus === 'approved') {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-2 text-green-500 mb-4">
            <FileCheck2 className="h-8 w-8" />
            <h2 className="text-xl font-semibold">Verification Approved</h2>
          </div>
        </Card>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <BalanceDisplay />
            <DepositForm />
          </div>
          <WithdrawForm />
        </div>
        
        <ForexChart />
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Document Verification</h2>
        <p className="text-muted-foreground">
          Please upload your identification and address proof documents
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block mb-2">
            ID Document
            <span className="text-xs text-muted-foreground ml-2">
              (Passport, Driver's License, or National ID)
            </span>
          </label>
          <div className="mt-2">
            <Button
              variant="outline"
              className="w-full h-24 relative"
              disabled={loading || idDocUploaded}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e, 'id')}
                accept="image/*,.pdf"
                disabled={loading || idDocUploaded}
              />
              {idDocUploaded ? (
                <div className="flex items-center text-green-500">
                  <FileCheck2 className="mr-2" />
                  Uploaded
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="mr-2" />
                  Upload ID Document
                </div>
              )}
            </Button>
          </div>
        </div>

        <div>
          <label className="block mb-2">
            Proof of Address
            <span className="text-xs text-muted-foreground ml-2">
              (Utility Bill, Bank Statement, less than 3 months old)
            </span>
          </label>
          <div className="mt-2">
            <Button
              variant="outline"
              className="w-full h-24 relative"
              disabled={loading || addressDocUploaded}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e, 'address')}
                accept="image/*,.pdf"
                disabled={loading || addressDocUploaded}
              />
              {addressDocUploaded ? (
                <div className="flex items-center text-green-500">
                  <FileCheck2 className="mr-2" />
                  Uploaded
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="mr-2" />
                  Upload Address Proof
                </div>
              )}
            </Button>
          </div>
        </div>

        {verificationStatus === 'pending' && (idDocUploaded || addressDocUploaded) && (
          <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">
              Please upload both documents to access the trading terminal.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
