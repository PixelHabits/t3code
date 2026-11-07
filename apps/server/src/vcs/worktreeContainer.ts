import { isBareGitConfig } from "@t3tools/shared/git";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

/** Git deletes a worktree's admin folder, and this file in it, when the worktree is removed. */
export const CREATED_WORKTREE_MARKER = "t3code-created";

/**
 * A worktree container holds a bare repository in `.bare` and a `.git` file pointing at it.
 * Every checkout of the repository is a direct child folder.
 */
export const makeIsWorktreeContainer = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return Effect.fn("WorktreeContainer.isWorktreeContainer")(
    function* (folder: string) {
      const gitDir = path.join(folder, ".bare");
      const pointer = yield* fileSystem.readFileString(path.join(folder, ".git"));
      const target = /^gitdir: (.+?)\s*$/.exec(pointer)?.[1];
      if (target === undefined) return false;
      const [pointed, bare] = yield* Effect.all([
        fileSystem.realPath(path.resolve(folder, target)),
        fileSystem.realPath(gitDir),
      ]);
      return (
        pointed === bare &&
        isBareGitConfig(yield* fileSystem.readFileString(path.join(gitDir, "config")))
      );
    },
    Effect.orElseSucceed(() => false),
  );
});
