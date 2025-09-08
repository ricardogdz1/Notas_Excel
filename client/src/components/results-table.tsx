import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Invoice, Batch } from "@shared/schema";

interface ResultsTableProps {
  batchId: string;
}

export function ResultsTable({ batchId }: ResultsTableProps) {
  const { toast } = useToast();

  const { data: batch } = useQuery<Batch>({
    queryKey: ['/api/batches', batchId],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices/batch', batchId],
  });

  const handleDownloadExcel = async () => {
    try {
      const response = await apiRequest('GET', `/api/invoices/batch/${batchId}/excel`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `notas_fiscais_${batchId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download iniciado",
        description: "O arquivo Excel está sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Falha ao baixar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  const processedInvoices = invoices.filter(inv => inv.status === 'processed');
  const errorInvoices = invoices.filter(inv => inv.status === 'error');

  const totalValue = processedInvoices.reduce((sum, inv) => 
    sum + (parseFloat(inv.valorTotal || '0')), 0
  );

  const totalICMS = processedInvoices.reduce((sum, inv) => 
    sum + (parseFloat(inv.valorICMS || '0')), 0
  );

  const totalWeight = processedInvoices.reduce((sum, inv) => 
    sum + (parseFloat(inv.pesoBruto || '0')), 0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatWeight = (value: number) => {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg`;
  };

  return (
    <div className="mb-8" data-testid="results-section">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Resultados</h2>
            <Button
              onClick={handleDownloadExcel}
              disabled={processedInvoices.length === 0}
              data-testid="button-download-excel"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Excel
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary" data-testid="total-notes">
                {processedInvoices.length}
              </p>
              <p className="text-sm text-muted-foreground">Notas Processadas</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="total-value">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="total-icms">
                {formatCurrency(totalICMS)}
              </p>
              <p className="text-sm text-muted-foreground">Total ICMS</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="total-weight">
                {formatWeight(totalWeight)}
              </p>
              <p className="text-sm text-muted-foreground">Peso Total</p>
            </div>
          </div>

          {/* Data Preview Table */}
          {processedInvoices.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <h4 className="font-medium text-foreground mb-3">Prévia dos Dados Extraídos</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número NF</TableHead>
                    <TableHead>Chave NF</TableHead>
                    <TableHead>Emitente</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedInvoices.slice(0, 10).map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="font-medium font-mono text-sm">
                        {invoice.numeroNF}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-xs truncate">
                        {invoice.chaveNF}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {invoice.nomeEmitente}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {invoice.nomeDestinatario}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(parseFloat(invoice.valorTotal || '0'))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Processado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {processedInvoices.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Mostrando 10 de {processedInvoices.length} notas processadas
                </p>
              )}
            </div>
          )}

          {/* Error Section */}
          {errorInvoices.length > 0 && (
            <Card className="border-destructive/20 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-destructive flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Erros de Processamento
                </h3>
                <div className="space-y-3">
                  {errorInvoices.map((invoice) => (
                    <div 
                      key={invoice.id}
                      className="bg-destructive/5 border border-destructive/20 rounded-lg p-4"
                      data-testid={`error-${invoice.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-destructive">{invoice.fileName}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {invoice.errorMessage || "Erro desconhecido no processamento"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
