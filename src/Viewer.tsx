import React, { useState, useEffect, useRef } from "react";

type StreamStatus = "idle" | "connecting" | "waiting" | "live" | "error";

export default function Viewer() {
  const [roomId, setRoomId] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const hlsPlaybackUrl = `https://videosdk.live{roomId}/index.m3u8`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!joined || !roomId.trim()) return;

    setStatus("connecting");
    setErrorMessage("");

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;

    script.onload = () => {
      const video = videoRef.current;
      if (!video) return;

      // @ts-ignore
      if (window.Hls && window.Hls.isSupported()) {
        // @ts-ignore
        const hls = new window.Hls({
          // Set aggressive manifest loading retries so the player automatically reconnects when the host starts streaming
          manifestLoadingMaxRetry: Infinity,
          manifestLoadingRetryDelay: 3000,
          levelLoadingMaxRetry: Infinity,
        });

        hlsInstanceRef.current = hls;
        hls.loadSource(hlsPlaybackUrl);
        hls.attachMedia(video);

        // --- HLS STATUS & ERROR HANDLING CORE ENGINE ---

        // Triggered when the HLS file fragments are successfully discovered and parsed
        // @ts-ignore
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setStatus("live");
          setErrorMessage("");
          video.play().catch(() => {
            console.log("Autoplay blocked by browser. User interaction needed to trigger audio track.");
          });
        });

        // Catches deep transport and processing errors
        // @ts-ignore
        hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
          console.warn("HLS Node Event Warning:", data.details);

          if (data.fatal) {
            // @ts-ignore
            switch (data.type) {
              case "networkError":
                // 404 means the host hasn't clicked "Go Live" yet or the files aren't ready
                if (data.response?.status === 404) {
                  setStatus("waiting");
                  setErrorMessage("The stream is currently offline. Waiting for host to broadcast...");
                } else {
                  setStatus("error");
                  setErrorMessage("Network disruptions detected. Attempting automatic reconnection...");
                }
                hls.startLoad(); // Force the engine to try reading the CDN link target again
                break;
              case "mediaError":
                setStatus("error");
                setErrorMessage("Audio/Video decoding failure. Attempting buffer recovery...");
                hls.recoverMediaError();
                break;
              default:
                setStatus("error");
                setErrorMessage("Unrecoverable stream exception occurred.");
                hls.destroy();
                break;
            }
          } else if (data.response?.status === 404) {
            // Catch non-fatal initial polling 404s cleanly
            setStatus("waiting");
          }
        });

      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native fallback engine for Safari and iOS environments
        video.src = hlsPlaybackUrl;

        video.addEventListener("loadedmetadata", () => {
          setStatus("live");
        });

        video.addEventListener("error", () => {
          setStatus("waiting");
          setErrorMessage("Stream link uninitialized. Retrying playback pipeline loop...");
          // Fallback simple native poller
          setTimeout(() => {
            if (videoRef.current) videoRef.current.src = hlsPlaybackUrl;
          }, 5000);
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
    };
  }, [joined, hlsPlaybackUrl, roomId]);

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

  // Rendering screen 2: Live Player Layout Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-3xl w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Public Audience Theater Seat</h2>

          {/* VISUAL STREAM STATUS STATE BADGES */}
          <div className="flex items-center gap-2">
            {status === "connecting" && (
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-semibold animate-pulse">
                🔄 Connecting...
              </span>
            )}
            {status === "waiting" && (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-semibold animate-pulse">
                ⏳ Waiting for Host...
              </span>
            )}
            {status === "live" && (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold tracking-wide animate-pulse">
                ● LIVE
              </span>
            )}
            {status === "error" && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-semibold">
                ⚠️ Stream Error
              </span>
            )}
          </div>
        </div>

        {/* PLAYBACK SCREEN CANVAS */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center">

          {/* Overlay text shown to user when the stream isn't active yet */}
          {status !== "live" && (
            <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center text-center p-4">
              <div className="text-2xl mb-2">{status === "error" ? "❌" : "📺"}</div>
              <p className="text-sm font-semibold text-slate-200">
                {status === "connecting" && "Initializing network layer handles..."}
                {status === "waiting" && "The broadcast has not started yet."}
                {status === "error" && "Recovering video link interface..."}
              </p>
              {errorMessage && (
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{errorMessage}</p>
              )}
            </div>
          )}

          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 bg-slate-950 p-2 rounded">
          <span className="break-all font-mono">Target: {hlsPlaybackUrl}</span>
          <button
            onClick={() => setJoined(false)}
            className="text-purple-400 hover:underline shrink-0 pl-4 bg-transparent border-none cursor-pointer"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}

