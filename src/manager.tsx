import Header from "./components/header";
import toast, { Toaster } from "react-hot-toast";

import Chat from "./components/chat";
import MapDisplay from "./components/map";
import Sidebar from "./components/sidebar";

import "leaflet/dist/leaflet.css";
import Todo from "./components/todo";
import Alarm from "./components/alarm";
import React from "react";

export default function Manager() {
  React.useEffect(() => {
    let apiKey = window.localStorage.getItem("gemini_key");
    if (!apiKey && !document.querySelector(".api-key-toast")) {
      toast((t) => <div className="api-key-toast">
        <div>
          Gemini API Key:
          <input type="password" className="api-key-input" onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              window.localStorage.setItem(
                "gemini_key",
                (ev.target as HTMLInputElement).value
              );
              toast.dismiss(t.id);
              toast.success("Added Gemini API Key!");
            }
          }}></input>
        </div>
        <button onClick={() => {
          window.localStorage.setItem(
            "gemini_key",
            document.querySelector<HTMLInputElement>(".api-key-toast .api-key-input")!.value
          );
          toast.dismiss(t.id);
          toast.success("Added Gemini API Key!");
        }}>
          <span className="m-symbol">
            &#xe5ca;
          </span>
        </button>
        <button onClick={() => toast.dismiss(t.id)}>
          <span className="m-symbol">
            &#xe5cd;
          </span>
        </button>
      </div>, { duration: Infinity });
    }
  }, []);

  return <>
    <Sidebar />
    <main>
      <Header />
      <div className="tabs">
        <div data-tab="chat">
          <Chat />
        </div>
        <div data-tab="clock">
          <Alarm />
        </div>
        <div data-tab="task">
          <Todo />
        </div>
        <div data-tab="map">
          <MapDisplay />
        </div>
      </div>
    </main>
    <Toaster
      position="bottom-right"
      gutter={8}
      containerStyle={{ inset: "36px" }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#27272a",
          boxShadow: "0px 2px 8px 2px #00000055",
          color: "#d4d4d4",
          fontSize: "16px"
        }
      }}
    />
  </>;
}
