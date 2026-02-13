import { convertToHHMMSS } from "../utils/time";

export default function SectionsList({ sections }) {
  if (!sections.length) return null;

  return (
    <div className="mt-4 text-zinc-300">
      <h2 className="text-lg font-semibold mb-2">Sections</h2>
      <ul className="space-y-1">
        {sections.map((s, i) => (
          <li key={s.id}>
            Section {i + 1}: {convertToHHMMSS(s.start)} –{" "}
            {convertToHHMMSS(s.end)}
          </li>
        ))}
      </ul>
    </div>
  );
}

