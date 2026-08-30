import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error in application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.hash = '';
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-100">Litoral em Movimento</h1>
              <p className="text-slate-400 text-sm">
                Ocorreu uma pequena instabilidade no carregamento da página. Clique abaixo para reiniciar.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-800/80 text-xs font-mono text-amber-200/80 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Página Inicial
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
