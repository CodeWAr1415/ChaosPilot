import React from "react";

import { EditorState, Plugin } from "prosemirror-state";
import {
  ProseMirror,
  ProseMirrorDoc,
  reactKeys,
} from "@handlewithcare/react-prosemirror";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

import "./input.css";
import { Schema } from "prosemirror-model";

export default function InputBox() {
  const [editorState, setEditorState] = React.useState(
    EditorState.create({ 
      schema: new Schema({
        nodes: addListNodes(basicSchema.spec.nodes, "paragraph block*", "block"),
        marks: basicSchema.spec.marks,
      }), 
      plugins: [
        reactKeys()
      ]
    })
  );

  const [ waitSubmit, setWaitSubmit ] = React.useState(false);

  function onKeyDown(ev: React.KeyboardEvent) {
    if (!ev.shiftKey && ev.key === "Enter")
      setWaitSubmit(true);
  }

  React.useEffect(() => {
    if (!waitSubmit) return;

    let content = editorState.doc.textContent;

    if (content) {
      window.dispatchEvent(new CustomEvent("cp:send-chat", {
        detail: {
          content: content
        }
      }));
      return;
    }

    setWaitSubmit(false);

    setEditorState(EditorState.create({ 
      schema: new Schema({
        nodes: addListNodes(basicSchema.spec.nodes, "paragraph block*", "block"),
        marks: basicSchema.spec.marks,
      }), 
      plugins: [
        reactKeys()
      ]
    }));
  }, [waitSubmit, editorState]);

  return <div className="input-box sync-width" onKeyDown={onKeyDown}>
    <ProseMirror
      state={editorState}
      dispatchTransaction={(tr) => {
        setEditorState((s) => s.apply(tr));
      }}
    >
      <ProseMirrorDoc />
    </ProseMirror>
    <button className="send-button reactive">
      <span className="m-symbol">
        &#xe163;
      </span>
    </button>
  </div>
}
