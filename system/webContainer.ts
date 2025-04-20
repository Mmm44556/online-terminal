import { WebContainer } from "@webcontainer/api";

// Call only once
const WebcontainerInstance =
  typeof window !== "undefined"
    ? await WebContainer.boot({
        workdirName: "Postmaner",
      })
    : null;

export default WebcontainerInstance;
