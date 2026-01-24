import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface MemberCardData {
  id: string;
  memberId: string;
  membershipNumber: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberCity?: string;
  memberAddress?: string;
  cardNumber: string;
  qrCodeUrl?: string;
  cardImageUrl?: string;
  isGenerated: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemberICardProps {
  iCard: MemberCardData | null;
  isLoading: boolean;
  error?: string;
  onDownload?: () => void;
}

export default function MemberICard({ iCard, isLoading, error, onDownload }: MemberICardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      handleSimpleDownload();
      onDownload?.();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSimpleDownload = () => {
    // Create a simple canvas-based download
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    if (!ctx || !iCard) return;

    // Background
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText("MWSS Member I-Card", 30, 50);

    // Membership Number
    ctx.font = "bold 18px Arial";
    ctx.fillText(`Card Number: ${iCard.cardNumber}`, 30, 100);

    // Member Details
    ctx.font = "14px Arial";
    ctx.fillText(`Name: ${iCard.memberName}`, 30, 150);
    ctx.fillText(`Email: ${iCard.memberEmail}`, 30, 180);
    ctx.fillText(`Phone: ${iCard.memberPhone}`, 30, 210);
    ctx.fillText(`Membership No: ${iCard.membershipNumber}`, 30, 240);

    // Validity
    ctx.font = "12px Arial";
    ctx.fillText(`Valid From: ${iCard.validFrom} | Valid Until: ${iCard.validUntil}`, 30, 290);

    // Generate ID
    ctx.fillStyle = "#fbbf24";
    ctx.font = "12px Arial";
    ctx.fillText(`Generated on: ${format(new Date(iCard.createdAt), "dd-MM-yyyy")}`, 30, 320);

    // Download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${iCard.memberName.replace(/\s+/g, "_")}_icard.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your I-Card...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !iCard) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-3" />
          <p className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
            I-Card Not Available
          </p>
          <p className="text-sm text-orange-800 dark:text-orange-300">
            {error || "Your I-Card will be generated once your membership payment is verified by the admin. Please wait 24-48 hours."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Member I-Card / सदस्य आई-कार्ड</h2>
        <Button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download I-Card
            </>
          )}
        </Button>
      </div>

      <div ref={cardRef} className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-8 text-white shadow-2xl">
        {/* Card Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold">MWSS</h3>
          <p className="text-sm text-blue-200">Manav Welfare Seva Society</p>
          <p className="text-xs text-blue-300">Member Identity Card</p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Member Name */}
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-wider">Member Name</p>
            <p className="text-xl font-bold">{iCard.memberName}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-blue-400 pt-4">
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Membership Number</p>
              <p className="text-sm font-semibold">{iCard.membershipNumber}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Card Number</p>
              <p className="text-sm font-semibold">{iCard.cardNumber}</p>
            </div>

            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Email</p>
              <p className="text-xs">{iCard.memberEmail}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Phone</p>
              <p className="text-xs">{iCard.memberPhone}</p>
            </div>

            {iCard.memberCity && (
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider">City</p>
                <p className="text-xs">{iCard.memberCity}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Status</p>
              <p className="text-xs font-semibold">Active</p>
            </div>
          </div>

          {/* Validity */}
          <div className="border-t border-blue-400 pt-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Valid From - Until</p>
              <p className="text-sm font-semibold">{iCard.validFrom} to {iCard.validUntil}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">Issue Date</p>
              <p className="text-sm">{format(new Date(iCard.createdAt), "dd/MM/yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Card Generated</p>
              <p className="text-muted-foreground text-xs">{format(new Date(iCard.createdAt), "dd MMMM yyyy")}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
            <p>This I-Card is a digital membership proof. Please keep this card safe for identification and membership benefits.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
