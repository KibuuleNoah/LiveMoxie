import React, {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export interface AppCtxType {
  setRoomId: Dispatch<SetStateAction<string>>
  roomId: string
}

export const AppCtx = React.createContext<
  AppCtxType | undefined
>(undefined);

export const AppProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>("");
  return (
    <AppCtx.Provider value={{
      setRoomId,
      roomId
    }}>
      {children}
    </AppCtx.Provider>
  );
};
