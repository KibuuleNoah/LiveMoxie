import { useEffect, useRef, useState, useMemo } from "react";
import {
  MeetingConsumer,
  Constants,
  MeetingProvider,
  useMeeting,
} from "@videosdk.live/react-sdk";
import Hls from "hls.js";
import { authToken } from "./api";


// type StreamStatus = "idle" | "connecting" | "waiting" | "live" | "error";

function Viewer() {
  const [roomId, setRoomId] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  // const [status, setStatus] = useState<StreamStatus>("idle");
  // const [errorMessage, setErrorMessage] = useState<string>("");


  // Handle Form Submission Barrier
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      alert("Please enter a valid Room ID to connect.");
      return;
    }
    setJoined(true);
  };

  // Rendering screen 1: Entry Gate
  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-sm w-full space-y-4">
          <h1 className="text-xl font-black text-white text-center">Enter Room</h1>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">ROOM IDENTIFIER</label>
            <input
              type="text"
              required
              placeholder="e.g. twitch-sandbox"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded text-sm transition cursor-pointer"
          >
            Join Theater Audience
          </button>
        </form>
      </div>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId: roomId,
        mode: "RECV_ONLY"
      }}
      token={authToken || ""}
      joinWithoutUserInteraction
    // mode="VIEWER" // Crucial: sets participant as a passive viewer
    >
      <MeetingConsumer>
        {({ hlsState }) =>
          hlsState === Constants.hlsEvents.HLS_PLAYABLE ? (
            <HLSPlayer />
          ) : (
            <p>Waiting for host to start stream...</p>
          )
        }
      </MeetingConsumer>
    </MeetingProvider>
  );
}


const HLSPlayer = () => {
  const { hlsUrls, hlsState } = useMeeting();

  const playerRef = useRef(null);

  const hlsPlaybackHlsUrl = useMemo(() => hlsUrls.playbackHlsUrl, [hlsUrls]);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        maxLoadingDelay: 4,
        minAutoBitrate: 0,
        autoStartLoad: true,
        defaultAudioCodec: "mp4a.40.2",
      });

      let player = document.querySelector("#hlsPlayer");

      hls.loadSource(hlsPlaybackHlsUrl);
      hls.attachMedia(player);
    } else {
      if (typeof playerRef.current?.play === "function") {
        playerRef.current.src = hlsPlaybackHlsUrl;
        playerRef.current.play();
      }
    }
  }, [hlsPlaybackHlsUrl, hlsState]);

  return (
    <video
      ref={playerRef}
      id="hlsPlayer"
      autoPlay
      controls
      style={{ width: "70%", height: "70%" }}
      playsInline
      playing
      onError={(err) => console.log(err, "hls video error")}
    ></video>
  );
};

export default Viewer;
