import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";

interface CertificateForm {
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
}

const AddCertificate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CertificateForm>({
    description: "",
    partNumber: "",
    serialNumber: "",
    name: "",
    formNumber: "",
    workOrderNumber: "",
    quantity: "1",
    status: "PENDING",
    remarks: "",
    approval: ""
  });

  const handleInputChange = (field: keyof CertificateForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(getApiUrl("/api/certificates"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error creating certificate");
      }

      toast({
        title: "Certificate added!",
        description: "Certificate was created successfully",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error adding certificate:", error);
      toast({
        title: "Error",
        description: error.message || "Could not create certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-xl font-bold text-foreground">New Certificate</h1>
                <p className="text-sm text-muted-foreground">
                  FAA Form 8130-3 - Authorized Release Certificate
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Certificate Information</CardTitle>
            <CardDescription>
              Fill in all required fields for the FAA Form 8130-3 certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Form Name *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: N225JD-0497"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formNumber">Form Number *</Label>
                  <Input
                    id="formNumber"
                    placeholder="Ex: SUA-4246"
                    value={formData.formNumber}
                    onChange={(e) => handleInputChange("formNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Part Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="partNumber">Part Number *</Label>
                  <Input
                    id="partNumber"
                    placeholder="Ex: 2524-015 (-14B)"
                    value={formData.partNumber}
                    onChange={(e) => handleInputChange("partNumber", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    placeholder="Ex: 930527-7"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Work Order and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workOrderNumber">Work Order Number *</Label>
                  <Input
                    id="workOrderNumber"
                    placeholder="Ex: 4246"
                    value={formData.workOrderNumber}
                    onChange={(e) => handleInputChange("workOrderNumber", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="INSPECTED">INSPECTED</SelectItem>
                      <SelectItem value="REJECTED">REJECTED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="Ex: DBL TRK.SWL TYPE I FWD AFT SEAT"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks *</Label>
                <Textarea
                  id="remarks"
                  placeholder="Describe inspection details, removal or other procedures performed..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Approval */}
              <div className="space-y-2">
                <Label htmlFor="approval">Approval Code *</Label>
                <Input
                  id="approval"
                  placeholder="Ex: CRS#WAVR866D"
                  value={formData.approval}
                  onChange={(e) => handleInputChange("approval", e.target.value)}
                  required
                />
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
                  {loading ? "Saving..." : "Save Certificate"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddCertificate;