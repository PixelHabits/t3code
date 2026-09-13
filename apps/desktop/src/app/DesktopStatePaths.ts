import { defaultT3Home } from "@t3tools/shared/defaultT3Home";
import * as Option from "effect/Option";

export type JoinPath = (first: string, ...segments: string[]) => string;

function normalizeConfiguredBaseDir(t3Home: Option.Option<string>): Option.Option<string> {
  if (Option.isNone(t3Home)) {
    return Option.none();
  }
  const trimmed = t3Home.value.trim();
  return trimmed.length > 0 ? Option.some(trimmed) : Option.none();
}

export function resolveDesktopBaseDir(input: {
  readonly homeDirectory: string;
  readonly joinPath: JoinPath;
  readonly platform: NodeJS.Platform;
  readonly t3Home: Option.Option<string>;
  readonly xdgDataHome: Option.Option<string>;
  readonly directoryExists: (path: string) => boolean;
}): string {
  return Option.getOrElse(normalizeConfiguredBaseDir(input.t3Home), () =>
    defaultT3Home({
      platform: input.platform,
      homeDirectory: input.homeDirectory,
      xdgDataHome: Option.getOrUndefined(input.xdgDataHome),
      joinPath: input.joinPath,
      directoryExists: input.directoryExists,
    }),
  );
}

export function resolveDesktopStateDir(input: {
  readonly baseDir: string;
  readonly isDevelopment: boolean;
  readonly joinPath: JoinPath;
  readonly t3Home: Option.Option<string>;
}): string {
  const useDevSubdir =
    input.isDevelopment && Option.isNone(normalizeConfiguredBaseDir(input.t3Home));
  return input.joinPath(input.baseDir, useDevSubdir ? "dev" : "userdata");
}
