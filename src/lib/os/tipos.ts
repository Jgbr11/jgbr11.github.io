export type AppId =
  | 'sobre' | 'projetos' | 'projeto' | 'trajetoria' | 'certificados'
  | 'curriculo' | 'contato' | 'terminal' | 'neon-burnout';

export interface Rota { app: AppId; param?: string }
