// @effect-diagnostics nodeBuiltinImport:off - resolves the home synchronously before any Effect runtime starts.
import * as Effect from "effect/Effect";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

import * as HostProcess from "./HostProcess.ts";

export interface DefaultT3HomeInput {
  readonly platform: NodeJS.Platform;
  readonly homeDirectory: string;
  readonly xdgDataHome: string | undefined;
  readonly joinPath: (first: string, ...segments: string[]) => string;
  readonly directoryExists: (path: string) => boolean;
}

export function defaultT3Home(input: DefaultT3HomeInput): string {
  const legacyHome = input.joinPath(input.homeDirectory, ".t3");
  if (input.platform !== "linux") {
    return legacyHome;
  }

  const xdgDataHome = input.xdgDataHome?.trim();
  const xdgRoot =
    xdgDataHome && xdgDataHome.length > 0
      ? xdgDataHome
      : input.joinPath(input.homeDirectory, ".local", "share");
  const xdgHome = input.joinPath(xdgRoot, "t3code");

  if (input.directoryExists(xdgHome)) {
    return xdgHome;
  }
  return input.directoryExists(legacyHome) ? legacyHome : xdgHome;
}

export function directoryExistsSync(path: string): boolean {
  try {
    return NodeFS.statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export const defaultT3HomeForHost = Effect.gen(function* () {
  return defaultT3Home({
    platform: yield* HostProcess.Platform,
    homeDirectory: yield* HostProcess.HomeDirectory,
    xdgDataHome: (yield* HostProcess.Environment).XDG_DATA_HOME,
    joinPath: NodePath.join,
    directoryExists: directoryExistsSync,
  });
});
