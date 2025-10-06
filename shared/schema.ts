import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull(),
  numeroNF: text("numero_nf").notNull(),
  chaveNF: text("chave_nf").notNull(),
  cfop: text("cfop"),
  cst: text("cst"),
  nomeEmitente: text("nome_emitente"),
  cnpjCpfEmitente: text("cnpj_cpf_emitente"),
  nomeDestinatario: text("nome_destinatario"),
  cnpjCpfDestinatario: text("cnpj_cpf_destinatario"),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }),
  valorICMS: decimal("valor_icms", { precision: 15, scale: 2 }),
  valorPIS: decimal("valor_pis", { precision: 15, scale: 2 }),
  valorCOFINS: decimal("valor_cofins", { precision: 15, scale: 2 }),
  valorIPI: decimal("valor_ipi", { precision: 15, scale: 2 }),
  pesoLiquido: decimal("peso_liquido", { precision: 15, scale: 3 }),
  pesoBruto: decimal("peso_bruto", { precision: 15, scale: 3 }),
  transportadora: text("transportadora"),
  placaVeiculo: text("placa_veiculo"),
  ieEmissor: text("ie_emissor"),
  ieEmitente: text("ie_emitente"),
  // Campos adicionais extraídos do XML
  dataEmissao: text("data_emissao"),
  dataVencimento: text("data_vencimento"),
  naturezaOperacao: text("natureza_operacao"),
  modelo: text("modelo"),
  serie: text("serie"),
  finalidadeEmissao: text("finalidade_emissao"),
  consumidorFinal: text("consumidor_final"),
  presencaComprador: text("presenca_comprador"),
  municipioEmitente: text("municipio_emitente"),
  ufEmitente: text("uf_emitente"),
  cepEmitente: text("cep_emitente"),
  enderecoEmitente: text("endereco_emitente"),
  municipioDestinatario: text("municipio_destinatario"),
  ufDestinatario: text("uf_destinatario"),
  cepDestinatario: text("cep_destinatario"),
  enderecoDestinatario: text("endereco_destinatario"),
  valorFrete: decimal("valor_frete", { precision: 15, scale: 2 }),
  valorSeguro: decimal("valor_seguro", { precision: 15, scale: 2 }),
  valorDesconto: decimal("valor_desconto", { precision: 15, scale: 2 }),
  valorOutrasDespesas: decimal("valor_outras_despesas", { precision: 15, scale: 2 }),
  baseCalculoICMS: decimal("base_calculo_icms", { precision: 15, scale: 2 }),
  baseCalculoICMSST: decimal("base_calculo_icms_st", { precision: 15, scale: 2 }),
  valorICMSST: decimal("valor_icms_st", { precision: 15, scale: 2 }),
  valorProdutos: decimal("valor_produtos", { precision: 15, scale: 2 }),
  observacoes: text("observacoes"),
  informacoesAdicionais: text("informacoes_adicionais"),
  fileName: text("file_name").notNull(),
  status: text("status").notNull().default("processed"),
  errorMessage: text("error_message"),
});

export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("processing"),
  totalFiles: integer("total_files").notNull(),
  processedFiles: integer("processed_files").notNull().default(0),
  errorFiles: integer("error_files").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
});

// Configuracoes de coluna
export interface ExcelColumn {
  id: string;
  label: string;
  key: keyof Invoice;
  width?: number;
  format?: 'text' | 'currency' | 'number' | 'date';
  required?: boolean;
}

export interface ExcelTemplate {
  id: string;
  name: string;
  description: string;
  columns: ExcelColumn[];
  isDefault?: boolean;
}

export const excelTemplates = pgTable("excel_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  columns: text("columns").notNull(), // JSON string de ExcelColumn[]
  isDefault: text("is_default").default("false"),
  userId: text("user_id"), // Para gerenciamento futuro de usuários
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertExcelTemplateSchema = createInsertSchema(excelTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;
export type InsertExcelTemplate = z.infer<typeof insertExcelTemplateSchema>;
export type ExcelTemplateRecord = typeof excelTemplates.$inferSelect;
