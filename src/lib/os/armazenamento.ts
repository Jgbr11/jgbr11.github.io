export function lerFlag(chave: string): boolean {
  try { return localStorage.getItem(chave) === '1'; } catch { return false; }
}
export function gravarFlag(chave: string): void {
  try { localStorage.setItem(chave, '1'); } catch { /* sem storage: segue sem lembrar */ }
}
