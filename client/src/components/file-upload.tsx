import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { CloudUpload, FileCode, X, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (batchId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadFiles, isUploading, uploadProgress } = useFileUpload();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const xmlFiles = acceptedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.xml')
    );
    
    if (xmlFiles.length !== acceptedFiles.length) {
      toast({
        title: "Arquivos inválidos",
        description: "Apenas arquivos XML são aceitos",
        variant: "destructive",
      });
    }

    const totalFiles = selectedFiles.length + xmlFiles.length;
    if (totalFiles > 50) {
      toast({
        title: "Limite excedido",
        description: "Máximo de 50 arquivos permitidos",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...xmlFiles]);
  }, [selectedFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    maxFiles: 50
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const batchId = await uploadFiles(selectedFiles);
      onUploadComplete(batchId);
      setSelectedFiles([]);
      toast({
        title: "Upload concluído",
        description: "Arquivos enviados com sucesso. Processamento iniciado.",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar arquivos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Upload de Arquivos XML</h2>
          <p className="text-muted-foreground mb-6">
            Selecione até 50 arquivos XML de Notas Fiscais para conversão
          </p>
          
          {/* Upload Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer bg-muted/30 ${
              isDragActive ? 'drag-over border-primary' : 'border-border hover:border-primary'
            }`}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} data-testid="input-file" />
            <div className="flex flex-col items-center">
              <CloudUpload className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Arraste e solte seus arquivos XML aqui
              </h3>
              <p className="text-muted-foreground mb-4">ou clique para selecionar arquivos</p>
              <Button 
                variant="default"
                className="mb-3"
                data-testid="button-select-files"
              >
                Selecionar Arquivos
              </Button>
              <p className="text-xs text-muted-foreground">
                Máximo: 50 arquivos | Formatos: .xml
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Enviando arquivos...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3">
                Arquivos Selecionados ({selectedFiles.length}/50)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="file-item flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border"
                    data-testid={`file-item-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileCode className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Pronto
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive/80"
                        data-testid={`button-remove-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="ghost"
              onClick={clearAll}
              disabled={selectedFiles.length === 0}
              className="text-muted-foreground hover:text-destructive"
              data-testid="button-clear-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="px-8 py-3"
              data-testid="button-process-files"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Processar Arquivos'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
