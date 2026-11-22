const { readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

// The adapter's virtual CommonJS loader expects POSIX file URLs. Defer loading
// its Node proxy until the request runs on Netlify's Linux edge runtime.
exports.onBuild = async ({ constants }) => {
  if (process.platform !== "win32") return;
  const manifestPath = path.join(constants.INTERNAL_EDGE_FUNCTIONS_SRC, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const name of new Set(manifest.functions.map(entry => entry.function))) {
    if (name !== "___netlify-edge-handler-node-middleware") continue;
    const file = path.join(path.dirname(manifestPath), name, name + ".js");
    const source = await readFile(file, "utf8");
    const eager = "import handler from './server/node-middleware.js';";
    const call = "(req, context) => handleMiddleware(req, context, handler)";
    if (!source.includes(eager) || !source.includes(call)) {
      throw new Error("Format handler Netlify berubah. Periksa kompatibilitas build Windows.");
    }
    await writeFile(file, source.replace(eager, "").replace(
      call,
      "async (req, context) => handleMiddleware(req, context, (await import('./server/node-middleware.js')).default)"
    ));
  }
};
