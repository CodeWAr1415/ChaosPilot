import React from "react";
import "./header.css";
import toast from "react-hot-toast";

export default function Header() {
  const [showButtons, setShowButtons] = React.useState(true);

  function showSidebar() {
    window.dispatchEvent(new CustomEvent("cp:show-sidebar"));
    setShowButtons(false);
  }

  React.useEffect(() => {
    function showButton() {
      setShowButtons(true);
    }

    window.addEventListener("cp:show-header-buttons", showButton);
    return () => {
      window.removeEventListener("cp:show-header-buttons", showButton);
    }
  })

  return <header>
    <div className="wrapper">
      <div className="buttons" data-visible={showButtons}>
        <button 
          className="sidebar-toggle reactive" 
          onClick={showSidebar} 
        >
          <span className="symbol m-symbol">
            &#xf7e4;
          </span>
        </button>
        <button 
          className="clear-chat reactive"
        >
          <span className="symbol m-symbol">
            &#xe5d5;
          </span>
        </button>
      </div>
      <div className="title">
        <span className="icon m-symbol">&#xe625;</span>
        <h1>ChaosPilot</h1>
      </div>
      <div className="avatar reactive" onClick={() => toast.error("那傢伙竟然敢無視燈！")}>
        <img src="/assets/avatar.png" />
      </div>
    </div>
  </header>;
}
