import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import type { Batch } from "@shared/schema";

interface ProcessingStatusProps {
  batchId: string;
  onComplete: () => void;
}

export function ProcessingStatus({ batchId, onComplete }: ProcessingStatusProps) {
  const { data: batch, isLoading } = useQuery<Batch>({
    queryKey: ['/api/batches', batchId],
    refetchInterval: 1000, // Poll every second
  });

  useEffect(() => {
    if (batch?.status === 'completed') {
      onComplete();
    }
  }, [batch?.status, onComplete]);

  if (isLoading || !batch) {
    return (
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando status...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = batch.totalFiles > 0 
    ? Math.round(((batch.processedFiles + batch.errorFiles) / batch.totalFiles) * 100)
    : 0;

  return (
    <div className="mb-8" data-testid="processing-section">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Processamento</h2>
          
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">
                {batch.processedFiles + batch.errorFiles} de {batch.totalFiles} arquivos processados
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          {/* Processing Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Processados</p>
                  <p className="text-2xl font-bold text-primary" data-testid="count-processed">
                    {batch.processedFiles}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Processando</p>
                  <p className="text-2xl font-bold text-accent" data-testid="count-processing">
                    {batch.totalFiles - batch.processedFiles - batch.errorFiles}
                  </p>
                </div>
                {batch.status === 'processing' ? (
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Erros</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="count-errors">
                    {batch.errorFiles}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Processing Status */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Status do Processamento</h4>
            <div className="flex items-center space-x-2 text-sm">
              {batch.status === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  <span className="text-muted-foreground">
                    {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                  <span>Processando arquivos XML...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                  <span>Processamento concluído</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
