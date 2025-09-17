import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getApiUrl } from "@/config/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plane,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  LogOut,
  User,
  Files
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificateItem {
  id: string;
  item: string;
  description: string;
  partNumber: string;
  quantity: string;
  serialNumber?: string;
  status: string;
}

interface Certificate {
  id: string;
  approvingAuthority: string;
  approvingCountry: string;
  formTrackingNumber: string;
  organizationName: string;
  organizationAddress?: string;
  workOrderContractInvoiceNumber?: string;
  remarks?: string;
  conformityApprovedDesign: boolean;
  conformityNonApprovedDesign: boolean;
  returnToService: boolean;
  otherRegulation: boolean;
  approvalAuthorizationNo?: string;
  approvalCertificateNo?: string;
  user?: { id: number; name: string };
  items: CertificateItem[];
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(getApiUrl("/api/certificates"), {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Error fetching certificates");

      const data = await res.json();
      setCertificates(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      });
    } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");

    try {
      await fetch(getApiUrl('/api/logout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been logged out of the system",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(getApiUrl(`/api/certificates/${id}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Error deleting certificate");

      setCertificates(prev => prev.filter(cert => cert.id !== id));
      setSelectedCertificates(prev => prev.filter(certId => certId !== id));

      toast({
        title: "Certificate deleted!",
        description: "Certificate was successfully removed",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = (certificate: Certificate) => {
    navigate(`/pdf-preview/${certificate.id}`);
  };

  const handleGenerateMultiplePDFs = () => {
    if (selectedCertificates.length === 0) {
      toast({
        title: "No certificates selected",
        description: "Select at least one certificate to generate PDFs",
        variant: "destructive"
      });
      return;
    }

    const selectedIds = selectedCertificates.join(",");
    navigate(`/batch-pdf-preview/${selectedIds}`);
  };

  const handleSelectAll = () => {
    if (selectedCertificates.length === filteredCertificates.length && filteredCertificates.length > 0) {
      setSelectedCertificates([]);
    } else {
      setSelectedCertificates(filteredCertificates.map(cert => cert.id));
    }
  };

  const handleSelectCertificate = (id: string) => {
    setSelectedCertificates(prev =>
      prev.includes(id)
        ? prev.filter(certId => certId !== id)
        : [...prev, id]
    );
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.formTrackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.workOrderContractInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.items.some(item =>
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serialNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "INSPECTED":
        return "bg-success/10 text-success border-success/20";
      case "PENDING":
      case "PENDENTE":
        return "bg-warning/10 text-warning border-warning/20";
      case "REJECTED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
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

  const getCertificateStatus = (items: CertificateItem[]) => {
    const statusCount = {
      REJECTED: 0,
      PENDING: 0,
      INSPECTED: 0,
      OTHER: 0
    };

    items.forEach(item => {
      const status = item.status.toUpperCase();
      if (status === "REJECTED") statusCount.REJECTED++;
      else if (status === "PENDING" || status === "PENDENTE") statusCount.PENDING++;
      else if (status === "INSPECTED") statusCount.INSPECTED++;
      else statusCount.OTHER++;
    });

    if (statusCount.REJECTED > 0) return "REJECTED";
    if (statusCount.PENDING > 0) return "PENDING";
    if (statusCount.INSPECTED === items.length) return "INSPECTED";
    return "MIXED";
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="w-8 h-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Aviation Certs</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  FAA Certificate Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    User
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            FAA Form 8130-3 Certificates
          </h2>
          <p className="text-muted-foreground">
            Manage your authorized release certificates
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by tracking number, organization, work ord..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {selectedCertificates.length > 0 && (
              <Button variant="outline" onClick={handleGenerateMultiplePDFs}>
                <Files className="w-4 h-4 mr-2" />
                Generate {selectedCertificates.length} PDFs
              </Button>
            )}
            <Button onClick={() => navigate("/add-certificate")}>
              <Plus className="w-4 h-4 mr-2" />
              New Certificate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inspected Items</CardTitle>
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.reduce((total, cert) =>
                  total + cert.items.filter(item =>
                    item.status.toUpperCase() === "INSPECTED").length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviceable Items</CardTitle>
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.reduce((total, cert) =>
                  total + cert.items.filter(item =>
                    item.status.toUpperCase() === "SERVICEABLE" ||
                    item.status.toUpperCase() === "SERVICEABLE").length, 0)}
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">As Removed Items</CardTitle>
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.reduce((total, cert) =>
                  total + cert.items.filter(item =>
                    item.status.toUpperCase() === "AS REMOVED" ||
                    item.status.toUpperCase() === "AS REMOVED").length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tested Items</CardTitle>
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.reduce((total, cert) =>
                  total + cert.items.filter(item =>
                    item.status.toUpperCase() === "TESTED" ||
                    item.status.toUpperCase() === "TESTED").length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repairable Items</CardTitle>
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.reduce((total, cert) =>
                  total + cert.items.filter(item =>
                    item.status.toUpperCase() === "REPAIRABLE" ||
                    item.status.toUpperCase() === "REPAIRABLE").length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Total</CardTitle>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.reduce((total, cert) => total + cert.items.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Certificates List</CardTitle>
            <CardDescription>
              All FAA Form 8130-3 certificates registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCertificates.length === filteredCertificates.length && filteredCertificates.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Items Count</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead>Work Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCertificates.includes(certificate.id)}
                          onCheckedChange={() => handleSelectCertificate(certificate.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{certificate.formTrackingNumber}</TableCell>
                      <TableCell>{certificate.organizationName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="ml-1">
                          {certificate.items.length} items
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        <Badge className={getStatusColor(getCertificateStatus(certificate.items))}>
                          {getCertificateStatus(certificate.items)}
                        </Badge>
                      </TableCell> */}
                      <TableCell>{certificate.workOrderContractInvoiceNumber || "-"}</TableCell>
                      <TableCell>{formatDate(certificate.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleGeneratePDF(certificate)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Generate PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/edit-certificate/${certificate.id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(certificate.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCertificates.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No certificates found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;