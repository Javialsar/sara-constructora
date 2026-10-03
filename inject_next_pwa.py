import os

f = 'next.config.ts'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

replacement = """import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
"""

c = c.replace('import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n', replacement)
c = c.replace('export default nextConfig;', 'export default withPWA(nextConfig);')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
