export default function VideoPreview({ videoRef, src }) {
  return (
    <div className="flex items-center justify-center bg-black rounded-lg">
      <video
        ref={videoRef}
        src={src}
        className="max-w-5xl rounded-lg pointer-events-none select-none"
      />
    </div>
  );
}

