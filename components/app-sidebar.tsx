"use client";
import {
  use,
  ComponentProps,
  Suspense,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ChevronRight, File, Folder } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ContextMenuContainer } from "./ConextDemo";
import { getFiles, getDirectoryContents } from "@/app/actions";
import WebcontainerInstance from "@/system/webContainer";
// This is sample data.
const data = {
  tree: [
    [
      "app",
      [
        "api",
        ["hello", ["route.ts"]],
        "page.tsx",
        "layout.tsx",
        ["blog", ["page.tsx"]],
      ],
    ],
    [
      "components",
      ["ui", "button.tsx", "card.tsx"],
      "header.tsx",
      "footer.tsx",
    ],
    ["lib", ["util.ts"]],
    ["public", "favicon.ico", "vercel.svg"],
    ".eslintrc.json",
    ".gitignore",
    "next.config.js",
    "tailwind.config.js",
    "package.json",
    "README.md",
  ],
};

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  setFiles: React.Dispatch<React.SetStateAction<any[]>>;
  files: any[];
  setSelectedFile: React.Dispatch<
    React.SetStateAction<{ path: string; content: string } | null>
  >;
}

export function AppSidebar({
  setFiles,
  files,
  setSelectedFile,
  ...props
}: AppSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 初始加載文件列表
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      try {
        const data = await getFiles();
        setFiles(data);
      } catch (error) {
        console.error("Error loading files:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiles();
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup className="flex flex-col h-full">
          <SidebarGroupLabel className="whitespace-nowrap overflow-hidden text-ellipsis">
            Files
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1">
            <ContextMenuContainer>
              <SidebarMenu>
                <Suspense fallback={<div>Loading...</div>}>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    files.map((item, index) => (
                      <Tree
                        key={index}
                        item={item}
                        setSelectedFile={setSelectedFile}
                      />
                    ))
                  )}
                </Suspense>
              </SidebarMenu>
            </ContextMenuContainer>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

interface TreeProps {
  item: string | any[];
  path?: string;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<{ path: string; content: string } | null>
  >;
}

function Tree({ item, path = ".", setSelectedFile }: TreeProps) {
  const [name, ...items] = Array.isArray(item) ? item : [item];

  const fullPath = path === "." ? `/${name}` : `${path}/${name}`;
  const isDirectory = items.length > 0 && Array.isArray(items[0]);
  if (name === null) return null;

  const handleFileClick = async () => {
    try {
      if (!WebcontainerInstance) {
        console.error("WebContainer not initialized");
        return;
      }
      const content = await WebcontainerInstance.fs.readFile(
        fullPath.slice(1),
        "utf-8"
      );
      setSelectedFile({ path: fullPath, content });
    } catch (error) {
      console.error("Error loading file content:", error);
    }
  };

  if (!isDirectory) {
    return (
      <SidebarMenuButton
        isActive={false}
        className="data-[active=true]:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={handleFileClick}
      >
        <File />
        {name}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90 hover:bg-gray-100 dark:hover:bg-gray-800">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items[0].map((subItem: any, index: number) => (
              <Tree
                key={index}
                item={subItem}
                path={fullPath}
                setSelectedFile={setSelectedFile}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
