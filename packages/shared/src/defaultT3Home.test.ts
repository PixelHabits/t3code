import { assert, describe, it } from "@effect/vitest";

import { defaultT3Home } from "./defaultT3Home.ts";

const joinPath = (first: string, ...segments: string[]) => [first, ...segments].join("/");

const resolve = (input: {
  readonly platform: NodeJS.Platform;
  readonly xdgDataHome?: string | undefined;
  readonly existing?: ReadonlyArray<string> | undefined;
}) => {
  const existing = new Set(input.existing ?? []);
  return defaultT3Home({
    platform: input.platform,
    homeDirectory: "/home/alice",
    xdgDataHome: input.xdgDataHome,
    joinPath,
    directoryExists: (path) => existing.has(path),
  });
};

describe("defaultT3Home", () => {
  it("uses XDG_DATA_HOME on Linux when set", () => {
    assert.equal(
      resolve({ platform: "linux", xdgDataHome: "/data" }),
      "/data/t3code",
    );
  });

  it("uses ~/.local/share/t3code on Linux without XDG_DATA_HOME", () => {
    assert.equal(resolve({ platform: "linux" }), "/home/alice/.local/share/t3code");
  });

  it("keeps legacy ~/.t3 when the XDG directory is absent", () => {
    assert.equal(
      resolve({ platform: "linux", existing: ["/home/alice/.t3"] }),
      "/home/alice/.t3",
    );
  });

  it("prefers XDG when both Linux defaults exist", () => {
    assert.equal(
      resolve({
        platform: "linux",
        existing: ["/home/alice/.local/share/t3code", "/home/alice/.t3"],
      }),
      "/home/alice/.local/share/t3code",
    );
  });

  it("keeps ~/.t3 on non-Linux platforms", () => {
    assert.equal(resolve({ platform: "darwin" }), "/home/alice/.t3");
  });
});
