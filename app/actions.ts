import WebcontainerInstance from "@/system/webContainer";

interface FileType {
  name: string;
  isDirectory: () => boolean;
}

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

async function readDirectory(path: string): Promise<FileNode[]> {
  const entries = (await WebcontainerInstance?.fs.readdir(path, {
    withFileTypes: true,
  })) as FileType[];
  if (!entries) return [];

  const nodes: FileNode[] = [];
  for (const entry of entries) {
    const node: FileNode = {
      name: entry.name,
      path: path === "." ? `/${entry.name}` : `${path}/${entry.name}`,
      isDirectory: entry.isDirectory(),
    };

    if (entry.isDirectory()) {
      // 遞迴讀取子目錄
      const children = await readDirectory(node.path);
      node.children = children;
    }

    nodes.push(node);
  }

  return nodes;
}

// 獲取根目錄的內容
export async function getFiles() {
  const rootPath = ".";
  const rootEntries = await readDirectory(rootPath);

  // 將 FileNode 轉換為樹狀結構
  function convertToTree(nodes: FileNode[]): any[] {
    return nodes.map((node) => {
      if (node.isDirectory) {
        return [node.name, convertToTree(node.children || [])];
      } else {
        return [node.name];
      }
    });
  }

  return convertToTree(rootEntries);
}

// 獲取指定目錄的內容
export async function getDirectoryContents(path: string) {
  const entries = await readDirectory(path);
  // 將 FileNode 轉換為樹狀結構
  function convertToTree(nodes: FileNode[]): any[] {
    return nodes.map((node) => {
      if (node.isDirectory) {
        return [node.name]; // 目錄初始為空，等待用戶展開時再讀取
      } else {
        return [node.name];
      }
    });
  }

  return convertToTree(entries);
}

export async function writeFile(path: string, content: string) {
  await WebcontainerInstance?.fs.writeFile(path, content);
}

export async function deleteFile(path: string) {
  await WebcontainerInstance?.fs.rm(path, { recursive: true });
}

export async function createDirectory(path: string) {
  await WebcontainerInstance?.fs.mkdir(path, { recursive: true });
}
