import { parseStringPromise } from "xml2js";
import type { InsertInvoice } from "@shared/schema";

export async function parseXMLFile(buffer: Buffer, fileName: string): Promise<Omit<InsertInvoice, 'batchId' | 'fileName' | 'status'>> {
  try {
    const xmlString = buffer.toString('utf-8');
    const result = await parseStringPromise(xmlString, {
      explicitArray: false,
      mergeAttrs: true,
      normalize: true,
      normalizeTags: true,
      trim: true
    });

    // Navigate through the XML structure for Brazilian NFe
    const nfe = result?.nfeproc?.nfe || result?.nfe;
    if (!nfe) {
      throw new Error("Estrutura XML inválida: tag <NFe> não encontrada");
    }

    const infNFe = nfe.infnfe;
    if (!infNFe) {
      throw new Error("Estrutura XML inválida: tag <infNFe> não encontrada");
    }

    // Extract identification data
    const ide = infNFe.ide;
    const numeroNF = ide?.nnf || "";
    const chaveNF = infNFe.id ? infNFe.id.replace("NFe", "") : "";

    // Extract emitter data
    const emit = infNFe.emit;
    const nomeEmitente = emit?.xnome || "";
    const cnpjCpfEmitente = emit?.cnpj || emit?.cpf || "";
    const ieEmitente = emit?.ie || "";

    // Extract recipient data
    const dest = infNFe.dest;
    const nomeDestinatario = dest?.xnome || "";
    const cnpjCpfDestinatario = dest?.cnpj || dest?.cpf || "";

    // Extract product data (get CFOP and CST from first item)
    const det = Array.isArray(infNFe.det) ? infNFe.det[0] : infNFe.det;
    const cfop = det?.prod?.cfop || "";
    
    // Extract CST from ICMS
    const icms = det?.imposto?.icms;
    let cst = "";
    if (icms) {
      // CST can be in different ICMS scenarios (icms00, icms10, etc.)
      const icmsKeys = Object.keys(icms);
      if (icmsKeys.length > 0) {
        cst = icms[icmsKeys[0]]?.cst || icms[icmsKeys[0]]?.csosn || "";
      }
    }

    // Extract totals
    const total = infNFe.total?.icmstot;
    const valorTotal = total?.vnf || "0";
    const valorICMS = total?.vicms || "0";
    const valorPIS = total?.vpis || "0";
    const valorCOFINS = total?.vcofins || "0";
    const valorIPI = total?.vipi || "0";

    // Extract transport data
    const transp = infNFe.transp;
    const transportadora = transp?.transporta?.xnome || "";
    const placaVeiculo = transp?.veictransp?.placa || "";
    
    // Extract weights
    const pesoLiquido = transp?.vol?.pesoliq || "0";
    const pesoBruto = transp?.vol?.pesobruto || "0";

    // IE Emissor (same as IE Emitente in most cases)
    const ieEmissor = emit?.ie || "";

    return {
      numeroNF: numeroNF.toString(),
      chaveNF: chaveNF.toString(),
      cfop: cfop.toString(),
      cst: cst.toString(),
      nomeEmitente,
      cnpjCpfEmitente,
      nomeDestinatario,
      cnpjCpfDestinatario,
      valorTotal: parseFloat(valorTotal.toString()).toFixed(2),
      valorICMS: parseFloat(valorICMS.toString()).toFixed(2),
      valorPIS: parseFloat(valorPIS.toString()).toFixed(2),
      valorCOFINS: parseFloat(valorCOFINS.toString()).toFixed(2),
      valorIPI: parseFloat(valorIPI.toString()).toFixed(2),
      pesoLiquido: parseFloat(pesoLiquido.toString()).toFixed(3),
      pesoBruto: parseFloat(pesoBruto.toString()).toFixed(3),
      transportadora,
      placaVeiculo,
      ieEmissor,
      ieEmitente
    };

  } catch (error) {
    console.error(`Error parsing XML file ${fileName}:`, error);
    throw new Error(`Erro ao processar XML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
