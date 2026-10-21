// Single-file server entry for `bun build --compile` (L8).
const args = process.argv.slice(2);
function flag(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
const port = flag("--port") || process.env.PORT || "8787";
const data = flag("--data");
const offline = args.includes("--offline");
const cors = flag("--cors");

if (data) process.env.PQ_DATA_FILE = data;
if (offline) process.env.PQ_OFFLINE = "1";
if (cors) process.env.PQ_CORS = cors;
process.env.PORT = port;

await import("./serve.ts");
