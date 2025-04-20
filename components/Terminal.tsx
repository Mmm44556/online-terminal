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

interface ShellTab {
  id: string;
  process: WebContainerProcess | undefined;
  terminal: Terminal;
  writer: WritableStreamDefaultWriter<string>;
  fitAddon: FitAddon;
}

export default function TerminalComponent() {
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
            if (data.includes("\x1b[2J\x1b[H")) {
              newTerminal.clear();
            } else {
              newTerminal.write(data);
            }
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
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center px-3 py-1 text-sm rounded-t cursor-pointer ${
                activeTabId === tab.id
                  ? "bg-gray-200 text-gray-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-150"
              }`}
              onClick={() => switchTab(tab.id)}
            >
              <span>Shell</span>
              <button
                className="ml-2 text-gray-500 hover:text-gray-700"
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
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            + New Shell
          </button>
        </div>
      </div>

      {/* 拖拉控制元素 */}
      <div
        ref={resizerRef}
        onMouseDown={handleMouseDown}
        className="w-full h-1.5 cursor-row-resize flex justify-center items-center group"
      >
        <div className="w-full h-1 group-hover:bg-gray-300" />
      </div>

      {/* 終端實際容器 */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
