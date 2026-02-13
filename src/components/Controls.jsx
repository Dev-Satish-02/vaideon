export default function Controls({ onPlay, onAddSection, onTrim }) {
  return (
    <div className="flex space-x-4 mt-4">
      <button
        onClick={onPlay}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Play
      </button>

      <button
        onClick={onAddSection}
        className="px-4 py-2 bg-yellow-600 text-white rounded-md"
      >
        Add Section
      </button>

      <button
        onClick={onTrim}
        className="px-4 py-2 bg-green-600 text-white rounded-md"
      >
        Trim & Merge
      </button>
    </div>
  );
}

