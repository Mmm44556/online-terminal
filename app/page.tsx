"use client";
import { useState } from "react";
import WebcontainerInstance from "@/system/webContainer";
import "@/system/startServer";
import "@xterm/xterm/css/xterm.css";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { writeFile } from "@/app/actions";

const TerminalComponent = dynamic(() => import("@/components/Terminal"), {
  ssr: false,
});

export default function Home() {
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const handleCodeChange = async (newCode: string) => {
    setCode(newCode);
    await writeFile("/index.js", newCode);
    queryClient.invalidateQueries({ queryKey: ["files"] });
  };

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
            WebcontainerInstance?.fs.readdir("/").then((res) => {
              console.log(res);
            })
          }
        >
          Write File
        </button>
      </div>
      <textarea
        className=""
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
      />
      <TerminalComponent />
    </>
  );
}
