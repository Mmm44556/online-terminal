"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ThemeSwitch from "@/components/ThemeSwitch";
import { MonacoEditor } from "@/components/monaco-editor";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const TerminalComponent = dynamic(() => import("@/components/Terminal"), {
  ssr: false,
});

export default function Page() {
  const [files, setFiles] = useState<any[]>([]);

  return (
    <SidebarProvider>
      <AppSidebar setFiles={setFiles} files={files} />

      <SidebarInset>
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">ui</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>button.tsx</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center">
            <ThemeSwitch />
          </div>
        </header>

        <div className="h-[calc(100vh-4rem)]">
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              {/* <MonacoEditor /> */}
            </Panel>
            <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />
            <Panel minSize={40}>
              <TerminalComponent setFiles={setFiles} />
            </Panel>
          </PanelGroup>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
