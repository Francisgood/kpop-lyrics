import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dockerfile = readFileSync(
  new URL("../Dockerfile.staging", import.meta.url),
  "utf8",
);
const dockerignore = readFileSync(
  new URL("../Dockerfile.staging.dockerignore", import.meta.url),
  "utf8",
);
const lock = JSON.parse(
  readFileSync(
    new URL("../staging/package-lock.json", import.meta.url),
    "utf8",
  ),
);

describe("staging container boundary", () => {
  it("pins Node and installs the reviewed dependency lock", () => {
    expect(dockerfile.match(/FROM node:24\.21\.0-bookworm-slim/g)).toHaveLength(
      2,
    );
    expect(dockerfile).toContain("npm ci --ignore-scripts");
    expect(lock.packages["node_modules/openid-client"].version).toBe("6.8.8");
  });

  it("builds explicitly and starts without migration or seed commands", () => {
    expect(dockerfile).toContain("./node_modules/.bin/prisma generate");
    expect(dockerfile).toContain("./node_modules/.bin/next build");
    expect(dockerfile).toContain('CMD ["./node_modules/.bin/next", "start"]');
    expect(dockerfile).not.toMatch(/migrate|db seed|prisma\/seed/);
  });

  it("uses an allowlisted context that excludes private and operator files", () => {
    expect(dockerignore.startsWith("**\n")).toBe(true);
    expect(dockerignore).not.toMatch(/!\.env|!\.proof/);
    expect(dockerignore).not.toContain("!scripts/**");
    expect(dockerignore).toContain("!scripts/fetch-images.ts");
  });
});
