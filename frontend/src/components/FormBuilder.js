import { useState } from "react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableField from "./SortableField";


export default function FormBuilder({ fields, setFields, setRecords, darkMode }) { // 🔥 Use fields from App.js
  const [newField, setNewField] = useState({ label: "", type: "text", options: "" });
  const [formData, setFormData] = useState({});

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

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    setFields((prevFields) => arrayMove(prevFields, oldIndex, newIndex));
  };


  const removeField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };


  return (
    <div className={`border p-4 rounded-md ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"} mb-4`}>
      {/* Add Field Form */}
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
                removeField={removeField} // 🔥 Pass removeField function
              />

            ))}
          </div>
        </SortableContext>
      </DndContext>


      {/* Render Fields */}
      {/* <div className="space-y-3 mt-4">
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
      </div> */}

      {/* Save Button */}
      <button
        onClick={saveRecord}
        className="px-4 py-2 mt-4 bg-green-500 text-white rounded-md w-full hover:bg-green-600 transition"
      >
        Save Record
      </button>
    </div>
  );
}
