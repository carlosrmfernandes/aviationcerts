import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";

interface CertificateForm {
  id?: string;
  approvingAuthority: string;
  approvingCountry: string;
  formTrackingNumber: string;
  organizationName: string;
  organizationAddress: string;
  workOrderContractInvoiceNumber: string;
  items: Array<{
    item: string;
    description: string;
    partNumber: string;
    quantity: string;
    serialNumber: string;
    status: string;
  }>;
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
}

const EditCertificate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [toggleValue, setToggleValue] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState<CertificateForm>({
    approvingAuthority: "FAA",
    approvingCountry: "United States",
    formTrackingNumber: "",
    organizationName: "",
    organizationAddress: "",
    workOrderContractInvoiceNumber: "",
    items: [{
      item: "1",
      description: "",
      partNumber: "",
      quantity: "1",
      serialNumber: "",
      status: "PENDING"
    }],
    remarks: "",
    conformityApprovedDesign: false,
    conformityNonApprovedDesign: false,
    returnToService: false,
    otherRegulation: false,
    authorizedSignature13: "",
    approvalAuthorizationNo: "",
    authorizedSignature14: "",
    approvalCertificateNo: "",
    name13: "",
    date13: "",
    name14: "",
    date14: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setFetching(true);
      const token = localStorage.getItem("access_token");

      try {
        // Primeiro busca o toggle state
        const toggleRes = await fetch(getApiUrl("/api/toggle-state"), {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (toggleRes.ok) {
          const toggleData = await toggleRes.json();
          setToggleValue(toggleData.enabled);
        }

        // Depois busca os dados do certificado
        const certificateRes = await fetch(getApiUrl(`/api/certificates/${id}`), {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!certificateRes.ok) {
          throw new Error("Error fetching certificate");
        }

        const certificateData = await certificateRes.json();
        setFormData(certificateData);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error.message || "Could not fetch data",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, toast]);


  const handleInputChange = (field: keyof CertificateForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item: `${prev.items.length + 1}`,
          description: "",
          partNumber: "",
          quantity: "1",
          serialNumber: "",
          status: "PENDING"
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;

    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    // Renumber items
    const renumberedItems = updatedItems.map((item, idx) => ({
      ...item,
      item: `${idx + 1}`
    }));

    setFormData(prev => ({ ...prev, items: renumberedItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(getApiUrl(`/api/certificates/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error updating certificate");
      }

      toast({
        title: "Certificate updated!",
        description: "Certificate was updated successfully",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating certificate:", error);
      toast({
        title: "Error",
        description: error.message || "Could not update certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
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
                <h1 className="text-xl font-bold text-foreground">Edit Certificate</h1>
                <p className="text-sm text-muted-foreground">
                  FAA Form 8130-3 - Authorized Release Certificate
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>FAA Form 8130-3 - Authorized Release Certificate</CardTitle>
            <CardDescription>
              Edit all required fields for the FAA Form 8130-3 certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Approving Authority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="approvingAuthority">1. Approving Civil Aviation Authority</Label>
                  <Input
                    id="approvingAuthority"
                    value={formData.approvingAuthority}
                    onChange={(e) => handleInputChange("approvingAuthority", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvingCountry">Country</Label>
                  <Input
                    id="approvingCountry"
                    value={formData.approvingCountry}
                    onChange={(e) => handleInputChange("approvingCountry", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Section 2: Form Title */}
              <div className="p-4 border rounded-md">
                <div className="space-y-2">
                  <Label>2. AUTHORIZED RELEASE CERTIFICATE</Label>
                  <p className="text-sm text-muted-foreground">FAA Form 8130–3, AIRWORTHINESS APPROVAL TAG</p>
                </div>
              </div>

              {/* Section 3: Form Tracking Number */}
              <div className="p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="formTrackingNumber">3. Form Tracking Number</Label>
                  <Input
                    id="formTrackingNumber"
                    value={formData.formTrackingNumber}
                    onChange={(e) => handleInputChange("formTrackingNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Section 4: Organization Details */}
              <div className="grid grid-cols-1 gap-6 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">4. Organization Name and Address</Label>
                  <Textarea
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange("organizationName", e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workOrderContractInvoiceNumber">5. Work Order/Contract/Invoice Number:</Label>
                  <Input
                    id="workOrderContractInvoiceNumber"
                    value={formData.workOrderContractInvoiceNumber}
                    onChange={(e) => handleInputChange("workOrderContractInvoiceNumber", e.target.value)}
                  />
                </div>
              </div>

              {/* Section 6-11: Items Table */}
              <div className="p-4 border rounded-md">
                <Label className="mb-4 block">Items (6-11)</Label>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left font-normal">6. Item</th>
                        <th className="p-2 text-left font-normal">7. Description</th>
                        <th className="p-2 text-left font-normal">8. Part Number</th>
                        <th className="p-2 text-left font-normal">9. Quantity</th>
                        <th className="p-2 text-left font-normal">10. Serial Number</th>
                        <th className="p-2 text-left font-normal">11. Status/Work</th>
                        <th className="p-2 text-left font-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <Input
                              value={item.item}
                              onChange={(e) => handleItemChange(index, "item", e.target.value)}
                              className="w-16"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={item.partNumber}
                              onChange={(e) => handleItemChange(index, "partNumber", e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="w-20"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={item.serialNumber}
                              onChange={(e) => handleItemChange(index, "serialNumber", e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={item.status}
                              onValueChange={(value) => handleItemChange(index, "status", value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INSPECTED">INSPECTED</SelectItem>
                                <SelectItem value="SERVICEABLE">SERVICEABLE</SelectItem>
                                <SelectItem value="AS REMOVED">AS REMOVED</SelectItem>
                                <SelectItem value="TESTED">TESTED</SelectItem>
                                <SelectItem value="REPAIRABLE">REPAIRABLE</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length <= 1}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewItem}
                  className="mt-4"
                >
                  Add Item
                </Button>
              </div>

              {/* Section 12: Remarks */}
              <div className="p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="remarks">12. Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Section 13: Conformity */}
              <div className="p-4 border rounded-md">
                <div className="space-y-4">
                  <Label className={!toggleValue ? "disabled-label" : ""}>13a. Certifies the items identified above were manufactured in conformity to:</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-field" : ""}
                      disabled={!toggleValue}
                      id="conformityApprovedDesign"
                      checked={formData.conformityApprovedDesign}
                      onCheckedChange={(checked) =>
                        handleInputChange("conformityApprovedDesign", checked === true)
                      }
                    />
                    <label
                      htmlFor="conformityApprovedDesign"
                      className={!toggleValue ? "disabled-label" : ""}
                    >
                      Approved design data and are in a condition for safe operation.
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-field" : ""}
                      disabled={!toggleValue}
                      id="conformityNonApprovedDesign"
                      checked={formData.conformityNonApprovedDesign}
                      onCheckedChange={(checked) =>
                        handleInputChange("conformityNonApprovedDesign", checked === true)
                      }
                    />
                    <label
                      htmlFor="conformityNonApprovedDesign"
                      className={!toggleValue ? "disabled-label" : ""}
                    >
                      Non-approved design data specified in Block 12.
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="authorizedSignature13"
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-label" : ""}
                      >13b. Authorized Signature</Label>
                      <Input
                        id="authorizedSignature13"
                        value={formData.authorizedSignature13}
                        onChange={(e) => handleInputChange("authorizedSignature13", e.target.value)}
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-field" : ""}
                        disabled={!toggleValue}

                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approvalAuthorizationNo"
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-label" : ""}
                      >13c. Approval/Authorization No.</Label>
                      <Input
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-field" : ""}
                        disabled={!toggleValue}
                        id="approvalAuthorizationNo"
                        value={formData.approvalAuthorizationNo}
                        onChange={(e) => handleInputChange("approvalAuthorizationNo", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name13"
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-label" : ""}
                      >13d. Name (Typed or Printed)</Label>
                      <Input
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-field" : ""}
                        disabled={!toggleValue}
                        id="name13"
                        value={formData.name13}
                        onChange={(e) => handleInputChange("name13", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date13"
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-label" : ""}
                      >13e. Date (dd/mmm/yyyy)</Label>
                      <Input
                        className={!toggleValue ? "opacity-50 cursor-not-allowed disabled-field" : ""}
                        disabled={!toggleValue}
                        id="date13"
                        value={formData.date13}
                        onChange={(e) => handleInputChange("date13", e.target.value)}
                        placeholder="e.g., 15/Dec/2023"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 14: Return to Service */}
              <div className="p-4 border rounded-md">
                <div className="space-y-4">
                  <Label>14a.</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="returnToService"
                      checked={formData.returnToService}
                      onCheckedChange={(checked) =>
                        handleInputChange("returnToService", checked === true)
                      }
                    />
                    <label
                      htmlFor="returnToService"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      14 CFR 43.9 Return to Service
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="otherRegulation"
                      checked={formData.otherRegulation}
                      onCheckedChange={(checked) =>
                        handleInputChange("otherRegulation", checked === true)
                      }
                    />
                    <label
                      htmlFor="otherRegulation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Other regulation specified in Block 12
                    </label>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">
                    Certifies that unless otherwise specified in Block 12, the work identified in Block 11 and described in Block 12 was accomplished in accordance with Title 14, Code of Federal Regulations, part 43 and in respect to that work, the items are approved for return to service.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="authorizedSignature14">14b. Authorized Signature</Label>
                      <Input
                        id="authorizedSignature14"
                        value={formData.authorizedSignature14}
                        onChange={(e) => handleInputChange("authorizedSignature14", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approvalCertificateNo">14c. Approval/Certificate No.</Label>
                      <Input
                        id="approvalCertificateNo"
                        value={formData.approvalCertificateNo}
                        onChange={(e) => handleInputChange("approvalCertificateNo", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name14">14d. Name (Typed or Printed)</Label>
                      <Input
                        id="name14"
                        value={formData.name14}
                        onChange={(e) => handleInputChange("name14", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date14">14e. Date (dd/mmm/yyyy)</Label>
                      <Input
                        id="date14"
                        value={formData.date14}
                        onChange={(e) => handleInputChange("date14", e.target.value)}
                        placeholder="e.g., 15/Dec/2023"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* User/Installer Responsibilities */}
              <div className="p-4 border rounded-md bg-muted/30">
                <h3 className="font-semibold mb-2">User/Installer Responsibilities</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  It is important to understand that the existence of this document alone does not automatically constitute authority to install the aircraft engine/propeller/article.
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Where the user/installer performs work in accordance with the national regulations of an airworthiness authority different than the airworthiness authority of the country specified in Block 1, it is essential that the user/installer ensures that his/her airworthiness authority accepts aircraft engine(s)/propeller(s)/article(s) from the airworthiness authority of the country specified in Block 1.
                </p>
                <p className="text-sm text-muted-foreground">
                  Statements in Blocks 13a and 14a do not constitute installation certification. In all cases, aircraft maintenance records must contain an installation certification issued in accordance with the national regulations by the user/installer before the aircraft may be flown.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="sm:w-auto"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="sm:w-auto"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Certificate"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditCertificate;