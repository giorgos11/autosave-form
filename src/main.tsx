import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./app/styles/index.css";

const enableMocking = async () => {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;

  const { network } = await import("virtual:msw");
  const { userProfileHandlers } = await import("@/features/user-profile/mocks");

  network.configure({ handlers: userProfileHandlers });
  await network.enable();
};

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
