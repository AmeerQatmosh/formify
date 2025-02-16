// components/RecordsTable.js
export default function RecordsTable({ records, fields, darkMode }) {
    if (records.length === 0) {
      return <p className="text-center mt-4">No records saved yet.</p>;
    }
  
    return (
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
    );
  }
  