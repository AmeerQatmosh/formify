import { useState } from "react";

export default function AddFieldForm({ onAddField, darkMode }) {
  const [newField, setNewField] = useState({ label: "", type: "text", options: "" });

  const handleAddField = () => {
    if (!newField.label.trim()) {
      alert("Label is required!");
      return;
    }

    const options = newField.type === "select"
      ? newField.options.split(",").map(opt => opt.trim()).filter(opt => opt)
      : [];

    onAddField({ id: Date.now().toString(), ...newField, options });
    setNewField({ label: "", type: "text", options: "" });
  };

  return (
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
        onClick={handleAddField}
        className="px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600 transition"
      >
        Add Field
      </button>
    </div>
  );
}
