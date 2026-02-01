import './App.css';
import Nouislider from 'nouislider-react';
import 'nouislider/distribute/nouislider.css';
import { use, useEffect, useRef, useState } from 'react';
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

  let initialSliderValues = 0;

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
    loadScript("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js").then(() => {
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

  const updateOnSliderChange = () => {};

  useEffect(() => {
    if(videoRef && videoRef.current){
      const currentVideo = videoRef.current;
      currentVideo.onloadedmetadata = () => {
        setVideoDuration(currentVideo.duration);
        setEndTime(currentVideo.duration);
      }
    }
  }, 
  [videoSrc]);

  return (
    <>
      <div className="App p-6 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">Vaideon</h1>
        <input onChange={handleFileUpload} type="file" className="p-2 border border-gray-300 rounded-md shadow-sm" />
      </div>

      {videoSrc && (
        <>
          <video src={videoSrc} ref={videoRef} className="mb-4 w-full rounded-lg shadow-lg" onTimeUpdate={handlePauseVideo} controls/>
          <div className="w-full mb-4">
	  <Nouislider behaviour='tap-drag' step={1} range={{min:0, max:videoDuration || 2}} start={[0, videoDuration || 2]} connect onUpdate={updateOnSliderChange}/></div>
        </>
      )}
    </>
  );
}

export default App;
