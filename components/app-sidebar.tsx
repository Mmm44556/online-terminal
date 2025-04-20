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
import { ContextMenuContainer } from "./ConextDemo";
import { getFiles, getDirectoryContents } from "@/app/actions";
// This is sample data.
const data = {
  changes: [
    {
      file: "README.md",
      state: "M",
    },
    {
      file: "api/hello/route.ts",
      state: "U",
    },
    {
      file: "app/layout.tsx",
      state: "M",
    },
  ],
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
}
export function AppSidebar({ setFiles, files, ...props }: AppSidebarProps) {
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
        <SidebarGroup className="h-full relative">
          <ContextMenuContainer>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent className="h-full">
              <SidebarMenu>
                <Suspense fallback={<div>Loading...</div>}>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    files.map((item, index) => <Tree key={index} item={item} />)
                  )}
                </Suspense>
              </SidebarMenu>
            </SidebarGroupContent>
          </ContextMenuContainer>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

interface TreeProps {
  item: string | any[];
  path?: string;
}

function Tree({ item, path = "." }: TreeProps) {
  const [name, ...items] = Array.isArray(item) ? item : [item];

  const fullPath = path === "." ? `/${name}` : `${path}/${name}`;
  const isDirectory = items.length > 0 && Array.isArray(items[0]);
  if (name === null) return null;

  if (!isDirectory) {
    return (
      <SidebarMenuButton
        isActive={false}
        className="data-[active=true]:bg-transparent"
      >
        <File />
        {name}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
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
              <Tree key={index} item={subItem} path={fullPath} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
