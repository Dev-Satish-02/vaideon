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

  const handlePlay = () => {
    if (videoRef && videoRef.current) videoRef.current.play();
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        start: startTime,
        end: endTime,
        fileName: `section${sections.length + 1}.mp4`,
      },
    ]);
  };

  let handleTrim = async () => {
    if (isScriptLoaded) {
      Swal.fire({
        title: "Processing...",
        html: "Please wait while video is being processed",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const { name } = videoFile;
      await ffmpeg.FS(
        "writeFile",
        name,
        await window.FFmpeg.fetchFile(videoFile),
      );
      for (const section of sections) {
        const { start, end, fileName } = section;
        await ffmpeg.run(
          "-i",
          name,
          "-ss",
          `${convertToHHMMSS(start)}`,
          "-to",
          `${convertToHHMMSS(end)}`,
          "-c:v",
          "copy",
          fileName,
        );
      }

      // merge into one video

      const concatList = sections
        .map((section) => `file ${section.fileName}`)
        .join("\n");
      ffmpeg.FS("writeFile", "concatList.txt", concatList);

      await ffmpeg.run(
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "concatList.txt",
        "-c",
        "copy",
        "output.mp4",
      );
      const data = ffmpeg.FS("readFile", "output.mp4");
      const url = URL.createObjectURL(
        new Blob([data.buffer], {
          type: "video/mp4",
        }),
      );
      setVideoTrimmedUrl(url);
      Swal.close();
      Swal.fire({
        title: "Done",
        text: "Video Processed",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
    }
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

          <div className="flex space x-4 mb-4">
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
            >
              Play
            </button>
            <button
              onClick={handleAddSection}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600"
            >
              Add Section
            </button>
          </div>
          {sections.length > 0 && (
            <div className="mb-4 text-gray-700 w-full max-w-md">
              <h2 className="text-4xl font-semibold mb-2 text-gray-800">
                Sections
              </h2>
              <ul>
                {sections.map((section, index) => (
                  <li key={index}>
                    Section {index + 1}: {convertToHHMMSS(section.start)} -{" "}
                    {convertToHHMMSS(section.end)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex space-x-4">
            <button
              onClick={handleTrim}
              className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-500"
            >
              Trim & Merge
            </button>
          </div>
          {videoTrimmedUrl && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {" "}
                Merged & Trimmed Video
              </h2>
              <video controls className="w-full max-w-md rounded-lg shadow-lg">
                <source src={videoTrimmedUrl} type="video/mp4"/>
              </video>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
