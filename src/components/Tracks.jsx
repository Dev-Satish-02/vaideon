export default function Tracks({ tracks }) {
  return (
    <div className="space-y-3 mt-4">
      <TrackRow label="Video" clips={tracks.video} color="bg-blue-500" />
      <TrackRow label="Audio" clips={tracks.audio} color="bg-green-500" />
    </div>
  );
}

function TrackRow({ label, clips, color }) {
  return (
    <div>
      <div className="text-xs text-zinc-400 mb-1">{label}</div>

      <div className="relative h-10 bg-zinc-800 rounded overflow-hidden">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className={`absolute h-full ${color} rounded`}
            style={{
              left: `${clip.start * 10}px`,
              width: `${(clip.end - clip.start) * 10}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

