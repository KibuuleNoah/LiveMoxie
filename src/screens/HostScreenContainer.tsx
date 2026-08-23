import { MeetingProvider } from "@videosdk.live/react-sdk";
import MediaControlsContainer from "./MediaControlsContainer";

import { authToken } from "../api";

const HostScreenContainer = ({ meetingId }) => {
  return (
    <MeetingProvider
      token={authToken || ""}
      config={{
        meetingId,
        name: "C.V. Raman",
        micEnabled: true,
        webcamEnabled: true,

      }}
      joinWithoutUserInteraction
    >
      <MediaControlsContainer meetingId={meetingId} />
    </MeetingProvider>
  );
};

export default HostScreenContainer;
