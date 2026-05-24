function rowsForExport(records, fields) {
  return records.map((row) => {
    const out = {};
    for (const f of fields) {
      out[f.label] = row[f.label];
    }
    return out;
  });
}

/** Download submissions as JSON, CSV, or XLSX using column order from fields. */
export async function exportRecords(records, fields, format) {
  const data = rowsForExport(records, fields);

  if (format === "json") {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "formify-records.json";
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Records");
  worksheet.columns = fields.map((field) => ({
    header: field.label,
    key: field.label,
    width: 22,
  }));

  data.forEach((record) => {
    worksheet.addRow(record);
  });

  let buffer;
  let mime;
  let filename;

  if (format === "xlsx") {
    buffer = await workbook.xlsx.writeBuffer();
    mime =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    filename = "formify-records.xlsx";
  } else if (format === "csv") {
    buffer = await workbook.csv.writeBuffer();
    mime = "text/csv;charset=utf-8;";
    filename = "formify-records.csv";
  } else {
    throw new Error("Unsupported format");
  }

  const blob = new Blob([buffer], { type: mime });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
