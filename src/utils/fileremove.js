import fs from "fs";
export function fileRemove(localfilePath) {
  fs.unlinkSync(localfilePath);
}
