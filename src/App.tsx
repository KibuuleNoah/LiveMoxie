import { useState } from "react";
import HostScreenContainer from "./screens/HostScreenContainer";
import ViewerScreenContainer from "./screens/ViewerScreenContainer";
import WelcomeScreenContainer from "./screens/WelcomeScreenContainer";

const App = () => {
  const [appData, setAppData] = useState({ meetingId: null, mode: null });

  return appData.meetingId ? (
    appData.mode === "CONFERENCE" ? (
      <HostScreenContainer meetingId={appData.meetingId} />
    ) : (
      <ViewerScreenContainer meetingId={appData.meetingId} />
    )
  ) : (
    <WelcomeScreenContainer setAppData={setAppData} />
  );
};

export default App;

