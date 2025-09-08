import ExcelJS from "exceljs";
import type { Invoice, ExcelTemplate, ExcelColumn } from "@shared/schema";

// Default template for backward compatibility
const defaultColumns: ExcelColumn[] = [
  { id: "numeroNF", label: "Número NF", key: "numeroNF", width: 15, format: "text" },
  { id: "chaveNF", label: "Chave NF", key: "chaveNF", width: 50, format: "text" },
  { id: "cfop", label: "CFOP", key: "cfop", width: 10, format: "text" },
  { id: "cst", label: "CST", key: "cst", width: 10, format: "text" },
  { id: "nomeEmitente", label: "Nome Emitente", key: "nomeEmitente", width: 30, format: "text" },
  { id: "cnpjCpfEmitente", label: "CNPJ/CPF Emitente", key: "cnpjCpfEmitente", width: 20, format: "text" },
  { id: "nomeDestinatario", label: "Nome Destinatário", key: "nomeDestinatario", width: 30, format: "text" },
  { id: "cnpjCpfDestinatario", label: "CNPJ/CPF Destinatário", key: "cnpjCpfDestinatario", width: 20, format: "text" },
  { id: "valorTotal", label: "Valor Total", key: "valorTotal", width: 15, format: "currency" },
  { id: "valorICMS", label: "Valor ICMS", key: "valorICMS", width: 15, format: "currency" },
  { id: "valorPIS", label: "Valor PIS", key: "valorPIS", width: 15, format: "currency" },
  { id: "valorCOFINS", label: "Valor COFINS", key: "valorCOFINS", width: 15, format: "currency" },
  { id: "valorIPI", label: "Valor IPI", key: "valorIPI", width: 15, format: "currency" },
  { id: "pesoLiquido", label: "Peso Líquido", key: "pesoLiquido", width: 15, format: "number" },
  { id: "pesoBruto", label: "Peso Bruto", key: "pesoBruto", width: 15, format: "number" },
  { id: "transportadora", label: "Transportadora", key: "transportadora", width: 25, format: "text" },
  { id: "placaVeiculo", label: "Placa Veículo", key: "placaVeiculo", width: 15, format: "text" },
  { id: "ieEmissor", label: "IE Emissor", key: "ieEmissor", width: 20, format: "text" },
  { id: "ieEmitente", label: "IE Emitente", key: "ieEmitente", width: 20, format: "text" }
];

export async function generateExcel(invoices: Invoice[], template?: ExcelTemplate): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheetName = template?.name ? `${template.name} - Notas Fiscais` : 'Notas Fiscais';
  const worksheet = workbook.addWorksheet(worksheetName.substring(0, 30)); // Excel worksheet name limit

  // Use template columns or default columns
  const columnsToUse = template?.columns && template.columns.length > 0 ? template.columns : defaultColumns;
  
  // Convert to ExcelJS format
  const excelColumns = columnsToUse.map(col => ({
    header: col.label,
    key: col.key,
    width: col.width || 15
  }));

  worksheet.columns = excelColumns;

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
    // Create row data based on selected columns
    const rowData: any = {};
    columnsToUse.forEach(col => {
      const value = invoice[col.key];
      if (col.format === 'currency' || col.format === 'number') {
        rowData[col.key] = parseFloat(value?.toString() || '0');
      } else {
        rowData[col.key] = value || '';
      }
    });

    const row = worksheet.addRow(rowData);

    // Apply formatting based on column configuration
    columnsToUse.forEach(col => {
      const cell = row.getCell(col.key);
      
      // Handle special text formatting for important fields
      if (col.key === 'numeroNF' || col.key === 'chaveNF') {
        cell.value = invoice[col.key];
        cell.numFmt = '@'; // Text format
      }
      
      // Apply format based on column type
      switch (col.format) {
        case 'currency':
          cell.numFmt = 'R$ #,##0.00';
          break;
        case 'number':
          if (col.key === 'pesoLiquido' || col.key === 'pesoBruto') {
            cell.numFmt = '#,##0.000';
          } else {
            cell.numFmt = '#,##0.00';
          }
          break;
        case 'date':
          if (cell.value) {
            cell.numFmt = 'dd/mm/yyyy';
          }
          break;
        case 'text':
        default:
          // Keep as is
          break;
      }
      
      // Add borders and alignment
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle' };
    });
  });

  // Auto-fit columns based on template configuration or content
  worksheet.columns.forEach((column, index) => {
    const templateColumn = columnsToUse[index];
    if (templateColumn?.width) {
      column.width = templateColumn.width;
    } else if (column.header && typeof column.header === 'string') {
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
