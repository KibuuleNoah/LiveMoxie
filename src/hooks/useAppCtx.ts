import { AppCtx } from "../ctx/AppCtx";
import { useContext } from "react";

export const useAppCtx = () => {
  const context = useContext(AppCtx);

  if (context === undefined) {
    throw new Error(
      "useAppCtx must be used within the AppProvider",
    );
  }

  return context;
};
