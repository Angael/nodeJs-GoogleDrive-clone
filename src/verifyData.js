export function verifyDir(dir) {
  //remove all slashes in beggining and multiples next to eachother
  let newDir = String(dir);
  newDir = newDir.replace(/(%|_)+/g, "");
  newDir = newDir.replace(/\/\/+/g, "/");
  //first character can't be slash
  if (newDir[0] === "/") {
    newDir = newDir.slice(1);
  }
  //last character can't be slash
  if (newDir[newDir.length - 1] === "/") {
    newDir = newDir.slice(0, -1); // "12345.0"
  }
  return newDir;
}
