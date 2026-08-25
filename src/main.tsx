import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Host from "./Host";
import Viewer from "./Viewer";
import { AppProvider } from "./ctx/AppCtx";

const router = createBrowserRouter([
  {
    path: "/host",
    element: <Host />
  },
  {
    path: "/viewer",
    element: <Viewer />
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
);

