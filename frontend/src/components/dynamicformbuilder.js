import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function DynamicFormBuilder() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ label: "", type: "text", options: "" });
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Your data will be lost!";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const addField = () => {
    if (!newField.label.trim()) return alert("Label is required!");
    
    const options = newField.type === "select"
      ? newField.options.split(",").map(opt => opt.trim()).filter(opt => opt)
      : [];

    setFields([...fields, { id: Date.now().toString(), ...newField, options }]);
    setNewField({ label: "", type: "text", options: "" });
  };

  const handleInputChange = (label, value) => {
    setFormData({ ...formData, [label]: value });
  };

  const saveRecord = () => {
    if (Object.keys(formData).length === 0) {
      alert("Fill out the form before saving!");
      return;
    }
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
    <div className={`${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"} min-h-screen p-6`}>
      <div className={`max-w-xl mx-auto shadow-lg p-6 rounded-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Dynamic Form Builder</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="px-3 py-1 rounded transition duration-200 
            bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-300 dark:text-gray-900 dark:hover:bg-gray-400"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Add Field Section */}
        <div className={`border p-4 rounded-md ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"} mb-4`}>
          <input
            type="text"
            placeholder="Field Label"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            className={`border p-2 rounded-md w-full mb-2 ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300"}`}
          />
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className={`border p-2 rounded-md w-full mb-2 ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300"}`}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="textarea">Textarea</option>
            <option value="checkbox">Checkbox</option>
            <option value="select">Dropdown</option>
          </select>
          {newField.type === "select" && (
            <input
              type="text"
              placeholder="Dropdown Options (comma separated)"
              value={newField.options}
              onChange={(e) => setNewField({ ...newField, options: e.target.value })}
              className={`border p-2 rounded-md w-full mb-2 ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300"}`}
            />
          )}
          <button 
            onClick={addField} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600 transition"
          >
            Add Field
          </button>
        </div>

        {/* Render Fields */}
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className={`p-3 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"}`}>
              <label className="block text-sm font-medium">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.label] || ""}
                onChange={(e) => handleInputChange(field.label, e.target.value)}
                className={`mt-1 border p-2 rounded-md w-full ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300"}`}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button 
            onClick={saveRecord} 
            className="px-4 py-2 m-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Save Record
          </button>
          <button 
            onClick={() => exportData("xlsx")} 
            className="px-4 py-2 m-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Download Excel
          </button>
          <button 
            onClick={() => exportData("csv")} 
            className="px-4 py-2 m-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
          >
            Download CSV
          </button>
          <button 
            onClick={() => exportData("json")} 
            className="px-4 py-2 m-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Download JSON
          </button>
        </div>

        {/* Records Table */}
        {records.length > 0 && (
          <div className={`mt-6 p-4 border rounded-md ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}`}>
            <h2 className="text-xl font-semibold mb-3">Saved Records</h2>
            <div className="overflow-auto max-h-64">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className={`${darkMode ? "bg-gray-600 text-white" : "bg-gray-300"}`}>
                    {fields.map((field) => (
                      <th key={field.id} className="border p-2">{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index} className={`${darkMode ? "border-gray-600" : "border-gray-300"} border`}>
                      {fields.map((field) => (
                        <td key={field.id} className="border p-2">{record[field.label] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
