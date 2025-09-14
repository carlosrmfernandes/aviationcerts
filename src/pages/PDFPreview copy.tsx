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
        <table>
          <tbody>
            <tr>
              <td colSpan="2">
                <strong>1. Approving Civil Aviation Authority / Country:</strong>
                <br />
                FAA/United States
              </td>
              <td colSpan="4" className="heading">
                AUTHORIZED RELEASE CERTIFICATE
              </td>
              <td colSpan="2">
                <strong>3. Form Tracking Number:</strong>
                <br />
                42965-37-1
              </td>
            </tr>

            <tr>
              <td colSpan="6">
                <strong>4. Organization Name and Address:</strong>
                <br />
                Empire Aviation USA, Inc., 3800 Southern Blvd, Suite 503, West Palm
                Beach, Florida 33406, United States
              </td>
              <td colSpan="2">
                <strong>5. Work Order/Contract/Invoice Number:</strong>
                <br />
                42965
              </td>
            </tr>

            <tr>
              <th>6. Item</th>
              <th colSpan="2">7. Description</th>
              <th colSpan="2">8. Part Number</th>
              <th>9. Quantity</th>
              <th>10. Serial Number</th>
              <th>11. Status/Work</th>
            </tr>

            <tr>
              <td className="center">37.1</td>
              <td colSpan="2">LH Eng. Oil Pres Transmitter</td>
              <td className="center" colSpan="2">
                9912464-1
              </td>
              <td className="center">1</td>
              <td className="center">6293-4-248</td>
              <td className="center">TESTED</td>
            </tr>

            <tr>
              <td colSpan="8" className="remarks">
                <strong>12. Remarks:</strong>
                ITEM REMOVED IN SERVICEABLE CONDITION FROM AIRCRAFT N980HD, SN:
                560-5077, ACTT: 5600.1, ACTC: 4066. PERFORMED OPERATIONAL CHECK AND
                DETAILED VISUAL INSPECTION OF THE ITEM IN REFERENCE TO CE-560XL AMM
                REV. 50 DATED JUL 15, 2025. REF: WORK ORDER 42965.
              </td>
            </tr>

            <tr>
              <td colSpan="4" style={{ padding: "8px" }}>
                <div className="small">
                  <strong>
                    13a. Certifies the items identified above were manufactured in
                    conformity to:
                  </strong>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <label className="inline-check">
                    <input type="checkbox" /> Approved design data and are in a
                    condition for safe operation.
                  </label>
                  <br />
                  <label className="inline-check">
                    <input type="checkbox" /> Non-approved design data specified in
                    Block 12.
                  </label>
                </div>
              </td>

              <td colSpan="4" style={{ padding: "8px" }}>
                <div className="small">
                  <strong>14a. 14 CFR 43.9 Return to Service</strong> (or other
                  regulation specified in Block 12)
                </div>
                <p className="small" style={{ margin: "6px 0" }}>
                  Certifies that unless otherwise specified in Block 12, the work
                  identified in Block 11 and described in Block 12 was accomplished
                  in accordance with Title 14, Code of Federal Regulations, part 43
                  and in respect to that work, the items are approved for return to
                  service.
                </p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <strong>13b. Authorized Signature:</strong>
              </td>
              <td colSpan="2">
                <strong>13c. Approval/Authorization No.:</strong>
              </td>
              <td colSpan="2">
                <strong>14b. Authorized Signature:</strong>
              </td>
              <td colSpan="2">
                <strong>14c. Approval/Certificate No.:</strong>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <strong>13d. Name (Typed or Printed):</strong>
              </td>
              <td colSpan="2">
                <strong>13e. Date (dd/mm/yyyy):</strong>
              </td>
              <td colSpan="2">
                <strong>14d. Name (Typed or Printed):</strong>
              </td>
              <td colSpan="2">
                <strong>14e. Date (dd/mm/yyyy):</strong>
              </td>
            </tr>

            <tr>
              <td colSpan="8" className="center">
                <strong>User/Installer Responsibilities</strong>
              </td>
            </tr>

            <tr>
              <td colSpan="8">
                <div className="note">
                  It is important to understand that the existence of this document
                  alone does not automatically constitute authority to install the
                  aircraft engine/propeller/article.
                  <br />
                  <br />
                  Where the user/installer performs work in accordance with the
                  national regulations of an airworthiness authority different than
                  the airworthiness authority of the country specified in Block 1,
                  it is essential that the user/installer ensures that his/her
                  airworthiness authority accepts aircraft engine(s)/propeller(s)/
                  article(s) from the airworthiness authority of the country
                  specified in Block 1.
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan="8" className="no-border">
                <span className="small left">FAA Form 8130-3 (02-14)</span>
                <span className="small right">NSN: 0052-00-012-9005</span>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default PDFPreview;