"use client";
import { useState } from "react";
import WebcontainerInstance from "@/system/webContainer";
import "@/system/startServer";
import "@xterm/xterm/css/xterm.css";
import dynamic from "next/dynamic";
const TerminalComponent = dynamic(() => import("@/components/Terminal"), {
  ssr: false,
});
async function writeIndexJS(content: string) {
  await WebcontainerInstance?.fs.writeFile("/index.js", content);
}
export default function Home() {
  const [code, setCode] = useState("");

  return (
    <>
      <iframe
        ref={(ref) => {
          WebcontainerInstance?.on(
            "server-ready",
            (port: number, url: string) => {
              if (ref) {
                ref.src = url;
              }
            }
          );
        }}
      ></iframe>
      <div>
        <button
          onClick={() =>
            WebcontainerInstance?.fs
              .readdir("/", {
                // withFileTypes: true,
              })
              .then((res) => {
                console.log(res);
                // setCode(res);
              })
          }
        >
          Write File
        </button>
      </div>
      <textarea
        className=""
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          writeIndexJS(e.target.value);
        }}
      />
      <TerminalComponent />
    </>
  );
}
