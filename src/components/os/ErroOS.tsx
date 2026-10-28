import { Component, type ReactNode } from 'react';

/** Se algo quebrar na ilha, oferece o modo rápido em vez de uma tela vazia. */
export class ErroOS extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false };

  static getDerivedStateFromError() {
    return { erro: true };
  }

  componentDidCatch(erro: unknown) {
    console.error('JGBR11 OS falhou:', erro);
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="os-carregando" role="alert">
          <p>O JGBR11 OS TRAVOU.</p>
          <p><a className="btn btn--escuro" href="/rapido/">ABRIR O MODO RÁPIDO</a></p>
        </div>
      );
    }
    return this.props.children;
  }
}
