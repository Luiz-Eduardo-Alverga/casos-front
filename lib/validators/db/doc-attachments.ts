const UUID_IN_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateStoragePathForDoc(
  path: string,
  docId: string,
): boolean {
  const prefix = `docs/${docId}/`;
  if (!path.startsWith(prefix)) return false;
  const rest = path.slice(prefix.length);
  if (!rest || rest.includes("/") || rest.includes("..")) return false;
  const uuidPart = rest.split(".")[0];
  if (!uuidPart || rest.split(".").length < 2) return false;
  return UUID_IN_PATH.test(uuidPart);
}
