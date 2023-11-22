"use client";

// adapted from https://innocentanyaele.medium.com/create-a-drag-and-drop-file-component-in-reactjs-nextjs-tailwind-6ae70ba06e4b

import { Dispatch, useRef, useState } from "react";

type DragAndDropParams = {
  files: any;
  setFiles: Dispatch<any>;
};

export default function DragAndDrop({ files, setFiles }: DragAndDropParams) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<any>(null);

  function handleChange(e: any) {
    e.preventDefault();
    console.log("File has been added");
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files);
      for (let i = 0; i < e.target.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.target.files[i]]);
      }
    }
  }

  function handleDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
      }
    }
  }

  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  return (
    <form
      className={`${
        dragActive ? "bg-blue-400" : "bg-blue-100"
      } p-2 w-full rounded-lg min-h-[10rem] text-center flex flex-col items-center justify-center`}
      onDragEnter={handleDragEnter}
      onSubmit={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      <input
        placeholder="fileInput"
        className="hidden"
        ref={inputRef}
        type="file"
        multiple={false}
        onChange={handleChange}
        accept=".txt"
      />
      <p>Drop a zoom chat here!</p>
    </form>
  );
}
