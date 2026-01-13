// render/persistence.ts

import { App, TFile } from "obsidian";

export async function updateHillPos(
  app: App,
  path: string,
  _desc: string,
  pos: number
) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof TFile)) return;

  const cache = app.metadataCache.getFileCache(file);
  if (cache?.frontmatter?.hillPos === pos) return;

  await app.fileManager.processFrontMatter(file, fm => {
    fm.hillPos = pos;
  });
}
