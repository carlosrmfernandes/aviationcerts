import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  description: string;
  partNumber: string;
  serialNumber: string;
  name: string;
  formNumber: string;
  workOrderNumber: string;
  quantity: number;
  status: "INSPECTED" | "PENDING" | "REJECTED";
  remarks: string;
  approval: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - em produção viria de uma API
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "1",
      description: "DBL TRK.SWL TYPE I FWD AFT SEAT",
      partNumber: "2524-015 (-14B)",
      serialNumber: "930527-7",
      name: "N225JD-0497",
      formNumber: "SUA-4246",
      workOrderNumber: "4246",
      quantity: 1,
      status: "INSPECTED",
      remarks: "REMOVED ARTICLE FROM AIRCRAFT N225JD GULFSTREAM G200. AIRCRAFT SERIAL NUMBER: 028, AIRCRAFT TTSN: 7,177.2, AIRCRAFT TCSN: 4,292.",
      approval: "CRS#WAVR866D"
    },
    {
      id: "2",
      description: "HYDRAULIC PUMP ASSEMBLY",
      partNumber: "1234-567 (-89A)",
      serialNumber: "ABC123-4",
      name: "N225JD-0498",
      formNumber: "SUA-4246",
      workOrderNumber: "4246",
      quantity: 1,
      status: "INSPECTED",
      remarks: "REMOVED ARTICLE FROM AIRCRAFT N225JD GULFSTREAM G200. AIRCRAFT SERIAL NUMBER: 028, AIRCRAFT TTSN: 7,177.2, AIRCRAFT TCSN: 4,292.",
      approval: "CRS#WAVR866D"
    }
  ]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema",
    });
  };

  const handleDelete = (id: string) => {
    setCertificates(prev => prev.filter(cert => cert.id !== id));
    toast({
      title: "Certificado removido",
      description: "O certificado foi removido com sucesso",
    });
  };

  const handleGeneratePDF = (certificate: Certificate) => {
    navigate(`/pdf-preview/${certificate.id}`);
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "INSPECTED":
        return "bg-success/10 text-success border-success/20";
      case "PENDING":
        return "bg-warning/10 text-warning border-warning/20";
      case "REJECTED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Plane className="w-8 h-8 text-primary mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Aviation Certs</h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Sistema de Gerenciamento de Certificados FAA
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Usuário
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
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
            Certificados FAA Form 8130-3
          </h2>
          <p className="text-muted-foreground">
            Gerencie seus certificados de liberação autorizada
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, part number ou serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => navigate("/add-certificate")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Certificado
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Certificados</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inspecionados</CardTitle>
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.filter(c => c.status === "INSPECTED").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.filter(c => c.status === "PENDING").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Certificados</CardTitle>
            <CardDescription>
              Todos os certificados FAA Form 8130-3 registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Work Order</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-medium">
                        {certificate.name}
                      </TableCell>
                      <TableCell>{certificate.partNumber}</TableCell>
                      <TableCell>{certificate.serialNumber}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(certificate.status)}>
                          {certificate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{certificate.workOrderNumber}</TableCell>
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
                              Gerar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/edit-certificate/${certificate.id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(certificate.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
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
                  <p className="text-muted-foreground">Nenhum certificado encontrado</p>
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