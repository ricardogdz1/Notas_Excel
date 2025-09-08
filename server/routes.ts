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
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 50 // Maximum 50 files
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload XML files and create batch
  app.post("/api/upload", upload.array('files', 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Validate file types
      const invalidFiles = files.filter(file => !file.originalname.toLowerCase().endsWith('.xml'));
      if (invalidFiles.length > 0) {
        return res.status(400).json({ 
          message: "Apenas arquivos XML são permitidos",
          invalidFiles: invalidFiles.map(f => f.originalname)
        });
      }

      // Create batch
      const batch = await storage.createBatch({
        status: "processing",
        totalFiles: files.length,
        processedFiles: 0,
        errorFiles: 0
      });

      // Process files asynchronously
      processFilesAsync(batch.id, files);

      res.json({ batchId: batch.id });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get batch status
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

  // Get invoices by batch
  app.get("/api/invoices/batch/:batchId", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByBatch(req.params.batchId);
      res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Download Excel file
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

// Async file processing function
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

    // Update batch progress
    await storage.updateBatch(batchId, {
      processedFiles: processedCount,
      errorFiles: errorCount
    });
  }

  // Mark batch as completed
  await storage.updateBatch(batchId, {
    status: "completed"
  });
}
