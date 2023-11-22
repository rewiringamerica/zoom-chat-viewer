"use client";

import { useEffect, useState } from "react";
import DragAndDrop from "./_components/DragAndDrop";
import ZoomChat from "./_components/ZoomChat";

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
    <main className="max-w-xs sm:max-w-sm md:max-w-md mx-auto ">
      {text ? (
        <ZoomChat text={text}></ZoomChat>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <DragAndDrop files={files} setFiles={setFiles}></DragAndDrop>
        </div>
      )}
    </main>
  );
}
