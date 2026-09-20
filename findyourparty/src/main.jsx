// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import EventProvider from "./context/EventContext.jsx";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <EventProvider>
        <App />
      </EventProvider>
    </QueryClientProvider>
  </React.StrictMode>
);