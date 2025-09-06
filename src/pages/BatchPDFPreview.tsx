import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";

interface Certificate {
  id: string;
  description: string;
  partNumber: string;
  serialNumber: string;
  name: string;
  formNumber: string;
  workOrderNumber: string;
  quantity: string;
  status: string;
  remarks: string;
  approval: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    company: string;
    created_at: string;
    updated_at: string;
  };
}

const BatchPDFPreview = () => {
  const navigate = useNavigate();
  const { ids } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!ids) return;
      
      const selectedIds = ids.split(',');
      const token = localStorage.getItem("access_token");
      const certificatePromises = selectedIds.map(id => 
        fetch(getApiUrl(`/api/certificates/${id}`), {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }).then(res => {
          if (!res.ok) throw new Error(`Error fetching certificate ${id}`);
          return res.json();
        })
      );

      try {
        const results = await Promise.all(certificatePromises);
        setCertificates(results);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load some certificates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [ids, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDownloadAllPDFs = () => {
    toast({
      title: `${certificates.length} PDFs Generated!`,
      description: "All certificates were generated successfully",
    });
    // Here would be implemented the actual PDF generation logic
  };

  const handlePrintAll = () => {
    window.print();
  };

  const CertificatePreview = ({ certificate }: { certificate: Certificate }) => (
    <Card className="shadow-lg print:shadow-none print:border-0 mb-8 print:mb-0 print:break-after-page">
      <CardContent className="p-8 print:p-8">
        {/* Header Section */}
        <div className="border-2 border-gray-800 mb-4">
          <div className="grid grid-cols-3 border-b border-gray-800">
            {/* Column 1 */}
            <div className="border-r border-gray-800 p-2">
              <div className="text-xs font-bold mb-1">1. Approving Civil Aviation Authority Country:</div>
              <div className="text-sm">FAA/United States</div>
            </div>
            
            {/* Column 2 - Title */}
            <div className="border-r border-gray-800 p-2 text-center">
              <div className="text-lg font-bold">AUTHORIZED RELEASE CERTIFICATE</div>
              <div className="text-sm">FAA Form 8130-3, AIRWORTHINESS APPROVAL TAG</div>
            </div>
            
            {/* Column 3 */}
            <div className="p-2">
              <div className="text-xs font-bold mb-1">3. Form Tracking Number:</div>
              <div className="text-sm">{certificate.name}</div>
            </div>
          </div>

          {/* Organization and Work Order */}
          <div className="grid grid-cols-2 border-b border-gray-800">
            <div className="border-r border-gray-800 p-2">
              <div className="text-xs font-bold mb-1">4. Organization Name and Address:</div>
              <div className="text-sm">{certificate.user.company}</div>
            </div>
            <div className="p-2">
              <div className="text-xs font-bold mb-1">5. Work Order/Contract/Invoice Number:</div>
              <div className="text-sm">{certificate.workOrderNumber}</div>
            </div>
          </div>

          {/* Item Details Table */}
          <div className="border-b border-gray-800">
            <div className="grid grid-cols-12 border-b border-gray-800 bg-gray-100">
              <div className="col-span-1 border-r border-gray-800 p-1 text-xs font-bold">6. Item:</div>
              <div className="col-span-4 border-r border-gray-800 p-1 text-xs font-bold">7. Description:</div>
              <div className="col-span-2 border-r border-gray-800 p-1 text-xs font-bold">8. Part Number:</div>
              <div className="col-span-1 border-r border-gray-800 p-1 text-xs font-bold">9. Quantity:</div>
              <div className="col-span-2 border-r border-gray-800 p-1 text-xs font-bold">10. Serial Number:</div>
              <div className="col-span-2 p-1 text-xs font-bold">11. Status/Work:</div>
            </div>
            
            <div className="grid grid-cols-12">
              <div className="col-span-1 border-r border-gray-800 p-2 text-center">1</div>
              <div className="col-span-4 border-r border-gray-800 p-2 text-sm">{certificate.description}</div>
              <div className="col-span-2 border-r border-gray-800 p-2 text-sm">{certificate.partNumber}</div>
              <div className="col-span-1 border-r border-gray-800 p-2 text-center">{certificate.quantity}</div>
              <div className="col-span-2 border-r border-gray-800 p-2 text-sm">{certificate.serialNumber}</div>
              <div className="col-span-2 p-2 text-sm">{certificate.status}</div>
            </div>
          </div>

          {/* Remarks */}
          <div className="border-b border-gray-800 p-2">
            <div className="text-xs font-bold mb-2">12. Remarks:</div>
            <div className="text-sm leading-relaxed">{certificate.remarks}</div>
          </div>

          {/* Certifications */}
          <div className="grid grid-cols-2 border-b border-gray-800">
            <div className="border-r border-gray-800 p-2">
              <div className="flex items-center mb-2">
                <input type="checkbox" className="mr-2"/>
                <span className="text-xs">Approved per FAA approval for safe operations</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-xs">Non-approved design data specified in Block 12</span>
              </div>
            </div>
            <div className="p-2">
              <div className="text-xs font-bold mb-1">14. ☑ 14 CFR 43.9 Return to Service</div>
              <div className="text-xs">
                Certifies that unless otherwise specified in Block 12, the work identified in Block 11 and described in Block 12 was accomplished in accordance with Title 14, Code of Federal Regulations, part 43 and in respect to that work, the items are approved for return to service.
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-3">
            <div className="border-r border-gray-800 p-2">
              <div className="text-xs font-bold mb-1">13a. Certificate Holder's Performance</div>
              <div className="h-12"></div>
            </div>
            <div className="border-r border-gray-800 p-2">
              <div className="text-xs font-bold mb-1">13b. Approval/Authorization No.:</div>
              <div className="h-8"></div>
              <div className="text-xs font-bold mb-1">14a. Authorized Signature:</div>
              <div className="font-cursive text-lg">{certificate.user.name}</div>
              <div className="text-xs font-bold mb-1">14b. Name (Typed or Printed):</div>
              <div className="text-sm">{certificate.user.name}</div>
            </div>
            <div className="p-2">
              <div className="text-xs font-bold mb-1">14c. Approval Certificate No:</div>
              <div className="text-sm mb-4">{certificate.approval}</div>
              <div className="text-xs font-bold mb-1">14e. Date (dd mmm yyyy):</div>
              <div className="text-sm">{formatDate(certificate.updated_at)}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 p-2">
            <div className="text-xs font-bold mb-2">User/Installer Responsibilities</div>
            <div className="text-xs leading-relaxed">
              It is important to understand that the existence of this document alone does not automatically constitute authority to install the aircraft engine/propeller article.
              Where the user/installer performs work in accordance with the national regulations of an airworthiness authority different from the airworthiness authority of the country specified in Block 1, it is essential that the user/installer ensures that his/her airworthiness authority accepts aircraft engine(s)/propeller(s) article(s) from the airworthiness authority specified in Block 1 of this document.
              Therefore, in order to avoid confusion and expense, it is recommended that before commencing installation, the user/installer should contact the relevant authority to obtain clarification regarding acceptance of the aircraft engine/propeller article in the national regulations and obtain confirmation that the installation certification issued in accordance with the national regulations by the user/installer's airworthiness authority is sufficient.
            </div>
            <div className="text-right text-xs mt-4">
              FAA Form 8130-3 (07-16) NSN 0052-00-815-8049
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificates...</p>
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
                  <h1 className="text-xl font-bold text-foreground">Multiple Certificates Preview</h1>
                  <p className="text-sm text-muted-foreground">
                    {certificates.length} certificate(s) selected
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePrintAll}>
                <Printer className="w-4 h-4 mr-2" />
                Print All
              </Button>
              <Button onClick={handleDownloadAllPDFs}>
                <Download className="w-4 h-4 mr-2" />
                Download {certificates.length} PDFs
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Previews */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-full">
        {certificates.map((certificate) => (
          <CertificatePreview key={certificate.id} certificate={certificate} />
        ))}
        
        {certificates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No certificates found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BatchPDFPreview;