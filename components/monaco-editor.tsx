"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { cn } from "@/lib/utils";

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: "vs-dark" | "vs-light";
  className?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({
  value = "",
  onChange,
  language = "javascript",
  theme = "vs-dark",
  className,
  options = {},
}: MonacoEditorProps) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={value}
        theme={theme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          ...options,
        }}
        onChange={(value) => onChange?.(value || "")}
      />
    </div>
  );
}
