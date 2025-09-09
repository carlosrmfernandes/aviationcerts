import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";
import html2pdf from "html2pdf.js";
import "./pdf.css";

interface CertificateItem {
  id: string;
  item: string;
  description: string;
  partNumber: string;
  quantity: string;
  serialNumber: string;
  status: string;
}

interface Certificate {
  id: string;
  formNumber: string;
  formTrackingNumber: string;
  organizationName: string;
  organizationAddress: string;
  workOrderContractInvoiceNumber: string;
  approvingAuthority: string;
  approvingCountry: string;
  remarks: string;
  conformityApprovedDesign: boolean;
  conformityNonApprovedDesign: boolean;
  returnToService: boolean;
  otherRegulation: boolean;
  authorizedSignature13: string;
  approvalAuthorizationNo: string;
  authorizedSignature14: string;
  approvalCertificateNo: string;
  name13: string;
  date13: string;
  name14: string;
  date14: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  items: CertificateItem[];
  user: {
    id: number;
    name: string;
    email: string;
    company: string;
    created_at: string;
    updated_at: string;
  };
}

const PDFPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) return;

      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(getApiUrl(`/api/certificates/${id}`), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error fetching certificate");

        const data = await res.json();
        setCertificate(data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load certificate",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id, toast, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;

    html2pdf()
      .from(element)
      .set({
        margin: 0.3,
        filename: `FAA_Form_8130-3_${certificate?.formNumber}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "landscape", unit: "in", format: "a4" },
      })
      .save();

    toast({
      title: "PDF Generated!",
      description: "Certificate was successfully generated",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Certificate not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Plane className="w-8 h-8 text-primary mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Certificate Preview
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    FAA Form 8130-3 - {certificate.formNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Preview */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-full">
        <Card className="shadow-lg print:shadow-none print:border-0">
          <CardContent
            id="pdf-content"
            className="p-8 print:p-6 border border-black"
          >
            {/* Header Section */}
            <div className="border-2 border-black mb-4">
              <div className="grid grid-cols-3 border-b border-black">
                {/* Column 1 */}
                <div className="border-r border-black p-2">
                  <div className="text-[10px] font-bold mb-1 uppercase">
                    1. Approving Civil Aviation Authority/Country:
                  </div>
                  <div className="text-sm">
                    {certificate.approvingAuthority}/{certificate.approvingCountry}
                  </div>
                </div>

                {/* Column 2 - Title */}
                <div className="border-r border-black p-2 text-center">
                  <div className="text-lg font-bold uppercase">
                    Authorized Release Certificate
                  </div>
                  <div className="text-sm">
                    FAA Form 8130-3, Airworthiness Approval Tag
                  </div>
                </div>

                {/* Column 3 */}
                <div className="p-2">
                  <div className="text-[10px] font-bold mb-1 uppercase">
                    3. Form Tracking Number:
                  </div>
                  <div className="text-sm">{certificate.formTrackingNumber}</div>
                </div>
              </div>

              {/* Organization and Work Order */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="border-r border-black p-2">
                  <div className="text-[10px] font-bold mb-1 uppercase">
                    4. Organization Name and Address:
                  </div>
                  <div className="text-sm">
                    {certificate.organizationName}
                    {certificate.organizationAddress && (
                      <>
                        <br />
                        {certificate.organizationAddress}
                      </>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[10px] font-bold mb-1 uppercase">
                    5. Work Order/Contract/Invoice Number:
                  </div>
                  <div className="text-sm">{certificate.workOrderContractInvoiceNumber}</div>
                </div>
              </div>

              {/* Item Details Table */}
              <div className="border-b border-black">
                <div className="grid grid-cols-12 border-b border-black bg-gray-100">
                  <div className="col-span-1 border-r border-black p-1 text-[10px] font-bold text-center">
                    6. Item
                  </div>
                  <div className="col-span-4 border-r border-black p-1 text-[10px] font-bold text-center">
                    7. Description
                  </div>
                  <div className="col-span-2 border-r border-black p-1 text-[10px] font-bold text-center">
                    8. Part Number
                  </div>
                  <div className="col-span-1 border-r border-black p-1 text-[10px] font-bold text-center">
                    9. Quantity
                  </div>
                  <div className="col-span-2 border-r border-black p-1 text-[10px] font-bold text-center">
                    10. Serial Number
                  </div>
                  <div className="col-span-2 p-1 text-[10px] font-bold text-center">
                    11. Status/Work
                  </div>
                </div>

                {certificate.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 border-b border-black last:border-b-0">
                    <div className="col-span-1 border-r border-black p-2 text-center text-sm">
                      {item.item}
                    </div>
                    <div className="col-span-4 border-r border-black p-2 text-sm">
                      {item.description}
                    </div>
                    <div className="col-span-2 border-r border-black p-2 text-sm">
                      {item.partNumber}
                    </div>
                    <div className="col-span-1 border-r border-black p-2 text-center text-sm">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 border-r border-black p-2 text-sm">
                      {item.serialNumber}
                    </div>
                    <div className="col-span-2 p-2 text-sm">
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div className="border-b border-black p-2">
                <div className="text-[10px] font-bold mb-2 uppercase">
                  12. Remarks:
                </div>
                <div className="text-sm leading-relaxed">
                  {certificate.remarks}
                </div>
              </div>

              {/* Certifications */}
              <div className="grid grid-cols-2 border-b border-black">
                {/* Left Column - 13a */}
                <div className="border-r border-black p-2">
                  <div className="text-[10px] font-bold mb-2 uppercase">
                    13a. Certifies the items identified above were manufactured in conformity to:
                  </div>
                  <div className="flex items-center mb-1">
                    <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                      {certificate.conformityApprovedDesign && "✓"}
                    </div>
                    <span className="text-[10px]">
                      Approved design data and are in a condition for safe operation.
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                      {certificate.conformityNonApprovedDesign && "✓"}
                    </div>
                    <span className="text-[10px]">
                      Non-approved design data specified in Block 12.
                    </span>
                  </div>

                  {/* 13b, 13c, 13d, 13e */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        13b. Authorized Signature:
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.authorizedSignature13}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        13c. Approval/Authorization No.:
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.approvalAuthorizationNo}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        13d. Name (Typed or Printed):
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.name13}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        13e. Date (dd/mmm/yyyy):
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.date13}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - 14a */}
                <div className="p-2">
                  <div className="text-[10px] font-bold mb-2 uppercase">14a.</div>
                  <div className="flex items-center mb-1">
                    <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                      {certificate.returnToService && "✓"}
                    </div>
                    <span className="text-[10px]">
                      14 CFR 43.9 Return to Service
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                      {certificate.otherRegulation && "✓"}
                    </div>
                    <span className="text-[10px]">
                      Other regulation specified in Block 12
                    </span>
                  </div>
                  <div className="text-[10px] leading-tight mb-4">
                    Certifies that unless otherwise specified in Block 12, the work identified 
                    in Block 11 and described in Block 12 was accomplished in accordance with 
                    Title 14, Code of Federal Regulations, part 43 and in respect to that work, 
                    the items are approved for return to service.
                  </div>

                  {/* 14b, 14c, 14d, 14e */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        14b. Authorized Signature:
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.authorizedSignature14}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        14c. Approval/Certificate No.:
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.approvalCertificateNo}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        14d. Name (Typed or Printed):
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.name14}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-1 uppercase">
                        14e. Date (dd/mmm/yyyy):
                      </div>
                      <div className="h-6 border-b border-black"></div>
                      <div className="text-[10px] text-center mt-1">
                        {certificate.date14}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-black p-2">
                <div className="text-[10px] font-bold mb-2 uppercase">
                  User/Installer Responsibilities
                </div>
                <div className="text-[10px] leading-relaxed">
                  It is important to understand that the existence of this
                  document alone does not automatically constitute authority to
                  install the aircraft engine/propeller/article. Where the
                  user/installer performs work in accordance with the national
                  regulations of an airworthiness authority different than the
                  airworthiness authority of the country specified in Block 1,
                  it is essential that the user/installer ensures that his/her
                  airworthiness authority accepts aircraft
                  engine(s)/propeller(s)/article(s) from the airworthiness
                  authority of the country specified in Block 1. <br />
                  <br />
                  Statements in Blocks 13a and 14a do not constitute
                  installation certification. In all cases, aircraft maintenance
                  records must contain an installation certification issued in
                  accordance with the national regulations by the user/installer
                  before the aircraft may be flown.
                </div>
                <div className="text-right text-[10px] mt-4">
                  FAA Form 8130-3 (02-14) NSN: 0052-00-012-9005
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PDFPreview;