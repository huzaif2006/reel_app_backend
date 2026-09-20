import fs from "fs";
export function fileRemove(localfilePath) {

  if(fs.existsSync(localfilePath))
  fs.unlinkSync(localfilePath);
}
