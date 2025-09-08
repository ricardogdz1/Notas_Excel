import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash2, Settings, FileText } from "lucide-react";
import type { ExcelColumn, ExcelTemplate } from "@shared/schema";

// Available columns with their metadata
const availableColumns: ExcelColumn[] = [
  // Campos básicos (originais)
  { id: "numeroNF", label: "Número NF", key: "numeroNF", format: "text", required: true },
  { id: "chaveNF", label: "Chave NF", key: "chaveNF", format: "text", required: true },
  { id: "cfop", label: "CFOP", key: "cfop", format: "text" },
  { id: "cst", label: "CST", key: "cst", format: "text" },
  { id: "nomeEmitente", label: "Nome Emitente", key: "nomeEmitente", format: "text" },
  { id: "cnpjCpfEmitente", label: "CNPJ/CPF Emitente", key: "cnpjCpfEmitente", format: "text" },
  { id: "nomeDestinatario", label: "Nome Destinatário", key: "nomeDestinatario", format: "text" },
  { id: "cnpjCpfDestinatario", label: "CNPJ/CPF Destinatário", key: "cnpjCpfDestinatario", format: "text" },
  { id: "valorTotal", label: "Valor Total", key: "valorTotal", format: "currency" },
  { id: "valorICMS", label: "Valor ICMS", key: "valorICMS", format: "currency" },
  { id: "valorPIS", label: "Valor PIS", key: "valorPIS", format: "currency" },
  { id: "valorCOFINS", label: "Valor COFINS", key: "valorCOFINS", format: "currency" },
  { id: "valorIPI", label: "Valor IPI", key: "valorIPI", format: "currency" },
  { id: "pesoLiquido", label: "Peso Líquido", key: "pesoLiquido", format: "number" },
  { id: "pesoBruto", label: "Peso Bruto", key: "pesoBruto", format: "number" },
  { id: "transportadora", label: "Transportadora", key: "transportadora", format: "text" },
  { id: "placaVeiculo", label: "Placa Veículo", key: "placaVeiculo", format: "text" },
  { id: "ieEmissor", label: "IE Emissor", key: "ieEmissor", format: "text" },
  { id: "ieEmitente", label: "IE Emitente", key: "ieEmitente", format: "text" },
  
  // Novos campos adicionais
  { id: "dataEmissao", label: "Data Emissão", key: "dataEmissao", format: "date" },
  { id: "dataVencimento", label: "Data Vencimento", key: "dataVencimento", format: "date" },
  { id: "naturezaOperacao", label: "Natureza Operação", key: "naturezaOperacao", format: "text" },
  { id: "modelo", label: "Modelo", key: "modelo", format: "text" },
  { id: "serie", label: "Série", key: "serie", format: "text" },
  { id: "finalidadeEmissao", label: "Finalidade Emissão", key: "finalidadeEmissao", format: "text" },
  { id: "consumidorFinal", label: "Consumidor Final", key: "consumidorFinal", format: "text" },
  { id: "presencaComprador", label: "Presença Comprador", key: "presencaComprador", format: "text" },
  { id: "municipioEmitente", label: "Município Emitente", key: "municipioEmitente", format: "text" },
  { id: "ufEmitente", label: "UF Emitente", key: "ufEmitente", format: "text" },
  { id: "cepEmitente", label: "CEP Emitente", key: "cepEmitente", format: "text" },
  { id: "enderecoEmitente", label: "Endereço Emitente", key: "enderecoEmitente", format: "text" },
  { id: "municipioDestinatario", label: "Município Destinatário", key: "municipioDestinatario", format: "text" },
  { id: "ufDestinatario", label: "UF Destinatário", key: "ufDestinatario", format: "text" },
  { id: "cepDestinatario", label: "CEP Destinatário", key: "cepDestinatario", format: "text" },
  { id: "enderecoDestinatario", label: "Endereço Destinatário", key: "enderecoDestinatario", format: "text" },
  { id: "valorFrete", label: "Valor Frete", key: "valorFrete", format: "currency" },
  { id: "valorSeguro", label: "Valor Seguro", key: "valorSeguro", format: "currency" },
  { id: "valorDesconto", label: "Valor Desconto", key: "valorDesconto", format: "currency" },
  { id: "valorOutrasDespesas", label: "Valor Outras Despesas", key: "valorOutrasDespesas", format: "currency" },
  { id: "baseCalculoICMS", label: "Base Cálculo ICMS", key: "baseCalculoICMS", format: "currency" },
  { id: "baseCalculoICMSST", label: "Base Cálculo ICMS ST", key: "baseCalculoICMSST", format: "currency" },
  { id: "valorICMSST", label: "Valor ICMS ST", key: "valorICMSST", format: "currency" },
  { id: "valorProdutos", label: "Valor Produtos", key: "valorProdutos", format: "currency" },
  { id: "observacoes", label: "Observações", key: "observacoes", format: "text" },
  { id: "informacoesAdicionais", label: "Informações Adicionais", key: "informacoesAdicionais", format: "text" }
];

const defaultTemplate: ExcelTemplate = {
  id: "default",
  name: "Padrão",
  description: "Template padrão com campos essenciais",
  columns: availableColumns.slice(0, 19), // First 19 columns (original ones)
  isDefault: true
};

interface ExcelConfigProps {
  selectedTemplate: ExcelTemplate;
  onTemplateChange: (template: ExcelTemplate) => void;
}

export function ExcelConfig({ selectedTemplate, onTemplateChange }: ExcelConfigProps) {
  const [currentTemplate, setCurrentTemplate] = useState<ExcelTemplate>(selectedTemplate);
  const [customTemplateName, setCustomTemplateName] = useState("Meu Template Personalizado");
  const [activeTab, setActiveTab] = useState("standard");

  useEffect(() => {
    setCurrentTemplate(selectedTemplate);
  }, [selectedTemplate]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(currentTemplate.columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedTemplate = { ...currentTemplate, columns: items };
    setCurrentTemplate(updatedTemplate);
  };

  const addColumn = (columnId: string) => {
    const columnToAdd = availableColumns.find(col => col.id === columnId);
    if (!columnToAdd) return;

    const exists = currentTemplate.columns.some(col => col.id === columnId);
    if (exists) return;

    const updatedTemplate = {
      ...currentTemplate,
      columns: [...currentTemplate.columns, { ...columnToAdd }]
    };
    setCurrentTemplate(updatedTemplate);
  };

  const removeColumn = (columnId: string) => {
    const column = availableColumns.find(col => col.id === columnId);
    if (column?.required) return; // Can't remove required columns

    const updatedTemplate = {
      ...currentTemplate,
      columns: currentTemplate.columns.filter(col => col.id !== columnId)
    };
    setCurrentTemplate(updatedTemplate);
  };

  const updateColumnWidth = (columnId: string, width: number) => {
    const updatedTemplate = {
      ...currentTemplate,
      columns: currentTemplate.columns.map(col =>
        col.id === columnId ? { ...col, width } : col
      )
    };
    setCurrentTemplate(updatedTemplate);
  };

  const applyTemplate = () => {
    onTemplateChange(currentTemplate);
  };

  const resetToDefault = () => {
    setCurrentTemplate(defaultTemplate);
  };

  const createCustomTemplate = () => {
    const customTemplate: ExcelTemplate = {
      ...currentTemplate,
      id: `custom-${Date.now()}`,
      name: customTemplateName,
      description: "Template personalizado criado pelo usuário",
      isDefault: false
    };
    setCurrentTemplate(customTemplate);
    onTemplateChange(customTemplate);
  };

  const availableToAdd = availableColumns.filter(
    col => !currentTemplate.columns.some(selected => selected.id === col.id)
  );

  return (
    <div className="mb-8" data-testid="excel-config-section">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuração do Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard" data-testid="tab-standard">
                <FileText className="h-4 w-4 mr-2" />
                Template Padrão
              </TabsTrigger>
              <TabsTrigger value="custom" data-testid="tab-custom">
                <Settings className="h-4 w-4 mr-2" />
                Personalizado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Use o template padrão com os campos mais utilizados em relatórios de Notas Fiscais.
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{defaultTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">{defaultTemplate.description}</p>
                  <Badge variant="secondary" className="mt-1">
                    {defaultTemplate.columns.length} colunas
                  </Badge>
                </div>
                <Button 
                  onClick={() => {
                    setCurrentTemplate(defaultTemplate);
                    onTemplateChange(defaultTemplate);
                  }}
                  variant={currentTemplate.id === "default" ? "default" : "outline"}
                  data-testid="button-apply-default"
                >
                  {currentTemplate.id === "default" ? "Em Uso" : "Usar Template"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    value={customTemplateName}
                    onChange={(e) => setCustomTemplateName(e.target.value)}
                    placeholder="Nome do seu template personalizado"
                    data-testid="input-template-name"
                  />
                </div>

                {/* Column Selection */}
                <div>
                  <Label>Adicionar Colunas</Label>
                  <Select onValueChange={addColumn}>
                    <SelectTrigger data-testid="select-add-column">
                      <SelectValue placeholder="Selecione uma coluna para adicionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          <div className="flex items-center gap-2">
                            {column.label}
                            <Badge variant="outline" className="text-xs">
                              {column.format}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Columns - Drag & Drop */}
                <div>
                  <Label className="flex items-center justify-between">
                    Colunas Selecionadas ({currentTemplate.columns.length})
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetToDefault}
                      className="h-auto p-1"
                      data-testid="button-reset-columns"
                    >
                      Resetar
                    </Button>
                  </Label>
                  
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="columns">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 mt-2 max-h-80 overflow-y-auto"
                        >
                          {currentTemplate.columns.map((column, index) => (
                            <Draggable
                              key={column.id}
                              draggableId={column.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-3 border rounded-lg bg-background ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                  data-testid={`column-item-${column.id}`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{column.label}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {column.format}
                                      </Badge>
                                      {column.required && (
                                        <Badge variant="secondary" className="text-xs">
                                          Obrigatório
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">Largura:</Label>
                                    <Input
                                      type="number"
                                      value={column.width || 15}
                                      onChange={(e) => updateColumnWidth(column.id, parseInt(e.target.value))}
                                      className="w-16 h-8 text-xs"
                                      min="5"
                                      max="100"
                                    />
                                  </div>

                                  {!column.required && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeColumn(column.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                                      data-testid={`button-remove-${column.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={resetToDefault}
                    data-testid="button-reset-default"
                  >
                    Voltar ao Padrão
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={applyTemplate}
                      data-testid="button-apply-custom"
                    >
                      Aplicar Configuração
                    </Button>
                    <Button
                      onClick={createCustomTemplate}
                      data-testid="button-save-template"
                    >
                      Salvar Template
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}