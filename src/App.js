import "./App.css";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import { use, useEffect, useRef, useState } from "react";
let ffmpeg;

function App() {
  const [endTime, setEndTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");
  const [videoFile, setVideoFile] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [videoTrimmedUrl, setVideoTrimmedUrl] = useState("");
  const [sections, setSections] = useState([]);
  const videoRef = useRef();
  const [videoDuration, setVideoDuration] = useState(0);

  let initialSliderValue = 0;

  // Define Swal as a global variable to prevent ESLint errors

  /* global Swal */

  const loadScript = (src) => {
    return new Promise((onFulfilled, _) => {
      const script = document.createElement("script");
      let loaded;
      script.async = "async";
      script.defer = "defer";
      script.setAttribute("src", src);
      script.onreadystatechange = script.onload = () => {
        if (!loaded) {
          onFulfilled(true);
        }
        loaded = true;
      };
      script.onerror = function () {
        console.log("Error loading script.");
      };
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  };

  useEffect(() => {
    loadScript(
      "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js",
    ).then(() => {
      if (typeof window !== "undefined") {
        ffmpeg = window.FFmpeg.createFFmpeg({ log: true });
        ffmpeg.load();
        setIsScriptLoaded(true);
      }
    });
  }, []);

  const handleFileUpload = (e) => {
    let file = e.target.files[0];
    let blobUrl = URL.createObjectURL(file);
    setVideoSrc(blobUrl);
    setVideoFile(file);
  };

  const handlePauseVideo = () => {};

  const updateOnSliderChange = (values, handle) => {
    setVideoTrimmedUrl("");
    const value = Math.floor(values[handle]);
    if (handle === 0) {
      setStartTime(value);
      if (videoRef.current) {
        videoRef.current.currentTime = value;
      }
    }
    if (handle === 1) setEndTime(value);
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      const currentVideo = videoRef.current;
      currentVideo.onloadedmetadata = () => {
        setVideoDuration(currentVideo.duration);
        setEndTime(currentVideo.duration);
      };
    }
  }, [videoSrc]);

  const convertToHHMMSS = (val) => {
    const secNum = parseInt(val, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    let time;
    if (hours === "00") time = minutes + ":" + seconds;
    else time = hours + ":" + minutes + ":" + seconds;
    return time;
  };

  return (
    <div className="App p-6 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Vaideon</h1>
      <input
        onChange={handleFileUpload}
        type="file"
        className="p-2 border border-gray-300 rounded-md shadow-sm"
      />
      {videoSrc && (
        <>
          <div className="w-full max-w-4xl px-6">
            <video
              src={videoSrc}
              ref={videoRef}
              className="mb-4 w-full rounded-lg shadow-lg"
              onTimeUpdate={handlePauseVideo}
              controls
            />

            <Nouislider
              behaviour="tap-drag"
              step={1}
              range={{ min: 0, max: videoDuration || 2 }}
              start={[0, videoDuration || 2]}
              connect
              onUpdate={updateOnSliderChange}
            />
          </div>
          <div className="mb-4 text-gray-700">
            Start Duration: {convertToHHMMSS(startTime)} &nbsp; End Duration:{" "}
            {convertToHHMMSS(endTime)}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
