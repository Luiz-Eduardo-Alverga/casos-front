/** @type {import('next').NextConfig} */
const nextConfig = {
  // Imagem Docker usa `node server.js` (output tracing). Build local (`npm start`) permanece `next start`.
  ...(process.env.DOCKER === "1" ? { output: "standalone" } : {}),
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  serverExternalPackages: [
    "discord.js",
    "@discordjs/ws",
    "@discordjs/rest",
    "zlib-sync",
    "bufferutil",
    "utf-8-validate",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
  ],
  // Tela de consentimento do conector do Claude: nunca dentro de iframe (clickjacking).
  async headers() {
    return [
      {
        source: "/oauth/autorizar",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
