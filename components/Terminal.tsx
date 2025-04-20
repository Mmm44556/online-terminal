"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import WebcontainerInstance from "@/system/webContainer";
import { WebContainerProcess } from "@webcontainer/api";
import "@/system/startServer";
import "@xterm/xterm/css/xterm.css";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getFiles } from "@/app/actions";
interface ShellTab {
  id: string;
  process: WebContainerProcess | undefined;
  terminal: Terminal;
  writer: WritableStreamDefaultWriter<string>;
  fitAddon: FitAddon;
}

interface TerminalComponentProps {
  setFiles: React.Dispatch<React.SetStateAction<any[]>>;
}
export default function TerminalComponent({
  setFiles,
}: TerminalComponentProps) {
  const queryClient = useQueryClient();
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [tabs, setTabs] = useState<ShellTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const createNewShell = async () => {
    if (!terminalRef.current) return;

    const newTabId = `shell-${Date.now()}`;

    // 創建新的終端實例
    const newTerminal = new Terminal({
      convertEol: true,
      fontSize: 14,
      rightClickSelectsWord: true,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    setFitAddon(fitAddon);
    const clipboardAddon = new ClipboardAddon();
    newTerminal.loadAddon(fitAddon);
    newTerminal.loadAddon(clipboardAddon);
    newTerminal.loadAddon(new WebLinksAddon());

    const newProcess = await WebcontainerInstance?.spawn("bash", {
      terminal: {
        cols: newTerminal.cols,
        rows: newTerminal.rows,
      },
    });

    // 監聽文件系統變化
    WebcontainerInstance?.fs.watch(".", { recursive: true }, () => {
      getFiles().then((newFiles) => {
        setFiles(newFiles);
      });
    });
    if (newProcess) {
      // 獲取輸入流的 writer
      const writer = newProcess.input.getWriter();

      // 創建新的 tab
      const newTab: ShellTab = {
        id: newTabId,
        process: newProcess,
        terminal: newTerminal,
        writer,
        fitAddon,
      };

      // 設置新的 shell 的輸入輸出
      newProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            newTerminal.write(data);
          },
        })
      );

      // 設置終端輸入事件
      newTerminal.onData((data) => {
        writer?.write(data);
      });

      // 隱藏其他所有終端
      tabs.forEach((tab) => {
        const element = tab.terminal.element;
        if (element) {
          element.style.display = "none";
        }
      });

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTabId);

      // 打開新的終端
      newTerminal.open(terminalRef.current);
      fitAddon.fit();
    }
  };

  const showTerminal = (tab: ShellTab) => {
    if (!terminalRef.current) return;

    // 隱藏其他所有終端
    tabs.forEach((t) => {
      const element = t.terminal.element;
      if (element) {
        element.style.display = t.id === tab.id ? "block" : "none";
      }
    });

    // 如果終端還沒有打開，則打開它
    if (!tab.terminal.element) {
      tab.terminal.open(terminalRef.current);
    }

    // 調整終端大小
    tab.fitAddon?.fit();
  };

  const switchTab = async (tabId: string) => {
    const newTab = tabs.find((t) => t.id === tabId);
    if (newTab) {
      setActiveTabId(tabId);
      showTerminal(newTab);
    }
  };

  const closeShell = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.process) {
      await tab.process.kill();
      tab.writer?.close();
      tab.terminal.dispose();
    }

    setTabs((prev) => prev.filter((t) => t.id !== tabId));

    // 如果關閉的是當前活動的 tab，切換到最後一個 tab
    if (tabId === activeTabId) {
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      if (remainingTabs.length > 0) {
        const lastTab = remainingTabs[remainingTabs.length - 1];
        setActiveTabId(lastTab.id);
        showTerminal(lastTab);
      }
    }
  };

  useEffect(() => {
    const initializeShell = async () => {
      if (WebcontainerInstance && tabs.length === 0) {
        await createNewShell();
      }
    };
    initializeShell();
  }, [WebcontainerInstance]);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Shift + `
      if (e.ctrlKey && e.shiftKey && e.key === "`") {
        e.preventDefault();
        createNewShell();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  // 處理拖拉調整大小的邏輯
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(100, Math.min(500, startHeight - deltaY));
      setTerminalHeight(newHeight);

      if (fitAddon) {
        fitAddon.fit();
        if (terminalRef.current) {
          terminalRef.current.style.height = `${newHeight}px`;
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="terminal-container absolute bottom-0 left-0 right-0 flex flex-col w-full border overflow-hidden"
      style={{ height: `${terminalHeight}px` }}
    >
      {/* 控制欄 */}
      <div
        className="flex items-center justify-between px-2 py-1 border-b peer cursor-row-resize"
        ref={resizerRef}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-1 overflow-x-auto [&_*]:transition-colors [&_*]:duration-150 [&_*]:ease-in-out">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              data-active={activeTabId === tab.id}
              className={cn(
                "flex items-center px-3 py-1 text-sm rounded-t cursor-pointer group",
                "data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900",
                "data-[active=false]:bg-gray-100 data-[active=false]:text-gray-600 data-[active=false]:hover:bg-gray-150"
              )}
              onClick={() => switchTab(tab.id)}
            >
              <span>Shell</span>
              <button
                className="ml-2 text-gray-500 hover:text-gray-700 group-hover:cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  closeShell(tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={createNewShell}
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded cursor-pointer"
          >
            + New Shell
          </button>
        </div>
      </div>

      <div className="w-full h-1.5   peer-hover:bg-gray-300">
        <div className="w-full h-1 " />
      </div>

      {/* 終端實際容器 */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
