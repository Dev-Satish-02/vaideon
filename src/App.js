import "./App.css";
import { useEffect, useRef, useState } from "react";

import FileUpload from "./components/FileUpload";
import VideoPreview from "./components/VideoPreview";
import Timeline from "./components/Timeline";
import Controls from "./components/Controls";
import SectionsList from "./components/SectionsList";

import { convertToHHMMSS } from "./utils/time";

let ffmpeg;

/* global Swal */

function App() {
  const videoRef = useRef();

  const [videoSrc, setVideoSrc] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [sections, setSections] = useState([]);
  const [videoTrimmedUrl, setVideoTrimmedUrl] = useState("");

  /* ---------- Load FFmpeg ---------- */
  const loadScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      document.head.appendChild(script);
    });

  useEffect(() => {
    const loadFFmpeg = async () => {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
      );
      ffmpeg = window.FFmpeg.createFFmpeg({ log: true });
      await ffmpeg.load();
    };
    loadFFmpeg();
  }, []);

  /* ---------- File Upload ---------- */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoFile(file);
    setVideoSrc(URL.createObjectURL(file));
    setSections([]);
    setVideoTrimmedUrl("");
  };

  /* ---------- Slider ---------- */
  const updateOnSliderChange = (values, handle) => {
    const value = Math.floor(values[handle]);

    if (!videoRef.current) return;

    if (handle === 0) {
      setStartTime(value);
      videoRef.current.currentTime = value;
    }

    if (handle === 1) {
      setEndTime(value);
    }
  };

  /* ---------- Metadata ---------- */
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.onloadedmetadata = () => {
      setVideoDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    };
  }, [videoSrc]);

  /* ---------- Controls ---------- */
  const handlePlay = () => {
    videoRef.current?.play();
  };

  const handleAddSection = () => {
    const index = sections.length + 1;

    const section = {
      id: crypto.randomUUID(),
      start: startTime,
      end: endTime,
      fileName: `section${index}.mp4`,
    };

    setSections((prev) => [...prev, section]);
  };

  /* ---------- Trim & Merge ---------- */
  const handleTrim = async () => {
    if (!videoFile || sections.length === 0) return;

    Swal.fire({
      title: "Processing...",
      html: "Please wait while video is being processed",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const inputName = videoFile.name;

    ffmpeg.FS(
      "writeFile",
      inputName,
      await window.FFmpeg.fetchFile(videoFile)
    );

    for (const section of sections) {
      await ffmpeg.run(
        "-i",
        inputName,
        "-ss",
        convertToHHMMSS(section.start),
        "-to",
        convertToHHMMSS(section.end),
        "-c",
        "copy",
        section.fileName
      );
    }

    const concatText = sections
      .map((s) => `file '${s.fileName}'`)
      .join("\n");

    ffmpeg.FS("writeFile", "concat.txt", concatText);

    await ffmpeg.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "concat.txt",
      "-c",
      "copy",
      "output.mp4"
    );

    const data = ffmpeg.FS("readFile", "output.mp4");

    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    setVideoTrimmedUrl(url);

    Swal.close();
    Swal.fire("Done", "Video Processed", "success");
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Vaideon</h1>

      <FileUpload onUpload={handleFileUpload} />

      {videoSrc && (
        <>
          <VideoPreview videoRef={videoRef} src={videoSrc} />

          <div className="mt-4">
            <Timeline
              duration={videoDuration}
              onUpdate={updateOnSliderChange}
            />
          </div>

          <div className="mt-2 text-sm text-zinc-400">
            Start: {convertToHHMMSS(startTime)} | End:{" "}
            {convertToHHMMSS(endTime)}
          </div>

          <Controls
            onPlay={handlePlay}
            onAddSection={handleAddSection}
            onTrim={handleTrim}
          />

          <SectionsList sections={sections} />

          {videoTrimmedUrl && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">
                Merged & Trimmed Video
              </h2>
              <video
                src={videoTrimmedUrl}
                controls
                className="w-full max-w-md rounded-lg"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
