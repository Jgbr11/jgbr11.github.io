export type AppId =
  | 'sobre' | 'projetos' | 'projeto' | 'trajetoria' | 'certificados'
  | 'curriculo' | 'contato' | 'terminal' | 'neon-burnout' | 'demo-countatic';

export interface Rota { app: AppId; param?: string }
