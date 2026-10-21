// apps/workbench/src/types.ts — mirrors contracts/workbench.ts and contracts/corpus.ts
export interface WorkRef {
  id: string; poetId: string; poetName: string; title?: string; collection?: string;
  kind: 'classical' | 'modern' | 'prose'; form?: string; deathYearCE?: number;
}
export interface Work extends WorkRef {
  stanzas: string[][]; beyts?: [string, string][]; structure?: { origin: string; confidence: number; form: string };
  meter?: string | null; radif?: string | null; qafiyeh?: string | null;
}
export interface Corpus { works: readonly Work[] }
export interface CorpusHandle { corpus(): Promise<Corpus>; addPrivate(files: File[]): Promise<{ added: number; flagged: number }> }
export interface WorkbenchCtx { corpus: CorpusHandle; t(key: string): string; openWork(id: string): void }
export interface TabDef {
  id: string; order: number; title: { fa: string; en: string };
  load(): Promise<{ mount(el: HTMLElement, ctx: WorkbenchCtx): () => void }>;
}
export type TabModule = { default: TabDef };
export function discoverTabs(modules: Record<string, TabModule>): TabDef[] {
  return Object.values(modules).map((m) => m.default).sort((a, b) => a.order - b.order);
}
