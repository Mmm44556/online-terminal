"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import debounce from "@/lib/debounce";

const getLanguageFromPath = (path: string): string => {
  const extension = path.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "py":
      return "python";
    case "java":
      return "java";
    case "c":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "rb":
      return "ruby";
    case "php":
      return "php";
    case "sh":
      return "shell";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
};

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  path?: string;
  className?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({
  value = "",
  onChange,
  path = "",
  className,
  options = {},
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const language = getLanguageFromPath(path);

  useEffect(() => {
    const editor = editorRef.current;
    const container = containerRef.current;
    if (!editor || !container) return;

    const resetEditorLayout = () => {
      editor.layout({ width: 0, height: 0 });
      window.requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        editor.layout({ width: rect.width, height: rect.height });
      });
    };

    const debounced = debounce(resetEditorLayout, 300);
    window.addEventListener("resize", debounced);

    const resizeObserver = new ResizeObserver(debounced);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("resize", debounced);
      resizeObserver.disconnect();
    };
  }, []);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
    // Force initial layout
    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        editor.layout({ width: rect.width, height: rect.height });
      }
    }, 0);
  };

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full flex flex-col overflow-hidden", className)}
    >
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={value}
          theme={theme === "dark" ? "vs-dark" : "vs-light"}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            padding: { top: 10, bottom: 10 },
            automaticLayout: true,
            ...options,
          }}
          onChange={(value) => onChange?.(value || "")}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
