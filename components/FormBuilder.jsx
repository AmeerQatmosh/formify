import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableField from "./SortableField";

export default function FormBuilder({ fields, setFields, setRecords, darkMode }) { // 🔥 Use fields from App.js
  const [newField, setNewField] = useState({ label: "", type: "text", options: "" });
  const [formData, setFormData] = useState({});
  const [showPreview, setShowPreview] = useState(false); // 🔥 Added for preview modal

  // 🔥 Load saved form from localStorage on page load
  useEffect(() => {
    const savedFields = localStorage.getItem("formFields");
    if (savedFields) {
      setFields(JSON.parse(savedFields));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("formFields", JSON.stringify(fields));
  }, [fields]);


  const addField = () => {
    if (!newField.label.trim()) return alert("Label is required!");
    const options = newField.type === "select"
      ? newField.options.split(",").map(opt => opt.trim()).filter(opt => opt)
      : [];
    const newFieldData = { id: Date.now().toString(), ...newField, options };

    setFields([...fields, newFieldData]); // 🔥 Update fields
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
    setRecords((prevRecords) => [...prevRecords, formData]);
    setFormData({});
  };

  // 🚀 Handle Drag & Drop Sorting
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prevFields) => {
      const oldIndex = prevFields.findIndex((field) => field.id === active.id);
      const newIndex = prevFields.findIndex((field) => field.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevFields; // 🔥 Prevent crash if item was removed
      return arrayMove(prevFields, oldIndex, newIndex);
    });
  };

  // const removeField = (id) => {
  //   window.confirm("Are you sure you want to delete this field?") &&
  //     setFields((prevFields) => prevFields.filter((field) => field.id !== id));
  // };

  const exportForm = () => {
    if (fields.length === 0) {
      alert("No fields to export!");
      return;
    }

    try {
      const json = JSON.stringify(fields, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "form.json";
      link.click();

      alert("✅ Form exported successfully!");
    } catch (error) {
      alert("❌ Error exporting form. Please try again.");
    }
  };

  const importForm = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFields = JSON.parse(e.target.result);

        // 🔥 Validate the imported JSON structure
        if (!Array.isArray(importedFields)) throw new Error("Invalid JSON format!");
        if (!importedFields.every(field => field.id && field.label && field.type)) {
          throw new Error("Invalid form structure!");
        }

        setFields(importedFields);
        alert("✅ Form imported successfully!");
      } catch (error) {
        alert("❌ Error importing form. Make sure it's a valid JSON file.");
      }
    };

    reader.readAsText(file);
  };

  const clearForm = () => {
    if (window.confirm("Are you sure you want to clear the form?")) {
      setFields([]);
      localStorage.removeItem("formFields");
    }
  };


  return (
    <div className={`border p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50 text-gray-900"} mb-4`}>
      <h2 className="text-xl font-semibold mb-4 text-center">Form Builder</h2>
      {/* Add Field Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      <button
        onClick={addField}
        className="p-2 px-4 py-2 mt-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600 transition"
      >
        Add Field
      </button>


    {fields.length === 0 && (
      <p className="text-center mt-4 w-full">No Fields added yet.</p>
    )}


      {newField.type === "select" && (
        <input
          type="text"
          placeholder="Dropdown Options (comma separated)"
          value={newField.options}
          onChange={(e) => setNewField({ ...newField, options: e.target.value })}
          className={`border p-2 rounded-md mt-2 w-full ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`}
        />
      )}


      {/* 🚀 Drag & Drop Fields */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mt-4">
            {fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                formData={formData}
                handleInputChange={handleInputChange}
                darkMode={darkMode}
                //removeField={() => removeField(field.id)} // ✅ Now correctly passing it
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      
      {/* Save Button */}
      <button
        onClick={saveRecord}
        className="px-4 py-2 mt-4 bg-green-500 text-white rounded-md w-full hover:bg-green-600 transition"
      >
        Save Record
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <button
        onClick={exportForm}
        className="cursor-pointer px-4 py-2 bg-yellow-500 text-white rounded-md w-full text-center hover:bg-yellow-600 transition block"
      >
        Export
      </button>

      <input
        type="file"
        accept=".json"
        onChange={importForm}
        className="hidden"
        id="import-file"
      />
      <label
        htmlFor="import-file"
        className="cursor-pointer px-4 py-2 bg-orange-500 text-white rounded-md w-full text-center hover:bg-orange-600 transition block"
      >
        Import
      </label>
      
      <button
        onClick={clearForm}
        className="px-4 py-2 bg-red-500 text-white rounded-md w-full hover:bg-red-600 transition"
      >
        Clear
      </button>


      {/* 🚀 NEW: Preview Form Button */}
      <button
        onClick={() => setShowPreview(true)}
        className="px-4 py-2 bg-pink-500 text-white rounded-md w-full hover:bg-pink-600 transition"
      >
        Preview
      </button>

      {/* 🔥 Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`p-6 rounded-md w-96 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <h2 className="text-xl font-bold mb-4">Form Preview</h2>
            <div className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-gray-500">No fields to preview.</p>
              ) : (
                fields.map((field) => (
                  <div key={field.id} className="mb-2">
                    <label className="block text-sm font-medium">{field.label}</label>
                    <input
                      type={field.type}
                      className={`mt-1 border p-2 rounded-md w-full ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      disabled
                    />
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 mt-4 bg-red-500 text-white rounded-md w-full hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </div>

  
  );
}


