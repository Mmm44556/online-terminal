import WebcontainerInstance from "@/system/webContainer";

export async function getFiles() {
  const files = await WebcontainerInstance?.fs.readdir("/");

  return files;
}
