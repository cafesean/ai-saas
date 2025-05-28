import React, { useEffect, useRef } from "react";
import { EditorView } from "codemirror";

const SampleCodeInput = ({
  doc = "",
  parent,
  onChange,
}: {
  doc: string;
  parent: HTMLElement;
  onChange?: (value: string) => void;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  useEffect(() => {
    if (!editorRef.current) return;

    // 初始化 CodeMirror
    const editor = new EditorView({
      doc,
      extensions: [
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
      ],
      parent: editorRef.current,
    });

    editorViewRef.current = editor;

    return () => {
      editor.destroy();
      editorViewRef.current = null;
    };
  }, []);
  return (
    <div className="px-3 py-2 rounded-md border-input border" ref={editorRef} />
  );
};

export { SampleCodeInput };
