import ExcelJS from "exceljs";
import type { Invoice } from "@shared/schema";

export async function generateExcel(invoices: Invoice[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Notas Fiscais');

  // Define columns in the specified order
  const columns = [
    { header: 'Número NF', key: 'numeroNF', width: 15 },
    { header: 'Chave NF', key: 'chaveNF', width: 50 },
    { header: 'CFOP', key: 'cfop', width: 10 },
    { header: 'CST', key: 'cst', width: 10 },
    { header: 'Nome Emitente', key: 'nomeEmitente', width: 30 },
    { header: 'CNPJ/CPF Emitente', key: 'cnpjCpfEmitente', width: 20 },
    { header: 'Nome Destinatário', key: 'nomeDestinatario', width: 30 },
    { header: 'CNPJ/CPF Destinatário', key: 'cnpjCpfDestinatario', width: 20 },
    { header: 'Valor Total', key: 'valorTotal', width: 15 },
    { header: 'Valor ICMS', key: 'valorICMS', width: 15 },
    { header: 'Valor PIS', key: 'valorPIS', width: 15 },
    { header: 'Valor COFINS', key: 'valorCOFINS', width: 15 },
    { header: 'Valor IPI', key: 'valorIPI', width: 15 },
    { header: 'Peso Líquido', key: 'pesoLiquido', width: 15 },
    { header: 'Peso Bruto', key: 'pesoBruto', width: 15 },
    { header: 'Transportadora', key: 'transportadora', width: 25 },
    { header: 'Placa Veículo', key: 'placaVeiculo', width: 15 },
    { header: 'IE Emissor', key: 'ieEmissor', width: 20 },
    { header: 'IE Emitente', key: 'ieEmitente', width: 20 }
  ];

  worksheet.columns = columns;

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '22C55E' } // Green color matching the theme
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Add data rows
  invoices.forEach((invoice) => {
    const row = worksheet.addRow({
      numeroNF: invoice.numeroNF,
      chaveNF: invoice.chaveNF,
      cfop: invoice.cfop,
      cst: invoice.cst,
      nomeEmitente: invoice.nomeEmitente,
      cnpjCpfEmitente: invoice.cnpjCpfEmitente,
      nomeDestinatario: invoice.nomeDestinatario,
      cnpjCpfDestinatario: invoice.cnpjCpfDestinatario,
      valorTotal: parseFloat(invoice.valorTotal || '0'),
      valorICMS: parseFloat(invoice.valorICMS || '0'),
      valorPIS: parseFloat(invoice.valorPIS || '0'),
      valorCOFINS: parseFloat(invoice.valorCOFINS || '0'),
      valorIPI: parseFloat(invoice.valorIPI || '0'),
      pesoLiquido: parseFloat(invoice.pesoLiquido || '0'),
      pesoBruto: parseFloat(invoice.pesoBruto || '0'),
      transportadora: invoice.transportadora,
      placaVeiculo: invoice.placaVeiculo,
      ieEmissor: invoice.ieEmissor,
      ieEmitente: invoice.ieEmitente
    });

    // Format NF number and access key as text to prevent Excel modification
    const numeroNFCell = row.getCell('numeroNF');
    numeroNFCell.value = { text: invoice.numeroNF };
    numeroNFCell.numFmt = '@'; // Text format

    const chaveNFCell = row.getCell('chaveNF');
    chaveNFCell.value = { text: invoice.chaveNF };
    chaveNFCell.numFmt = '@'; // Text format

    // Format monetary values
    ['valorTotal', 'valorICMS', 'valorPIS', 'valorCOFINS', 'valorIPI'].forEach(field => {
      const cell = row.getCell(field);
      cell.numFmt = 'R$ #,##0.00';
    });

    // Format weight values
    ['pesoLiquido', 'pesoBruto'].forEach(field => {
      const cell = row.getCell(field);
      cell.numFmt = '#,##0.000';
    });

    // Add borders and alignment
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle' };
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header && typeof column.header === 'string') {
      const maxLength = Math.max(
        column.header.length,
        ...invoices.map(invoice => {
          const value = invoice[column.key as keyof Invoice];
          return value ? value.toString().length : 0;
        })
      );
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
