import { useMeeting } from "@videosdk.live/react-sdk";
import { useMemo } from "react";
import SingleParticipantContainer from "./SingleParticipantContainer";

const ParticipantsGridContainer = () => {
  const { participants } = useMeeting();

  const participantIds = useMemo(
    () => [...participants.keys()],
    [participants]
  );

  return (
    <div>
      {participantIds.map((participantId) => (
        <SingleParticipantContainer
          {...{ participantId, key: participantId }}
        />
      ))}
    </div>
  );
};

export default ParticipantsGridContainer;
