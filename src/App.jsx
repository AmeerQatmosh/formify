import * as XLSX from "xlsx";
import { useState } from "react";
import FormBuilder from "../components/FormBuilder";
import RecordsTable from "../components/RecordsTable";
export default function App() {

  const [records, setRecords] = useState([]);
  const [fields, setFields] = useState(() => {
    const savedFields = localStorage.getItem("formFields");
    return savedFields ? JSON.parse(savedFields) : [];
  });

  const [darkMode, setDarkMode] = useState(false);

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
    <div className={`${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"} min-h-screen p-6`}>
      <div className={`max-w-xl mx-auto shadow-lg p-6 m-12 rounded-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Header & Dark Mode Toggle */} 
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Dynamic Form Builder</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="px-3 py-1 rounded transition duration-200 
            bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-500 dark:text-gray-200 dark:hover:bg-gray-400 cursor-pointer"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Form Builder Component */}
        <FormBuilder fields={fields} setFields={setFields} setRecords={setRecords} darkMode={darkMode} />

        {/* Export Buttons */}
        <div className="flex justify-between mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={() => exportData("xlsx")} className="px-4 py-2 m-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">
            Download Excel
          </button>
          <button onClick={() => exportData("csv")} className="px-4 py-2 m-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition">
            Download CSV
          </button>
          <button onClick={() => exportData("json")} className="px-4 py-2 m-2 bg-emerald-400 text-white rounded-md hover:bg-emerald-500 transition">
            Download JSON
          </button>
        </div>

        {/* Records Table */}
        <RecordsTable records={records} fields={fields} darkMode={darkMode} />
      </div>
    </div>
  );
}
