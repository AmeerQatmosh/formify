import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function DynamicFormBuilder() {
  const [fields, setFields] = useState([]);
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Your data will be lost!";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const addField = (type) => {
    const label = prompt("Enter field label:");
    if (label) {
      setFields([...fields, { label, type }]);
    }
  };

  const handleInputChange = (label, value) => {
    setFormData({ ...formData, [label]: value });
  };

  const saveRecord = () => {
    setRecords([...records, formData]);
    setFormData({});
  };

  const exportData = (format) => {
    if (records.length === 0) return alert("No records to export");
    if (format === "json") {
      const json = JSON.stringify(records, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "data.json";
      link.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(records);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `data.${format}`);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Dynamic Form Builder</h1>
      <div className="mb-4">
        <button onClick={() => addField("text")} className="px-4 py-2 bg-blue-500 text-white rounded-md">Add Text Field</button>
        <button onClick={() => addField("number")} className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md">Add Number Field</button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium">{field.label}</label>
            <input
              type={field.type}
              value={formData[field.label] || ""}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              className="mt-1 border p-2 rounded-md w-full"
            />
          </div>
        ))}
      </div>
      <button onClick={saveRecord} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md">Save Record</button>
      <div className="mt-4">
        <button onClick={() => exportData("json")} className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md">Export JSON</button>
        <button onClick={() => exportData("csv")} className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md">Export CSV</button>
        <button onClick={() => exportData("xlsx")} className="px-4 py-2 bg-gray-500 text-white rounded-md">Export Excel</button>
      </div>
    </div>
  );
}
