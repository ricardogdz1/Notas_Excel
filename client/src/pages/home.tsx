import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { ProcessingStatus } from "@/components/processing-status";
import { ResultsTable } from "@/components/results-table";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, HelpCircle } from "lucide-react";

export default function Home() {
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
          <ResultsTable batchId={currentBatchId} />
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
              © 2024 XML para Excel Converter. Desenvolvido com Express.js + React.
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
