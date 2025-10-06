import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { parseXMLFile } from "./services/xml-parser";
import { generateExcel } from "./services/excel-generator";
import { insertBatchSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 50 // Maximo de 50 arquivos
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload de arquivos XML e criação de lote
  app.post("/api/upload", upload.array('files', 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Validar tipos de arquivo
      const invalidFiles = files.filter(file => !file.originalname.toLowerCase().endsWith('.xml'));
      if (invalidFiles.length > 0) {
        return res.status(400).json({ 
          message: "Apenas arquivos XML são permitidos",
          invalidFiles: invalidFiles.map(f => f.originalname)
        });
      }

      // Criar lote
      const batch = await storage.createBatch({
        status: "processing",
        totalFiles: files.length,
        processedFiles: 0,
        errorFiles: 0
      });

      // Processar arquivos de forma assíncrona
      processFilesAsync(batch.id, files);

      res.json({ batchId: batch.id });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter status do lote
  app.get("/api/batches/:id", async (req, res) => {
    try {
      const batch = await storage.getBatch(req.params.id);
      if (!batch) {
        return res.status(404).json({ message: "Lote não encontrado" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Get batch error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter notas fiscais por lote
  app.get("/api/invoices/batch/:batchId", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByBatch(req.params.batchId);
      res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Baixar arquivo Excel com template customizado
  app.post("/api/invoices/batch/:batchId/excel", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByBatch(req.params.batchId);
      const processedInvoices = invoices.filter(inv => inv.status === 'processed');
      
      if (processedInvoices.length === 0) {
        return res.status(404).json({ message: "Nenhuma nota fiscal processada encontrada" });
      }

      const template = req.body.template;
      const buffer = await generateExcel(processedInvoices, template);
      
      const filename = `notas_fiscais_${template?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'export'}_${req.params.batchId}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Excel generation error:", error);
      res.status(500).json({ message: "Erro ao gerar arquivo Excel" });
    }
  });

  // Compatibilidade retroativa - manter endpoint GET para template padrão
  app.get("/api/invoices/batch/:batchId/excel", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByBatch(req.params.batchId);
      const processedInvoices = invoices.filter(inv => inv.status === 'processed');
      
      if (processedInvoices.length === 0) {
        return res.status(404).json({ message: "Nenhuma nota fiscal processada encontrada" });
      }

      const buffer = await generateExcel(processedInvoices);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="notas_fiscais_${req.params.batchId}.xlsx"`);
      res.send(buffer);
    } catch (error) {
      console.error("Excel generation error:", error);
      res.status(500).json({ message: "Erro ao gerar arquivo Excel" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Função de processamento assincrona de lotes
async function processFilesAsync(batchId: string, files: Express.Multer.File[]) {
  let processedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const invoiceData = await parseXMLFile(file.buffer, file.originalname);
      await storage.createInvoice({
        ...invoiceData,
        batchId,
        fileName: file.originalname,
        status: "processed"
      });
      processedCount++;
    } catch (error) {
      console.error(`Error processing ${file.originalname}:`, error);
      await storage.createInvoice({
        batchId,
        fileName: file.originalname,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
        numeroNF: "",
        chaveNF: ""
      });
      errorCount++;
    }

    // Progesso de upload de lotes
    await storage.updateBatch(batchId, {
      processedFiles: processedCount,
      errorFiles: errorCount
    });
  }

  // Marcação de lote como completo
  await storage.updateBatch(batchId, {
    status: "completed"
  });
}
