import WebcontainerInstance from "@/system/webContainer";
import { files } from "./file";
async function startDevServer() {
  await WebcontainerInstance?.mount(files);
}
startDevServer();
