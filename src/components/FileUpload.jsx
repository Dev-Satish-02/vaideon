export default function FileUpload({ onUpload }) {
  return (
    <input
      type="file"
      onChange={onUpload}
      className="p-2 border border-gray-300 rounded-md shadow-sm"
    />
  );
}

