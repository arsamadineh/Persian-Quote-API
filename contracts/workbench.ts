// contracts/workbench.ts (FROZEN) — tabs are auto-discovered; lanes add a folder, never edit shared files
import type { Corpus } from './corpus';
export interface CorpusHandle { corpus(): Promise<Corpus>; addPrivate(files: File[]): Promise<{ added: number; flagged: number }>; }
export interface WorkbenchCtx { corpus: CorpusHandle; t(key: string): string; openWork(id: string): void; }
export interface TabDef {
  id: string; order: number; title: { fa: string; en: string };
  load(): Promise<{ mount(el: HTMLElement, ctx: WorkbenchCtx): () => void }>;   // returns unmount
}
// each tab folder: apps/workbench/src/tabs/<id>/tab.ts  → export default <TabDef>
