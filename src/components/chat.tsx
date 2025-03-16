import React from "react";
import Markdown from "react-markdown";

import "./chat.css";

import InputBox from "./chat/input";

import * as Gemini from "../api/gemini";
import toast from "react-hot-toast";

enum ChatSide {
  LEFT,
  RIGHT,
  BOT = LEFT,
  USER = RIGHT
}

interface CommandData {
  name: string;
  args: string[];
}

interface ChatData {
  id: number;
  loading: boolean;
  complete: boolean;
  side: ChatSide;
  content: string;
  lastContent: string;
  toolUsed: CommandData[];
}

let nameToTabIndex: Record<string, number> = {
  "鬧鐘": 1,
  "待辦": 2,
  "導航": 3
}
let nameToEmoji: Record<string, string> = {
  "鬧鐘": "⏰",
  "待辦": "✅",
  "導航": "🌍",
  "郵件": "📝"
}

function renderChatHistory(hist: ChatData) {
  if (hist.loading)
    return (
      <div
        key={hist.id}
        className="row sync-width"
        data-side={hist.side === ChatSide.LEFT ? "left" : "right"}
      >
        <div role="status">
          <svg aria-hidden="true" className="w-8 h-8 text-neutral-400 animate-spin dark:text-gray-600 fill-neutral-100" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  function navigate(t: CommandData) {
    if (t.name === "郵件") {
      window.open(`mailto:${t.args[0]}?subject=${window.encodeURI(t.args[1])
        }&body=${window.encodeURI(t.args[2])
        }`);
      return;
    }

    let index = nameToTabIndex[t.name];

    window.dispatchEvent(new CustomEvent("cp:switch-tab", {
      detail: {
        index
      }
    }));
  }

  function copy() {
    toast.promise(window.navigator.clipboard.writeText(hist.content), {
      loading: "Copying...",
      success: "Copied!",
      error: "Could not copy..."
    });
  }

  function sayThanks() {
    if (!document.querySelector<HTMLInputElement>(`#good-${hist.id}`)!.checked)
      toast.success("謝謝 :)");
    else
      toast.error("你好意思收回讚 :(")
  }

  return <div
    key={hist.id}
    className="row sync-width"
    data-side={hist.side === ChatSide.LEFT ? "left" : "right"}
  >
    <div className="chat-box">
      <div className="chat-content">
        <Markdown>
          {hist.content}
        </Markdown>
      </div>
      <div className="chat-content-extra">
        <ul>
          {hist.toolUsed.map((t, i) => <li key={i}>
            {nameToEmoji[t.name]}
            已設定&nbsp;
            <button className="link" onClick={() => navigate(t)}>
              {t.name}：{
                t.name === "導航"
                  ? `${t.args[0]} → ${t.args[1]}`
                  : t.name === "郵件"
                    ? t.args[1]
                    : t.args[0]
              }
            </button>
          </li>)}
        </ul>
      </div>
      {hist.side === ChatSide.BOT && hist.complete && (
        <div className="chat-feedbacks">
          <button className="reactive" onClick={copy}>
            <span className="m-symbol">
              &#xe14d;
            </span>
          </button>
          <input type="checkbox" className="feedback-checkbox" id={`good-${hist.id}`} />
          <label htmlFor={`good-${hist.id}`} className="reactive" onClick={sayThanks}>
            <span className="dynamic-icon">
              &#xe8dc;
            </span>
          </label>
          <input type="checkbox" className="feedback-checkbox" id={`bad-${hist.id}`} />
          <label htmlFor={`bad-${hist.id}`} className="reactive">
            <a href={`https://google.com/search?q=${window.encodeURI(hist.lastContent)}`} target="_blank" rel="noreferer noopener">
              <span className="dynamic-icon">
                &#xe8db;
              </span>
            </a>
          </label>
        </div>
      )}
    </div>
  </div>;
}

let autoId = 0;

export default function Chat() {
  const [blockInput, setBlockInput] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ChatData[]>([]);

  function addChatHistory(side: ChatSide, content: string, lastContent = "", loading = false, complete = true) {
    setChatHistory(h => [...h, {
      id: autoId++,
      side,
      content,
      lastContent,
      loading,
      complete,
      toolUsed: []
    }]);
  }

  function updateLastChatHistory(callback: (hist: ChatData) => ChatData) {
    setChatHistory(h => [...h.slice(0, -1), callback(h[h.length - 1])]);
  }

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const historyRef = React.useRef<HTMLDivElement>(null);
  const welcomeRef = React.useRef<HTMLDivElement>(null);

  function hideWelcome() {
    if (!wrapperRef.current || !welcomeRef.current) return;

    const wrapper = wrapperRef.current;
    const welcome = welcomeRef.current;

    window.requestAnimationFrame(() => {
      wrapper.classList.remove("float-center");
      welcome.style.display = "none";
    });
  }

  function showWelcome() {
    if (!wrapperRef.current || !welcomeRef.current) return;

    const wrapper = wrapperRef.current;
    const welcome = welcomeRef.current;

    window.requestAnimationFrame(() => {
      wrapper.classList.add("float-center");
      welcome.style.display = "";
    });
  }

  React.useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }

    async function onChatSent(ev: CustomEventInit) {
      let apiKey = window.localStorage.getItem("gemini_key");
      if (!apiKey) return;

      let text: string = ev.detail.content;

      hideWelcome();
      addChatHistory(ChatSide.USER, text.split(/\n/g).map(line => `${line}  `).join("\n"));
      setBlockInput(true);

      addChatHistory(ChatSide.BOT, "", text, true, false);

      let response: string = await Gemini.getResponse(
        chatHistory,
        text
      );

      let commands: CommandData[] = [];

      let commandRegex = /&&&([^&]+)&&&/g, commandMatch: string[] | null;
      while (commandMatch = commandRegex.exec(response)) {
        let args: string[] = [];

        let argsRegex = /\[([^\]]+)\]/g, argsMatch: string[] | null;
        while (argsMatch = argsRegex.exec(commandMatch[0])) {
          args.push(argsMatch[1]);
        }

        commands.push({
          name: args[0],
          args: args.slice(1)
        });
      }

      let navigationUsed = false;

      for (let com of commands) {
        switch (com.name) {
          case "鬧鐘": {
            window.dispatchEvent(new CustomEvent("cp:add-alarm", {
              detail: {
                time: com.args[0]
              }
            }));


            break;
          }
          case "待辦": {
            window.dispatchEvent(new CustomEvent("cp:add-todo", {
              detail: {
                name: com.args[0]
              }
            }));

            break;
          }
          case "導航": {
            if (navigationUsed)
              break;
            navigationUsed = true;

            window.dispatchEvent(new CustomEvent("cp:update-map", {
              detail: {
                startAddress: com.args[0],
                endAddress: com.args[1]
              }
            }));

            break;
          }
        }
      }

      response = response.replace(commandRegex, ""); // "__$1__"

      let prefix = "ChaosPilot:";
      if (response.startsWith(prefix))
        response = response.slice(prefix.length, response.length);
      response = response.trim();

      let currentLength = 0;

      while (true) {
        updateLastChatHistory((hist => {
          hist.loading = false;
          hist.content = response.slice(0, currentLength);

          return hist;
        }));

        if (currentLength >= response.length) {
          updateLastChatHistory((hist => {
            hist.complete = true;
            return hist;
          }));
          break;
        }

        currentLength += 3 + Math.random() * 7;

        await new Promise(r => setTimeout(r, 20 + Math.random() * 180));
      }
      setBlockInput(false);

      updateLastChatHistory((hist => {
        hist.toolUsed = commands;
        return hist;
      }));
    }

    window.addEventListener("cp:send-chat", onChatSent);
    return () => {
      window.removeEventListener("cp:send-chat", onChatSent);
    }
  }, [chatHistory]);

  React.useEffect(() => {
    function resetChat() {
      if (blockInput) return;
      setChatHistory([]);
      setBlockInput(false);
      showWelcome();
    }

    window.addEventListener("cp:reset-chat", resetChat);
    return () => {
      window.removeEventListener("cp:reset-chat", resetChat);
    };
  }, [blockInput]);

  return <div className="chat">
    <div className="wrapper float-center" ref={wrapperRef}>
      {!!chatHistory.length && (
        <div className="chat-history scrollbar" ref={historyRef}>
          {chatHistory.map(renderChatHistory)}
        </div>
      )}
      <div className="welcome" ref={welcomeRef}>
        我可以為你做什麼？
      </div>
      <InputBox blockInput={blockInput} />
    </div>
  </div>;
}
