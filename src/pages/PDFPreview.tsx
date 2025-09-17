import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    if (!element) {
      toast({
        title: "Error",
        description: "PDF content not found",
        variant: "destructive",
      });
      return;
    }

    // Configurações otimizadas para caber em uma página
    const opt = {
      margin: 0.2, // Margem ainda menor
      filename: `FAA_Form_8130-3_${certificate?.formNumber || 'certificate'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1123, // Largura específica para A4 landscape
        height: 794, // Altura específica para A4 landscape
      },
      jsPDF: {
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true
      }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF",
          variant: "destructive",
        });
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
              {/* <Button onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      {/* PDF Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-full">
        <div id="pdf-content" className="certificate-content">
          <table className="table table-fixed w-full border-collapse">
            <thead>
              <tr>
                <th colSpan={8} className="hidden"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} className="center">
                  <div className="text-[13px] font-bold mb-1">
                    1. Approving Civil Aviation <br />Authority / Country:
                  </div>
                  <div className="text-sm text-center">FAA/United States</div>
                </td>
                <td colSpan={4} className="heading">
                  <div className="text-left text-[10px] font-bold">
                    2.
                  </div>
                  <div className="font-bold">
                    AUTHORIZED RELEASE CERTIFICATE
                  </div>
                  <div className="text-sm">
                    FAA Form 8130-3, Airworthiness Approval Tag
                  </div>
                </td>
                <td colSpan={2}>
                  <div className="p-1">
                    <div className="text-[13px] font-bold mb-1">
                      3. Form Tracking Number:
                    </div>
                    <div className="text-sm text-center">{certificate.formTrackingNumber}</div>
                  </div>
                </td>
              </tr>

              <tr>
                <td colSpan={6}>
                  <div className="text-[10px] font-bold mb-1">
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
                </td>
                <td colSpan={2}>
                  <div className="px-1">
                    <div className="text-[10px] font-bold mb-1">
                      5. Work Order/Contract/Invoice Number:
                    </div>
                    <div className="text-sm">{certificate.workOrderContractInvoiceNumber}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <th className="left" colSpan={1}>6. Item</th>
                <th className="left" colSpan={2}>7. Description</th>
                <th className="left" colSpan={2}>8. Part Number</th>
                <th className="left" colSpan={1}>9. Quantity</th>
                <th className="left" colSpan={1}>10. Serial Number</th>
                <th className="left" colSpan={1}>11. Status/Work</th>
              </tr>

              {certificate.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="center" colSpan={1}>
                    <div className="p-2 text-center text-sm">
                      {item.item}
                    </div>
                  </td>
                  <td colSpan={2}>
                    <div className="p-2 text-center text-sm">
                      {item.description}
                    </div>
                  </td>
                  <td className="center" colSpan={2}>
                    <div className="p-2 text-center text-sm">
                      {item.partNumber}
                    </div>
                  </td>
                  <td className="center" colSpan={1}>
                    <div className="p-2 text-center text-sm">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="center" colSpan={1}>
                    <div className="p-2 text-center text-sm">
                      {item.serialNumber} {/* Corrigido: estava item.quantity */}
                    </div>
                  </td>
                  <td className="center" colSpan={1}>
                    <div className="p-2 text-center text-sm">
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={8} className="remarks">
                  <div className="text-[10px] font-bold mb-2">
                    12. Remarks:
                  </div>
                  <div className="text-sm leading-relaxed  h-40">
                    {certificate.remarks}
                  </div>
                </td>
              </tr>

              <tr>
                <td colSpan={4} /*style={{ padding: "8px", position: "relative" }}*/ className="disabled-field" /*className="signature-box"*/>
                  <div className="cross-overlay"></div>
                  <div className="text-[10px] font-bold mb-2">
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
                </td>

                <td colSpan={4} style={{ padding: "8px" }}>
                  <div className="flex gap-4">
                    <div className="text-[10px] font-bold mb-2">14a.</div>
                    <div className="flex gap-4 content-between">
                      <div>
                        <div className="flex items-center mb-1">
                          <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                            {certificate.returnToService && "✓"}
                          </div>
                          <span className="text-[10px]">
                            14 CFR 43.9 Return to Service
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                          {certificate.otherRegulation && "✓"}
                        </div>
                        <span className="text-[10px]">
                          Other regulation specified in Block 12
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] leading-tight mb-4">
                    Certifies that unless otherwise specified in Block 12, the work identified
                    in Block 11 and described in Block 12 was accomplished in accordance with
                    Title 14, Code of Federal Regulations, part 43 and in respect to that work,
                    the items are approved for return to service.
                  </div>
                </td>
              </tr>

              <tr>
                <td colSpan={2} className="disabled-field">
                  <div className="text-[10px] font-bold mb-1">
                    13b. Authorized Signature:
                  </div>
                  <div className="py-5"></div>
                </td>
                <td colSpan={2} className="disabled-field">
                  <div className="text-[10px] font-bold mb-1">
                    13c. Approval/Authorization No.:
                  </div>
                  <div className="py-5"></div>
                </td>
                <td colSpan={2}>
                  <div className="text-[10px] font-bold mb-1">
                    14b. Authorized Signature:
                  </div>
                  <div className="py-5"></div>
                </td>
                <td colSpan={2}>
                  <div className="text-[10px] font-bold mb-1">
                    14c. Approval/Certificate No.:
                  </div>
                  <br />
                  <div className="text-sm text-center">{certificate.approvalCertificateNo}</div>
                  <div className="py-5"></div>
                </td>
              </tr>

              <tr>
                <td colSpan={2} className="disabled-field">
                  <div className="text-[10px] font-bold mb-1">
                    13d. Name (Typed or Printed):
                  </div>
                  <div className="py-5"></div>
                </td>
                <td colSpan={2} className="disabled-field">
                  <div className="text-[10px] font-bold mb-1">
                    13e. Date (dd/mmm/yyyy):
                  </div>
                  <div className="py-5"></div>
                </td>
                <td colSpan={2}>
                  <div className="text-[10px] font-bold mb-1">
                    14d. Name (Typed or Printed):
                  </div>
                  <br />
                  <div className="text-sm">{certificate.name14}</div>
                  <div className="py-5"></div>
                </td>
                <td colSpan={2}>
                  <div className="text-[10px] font-bold mb-1">
                    14e. Date (dd/mmm/yyyy):
                  </div>
                  <br />
                  <div className="text-sm text-center">{certificate.date14}</div>
                  <div className="py-5"></div>
                </td>
              </tr>

              <tr>
                <td colSpan={8} className="center">
                  <strong>User/Installer Responsibilities</strong>
                </td>
              </tr>

              <tr>
                <td colSpan={8}>
                  <div className="note font-bold">
                    It is important to understand that the existence of this
                    document alone does not automatically constitute authority to
                    install the aircraft engine/propeller/article.  <br />
                    <br />
                    Where the user/installer performs work in accordance with the national
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
                </td>
              </tr>

              <tr>
                <td colSpan={8} className="no-border">
                  <div className="w-100 flex justify-between">
                    <span className="small left">FAA Form 8130-3 (02-14)</span>
                    <span className="small right">NSN: 0052-00-012-9005</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PDFPreview;