import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableField({ field, formData, handleInputChange, darkMode, removeField }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`p-3 border rounded-md flex justify-between items-center cursor-grab ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"}`}>
      <div className="flex-1">
        <label className="block text-sm font-medium">{field.label}</label>
        <input
          type={field.type}
          value={formData[field.label] || ""}
          onChange={(e) => handleInputChange(field.label, e.target.value)}
          className={`mt-1 border p-2 rounded-md w-full ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300"}`}
        />
      </div>
      {/* <button
        onClick={removeField} // ✅ Directly calls the delete function
        className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        ❌ Delete
      </button> */}
    </div>
  );
}
