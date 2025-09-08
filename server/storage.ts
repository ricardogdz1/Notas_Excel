import { type Invoice, type InsertInvoice, type Batch, type InsertBatch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Batch operations
  createBatch(batch: InsertBatch): Promise<Batch>;
  getBatch(id: string): Promise<Batch | undefined>;
  updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | undefined>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoicesByBatch(batchId: string): Promise<Invoice[]>;
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined>;
}

export class MemStorage implements IStorage {
  private batches: Map<string, Batch>;
  private invoices: Map<string, Invoice>;

  constructor() {
    this.batches = new Map();
    this.invoices = new Map();
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const id = randomUUID();
    const batch: Batch = { 
      ...insertBatch, 
      id,
      createdAt: new Date().toISOString(),
      status: insertBatch.status || "processing",
      processedFiles: insertBatch.processedFiles || 0,
      errorFiles: insertBatch.errorFiles || 0
    };
    this.batches.set(id, batch);
    return batch;
  }

  async getBatch(id: string): Promise<Batch | undefined> {
    return this.batches.get(id);
  }

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | undefined> {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    
    const updatedBatch = { ...batch, ...updates };
    this.batches.set(id, updatedBatch);
    return updatedBatch;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id,
      status: insertInvoice.status || "processed",
      cfop: insertInvoice.cfop || null,
      cst: insertInvoice.cst || null,
      nomeEmitente: insertInvoice.nomeEmitente || null,
      cnpjCpfEmitente: insertInvoice.cnpjCpfEmitente || null,
      nomeDestinatario: insertInvoice.nomeDestinatario || null,
      cnpjCpfDestinatario: insertInvoice.cnpjCpfDestinatario || null,
      valorTotal: insertInvoice.valorTotal || null,
      valorICMS: insertInvoice.valorICMS || null,
      valorPIS: insertInvoice.valorPIS || null,
      valorCOFINS: insertInvoice.valorCOFINS || null,
      valorIPI: insertInvoice.valorIPI || null,
      pesoLiquido: insertInvoice.pesoLiquido || null,
      pesoBruto: insertInvoice.pesoBruto || null,
      transportadora: insertInvoice.transportadora || null,
      placaVeiculo: insertInvoice.placaVeiculo || null,
      ieEmissor: insertInvoice.ieEmissor || null,
      ieEmitente: insertInvoice.ieEmitente || null,
      errorMessage: insertInvoice.errorMessage || null
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoicesByBatch(batchId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.batchId === batchId
    );
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updates };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
}

export const storage = new MemStorage();
