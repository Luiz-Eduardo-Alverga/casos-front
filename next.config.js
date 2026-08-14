/** @type {import('next').NextConfig} */
const nextConfig = {
  // Imagem Docker usa `node server.js` (output tracing). Build local (`npm start`) permanece `next start`.
  ...(process.env.DOCKER === "1" ? { output: "standalone" } : {}),
  serverExternalPackages: [
    "discord.js",
    "@discordjs/ws",
    "@discordjs/rest",
    "zlib-sync",
    "bufferutil",
    "utf-8-validate",
  ],
};

module.exports = nextConfig;
