import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { ProcessingStatus } from "@/components/processing-status";
import { ResultsTable } from "@/components/results-table";
import { ExcelConfig } from "@/components/excel-config";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, HelpCircle } from "lucide-react";
import type { ExcelTemplate } from "@shared/schema";

const defaultTemplate: ExcelTemplate = {
  id: "default",
  name: "Padrão",
  description: "Template padrão com campos essenciais",
  columns: [
    { id: "numeroNF", label: "Número NF", key: "numeroNF", width: 15, format: "text", required: true },
    { id: "chaveNF", label: "Chave NF", key: "chaveNF", width: 50, format: "text", required: true },
    { id: "cfop", label: "CFOP", key: "cfop", width: 10, format: "text" },
    { id: "cst", label: "CST", key: "cst", width: 10, format: "text" },
    { id: "nomeEmitente", label: "Nome Emitente", key: "nomeEmitente", width: 30, format: "text" },
    { id: "cnpjCpfEmitente", label: "CNPJ/CPF Emitente", key: "cnpjCpfEmitente", width: 20, format: "text" },
    { id: "nomeDestinatario", label: "Nome Destinatário", key: "nomeDestinatario", width: 30, format: "text" },
    { id: "cnpjCpfDestinatario", label: "CNPJ/CPF Destinatário", key: "cnpjCpfDestinatario", width: 20, format: "text" },
    { id: "valorTotal", label: "Valor Total", key: "valorTotal", width: 15, format: "currency" },
    { id: "valorICMS", label: "Valor ICMS", key: "valorICMS", width: 15, format: "currency" },
    { id: "valorPIS", label: "Valor PIS", key: "valorPIS", width: 15, format: "currency" },
    { id: "valorCOFINS", label: "Valor COFINS", key: "valorCOFINS", width: 15, format: "currency" },
    { id: "valorIPI", label: "Valor IPI", key: "valorIPI", width: 15, format: "currency" },
    { id: "pesoLiquido", label: "Peso Líquido", key: "pesoLiquido", width: 15, format: "number" },
    { id: "pesoBruto", label: "Peso Bruto", key: "pesoBruto", width: 15, format: "number" },
    { id: "transportadora", label: "Transportadora", key: "transportadora", width: 25, format: "text" },
    { id: "placaVeiculo", label: "Placa Veículo", key: "placaVeiculo", width: 15, format: "text" },
    { id: "ieEmissor", label: "IE Emissor", key: "ieEmissor", width: 20, format: "text" },
    { id: "ieEmitente", label: "IE Emitente", key: "ieEmitente", width: 20, format: "text" }
  ],
  isDefault: true
};

export default function Home() {
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExcelTemplate>(defaultTemplate);

  const handleUploadComplete = (batchId: string) => {
    setCurrentBatchId(batchId);
    setShowProcessing(true);
  };

  const handleProcessingComplete = () => {
    setShowProcessing(false);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">XML para Excel</h1>
                <p className="text-sm text-muted-foreground">Conversor de Notas Fiscais</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">v1.0.0</span>
              <button className="text-muted-foreground hover:text-foreground" data-testid="button-help">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Excel Configuration Section */}
        <ExcelConfig 
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />

        {/* Upload Section */}
        <FileUpload onUploadComplete={handleUploadComplete} />

        {/* Processing Section */}
        {showProcessing && currentBatchId && (
          <ProcessingStatus 
            batchId={currentBatchId} 
            onComplete={handleProcessingComplete}
          />
        )}

        {/* Results Section */}
        {showResults && currentBatchId && (
          <ResultsTable 
            batchId={currentBatchId} 
            template={selectedTemplate}
          />
        )}

        {/* Column Mapping Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h4 className="font-medium text-foreground mb-2 flex items-center">
              <FileSpreadsheet className="h-5 w-5 text-primary mr-2" />
              Colunas do Excel Gerado
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              As seguintes colunas serão criadas no arquivo Excel na ordem especificada:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {[
                "Número NF", "Chave NF", "CFOP", "CST", "Nome Emitente", "CNPJ/CPF Emitente",
                "Nome Destinatário", "CNPJ/CPF Destinatário", "Valor Total", "Valor ICMS",
                "Valor PIS", "Valor COFINS", "Valor IPI", "Peso Líquido", "Peso Bruto",
                "Transportadora", "Placa Veículo", "IE Emissor", "IE Emitente"
              ].map((column) => (
                <span 
                  key={column}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                >
                  {column}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2025 XML para Excel.
            </div>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Ajuda</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
              <a href="#" className="hover:text-primary transition-colors">Sobre</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
