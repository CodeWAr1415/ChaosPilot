import Header from "./components/header";
import { Toaster } from "react-hot-toast";

import Chat from "./components/chat";
import MapDisplay from "./components/map";
import Sidebar from "./components/sidebar";

import "leaflet/dist/leaflet.css";
import Todo from "./components/todo";
import Alarm from "./components/alarm";

export default function Manager() {
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
          background: "#18181b",
          color: "#d4d4d4",
          fontSize: "16px"
        }
      }}
    />
  </>;
}
