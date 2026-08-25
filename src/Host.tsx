import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";
import { createNewRoom, authToken } from "./api";
import { useState } from "react";

export default function Host() {
  const [roomId, setRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRoomAndToken = async () => {
    try {
      setIsLoading(true);
      let targetRoomId = roomId.trim();

      if (targetRoomId.length < 14) {
        targetRoomId = await createNewRoom();
      }

      alert(targetRoomId)

      setRoomId(targetRoomId);
    } catch (error) {
      console.error("Failed to initialize demo room architecture:", error);
      alert("API Configuration Error. Check your authentication keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRoomLeave = () => {
    setRoomId("");
  };

  // The condition dynamically reacts perfectly once state resolves correctly
  return authToken && roomId.length == 14 ? (
    <MeetingProvider
      config={{
        meetingId: roomId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Twitch Host Demo",
        debugMode: true,
        mode: "SEND_AND_RECV"
      }}
      token={authToken}
      joinWithoutUserInteraction
    >
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-4">
        {/* Added a clear tracking header so you can copy the Room ID for your viewer tab easily */}
        <div className="bg-slate-900 border border-slate-800 text-xs px-4 py-2 rounded-lg font-mono text-slate-400">
          Live Session Active ID: <span className="text-purple-400 font-bold select-all">{roomId}</span>
        </div>

        {/* Added the clear handler reference to drop sessions */}
        <Controls onLeave={onRoomLeave} />
      </div>
    </MeetingProvider>
  ) : (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-sm w-full text-center space-y-4">
        <h1 className="text-xl font-black text-white">Streamer Deployment Deck</h1>
        <p className="text-xs text-slate-400">
          Leave blank to provision a clean cloud server instance automatically, or provide a legacy string token.
        </p>
        <input
          type="text"
          placeholder="Optional: Enter existing Room ID..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-purple-500"
        />
        <button
          onClick={getRoomAndToken}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold py-2.5 rounded text-sm transition cursor-pointer"
        >
          {isLoading ? "Provisioning Server..." : "Deploy Studio Room Instance"}
        </button>
      </div>
    </div>
  );
}

// Added typed prop structure to handle session drop cycles safely
const Controls = ({ onLeave }: { onLeave: () => void }) => {
  const { join, leave, toggleMic, toggleWebcam, toggleScreenShare, startHls, stopHls, localParticipant } = useMeeting();

  const handleDisconnect = () => {
    leave();
    onLeave(); // Clear parent app state to throw user back to deployment console cleanly
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-md w-full">
      <h2 className="text-lg font-bold text-white text-center">Streamer Studio Panel</h2>

      {/* Step 1: Connect hardware devices to VideoSDK Room */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={join} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-xs transition cursor-pointer">
          1. Connect Hardware
        </button>
        <button onClick={handleDisconnect} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-semibold text-xs transition cursor-pointer">
          Disconnect Studio
        </button>
      </div>

      {/* Step 2: Toggle exact media streams */}
      <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4 justify-center">
        <button onClick={() => toggleMic()} className={`px-4 py-2 rounded text-xs font-bold transition cursor-pointer ${localParticipant?.micOn ? "bg-green-600" : "bg-red-600"} text-white`}>
          {localParticipant?.micOn ? "🎙️ Mic: ON" : "🎙️ Mic: MUTED"}
        </button>
        <button onClick={() => toggleWebcam()} className={`px-4 py-2 rounded text-xs font-bold transition cursor-pointer ${localParticipant?.webcamOn ? "bg-green-600" : "bg-red-600"} text-white`}>
          {localParticipant?.webcamOn ? "📷 Camera: ON" : "📷 Camera: OFF"}
        </button>
        <button onClick={() => toggleScreenShare()} className={`px-4 py-2 rounded text-xs font-bold transition cursor-pointer ${localParticipant?.screenShareOn ? "bg-green-600" : "bg-red-600"} text-white`}>
          {localParticipant?.screenShareOn ? "🖥️ Desktop Share: ON" : "🖥️ Desktop Share: OFF"}
        </button>
      </div>

      {/* Step 3: Trigger Cloud mixing and start the public HLS stream pipeline */}
      <div className="border-t border-slate-800 pt-4 flex gap-2 justify-center">
        <button
          onClick={() => startHls({ layout: { type: "SIDEBAR", priority: "SPEAKER", gridSize: 4 }, theme: "DARK", mode: "video-and-audio" })}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold text-xs transition cursor-pointer"
        >
          🚀 START PUBLIC HLS STREAM
        </button>
        <button onClick={stopHls} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold text-xs transition cursor-pointer">
          🛑 STOP BROADCAST
        </button>
      </div>
    </div>
  );
};

