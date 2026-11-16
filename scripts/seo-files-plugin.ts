import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export function seoFilesPlugin(): Plugin {
  let outDir = "dist";

  return {
    name: "seo-files",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      const siteUrl = resolveSiteUrl();
      if (!siteUrl) return html;

      return html
        .replace(
          /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
          `$1${siteUrl}/$2`,
        )
        .replace(
          /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
          `$1${siteUrl}/og.jpg$2`,
        )
        .replace(
          /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
          `$1${siteUrl}/og.jpg$2`,
        );
    },
    closeBundle() {
      const siteUrl = resolveSiteUrl();
      writeRobots(outDir, siteUrl ? `${siteUrl}/sitemap.xml` : null);

      if (!siteUrl) return;

      fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
        "utf8",
      );
    },
  };
}

function resolveSiteUrl(): string {
  const explicit = process.env.VITE_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}`;
  }

  return "";
}

function writeRobots(outDir: string, sitemapUrl: string | null) {
  const lines = ["User-agent: *", "Allow: /", ""];
  if (sitemapUrl) {
    lines.push(`Sitemap: ${sitemapUrl}`, "");
  }
  fs.writeFileSync(path.join(outDir, "robots.txt"), lines.join("\n"), "utf8");
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}
