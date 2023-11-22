"use client";

import { useEffect, useState } from "react";
import DragAndDrop from "./components/DragAndDrop";
import ZoomChat from "./components/ZoomChat";

export default function Home() {
  const [files, setFiles] = useState<any>([]);
  const [text, setText] = useState<string>();

  useEffect(() => {
    if (files.length) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(reader.result as string);
      };
      const blob: Blob = files[0] as Blob;
      reader.readAsText(blob, "utf-8");
      return () => {
        reader.abort();
      };
    }
  }, [files]);

  return (
    <main>
      {text ? (
        <ZoomChat text={text}></ZoomChat>
      ) : (
        <DragAndDrop files={files} setFiles={setFiles}></DragAndDrop>
      )}
    </main>
  );
}
