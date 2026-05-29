/** @type {import('next').NextConfig} */
const nextConfig = {
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
