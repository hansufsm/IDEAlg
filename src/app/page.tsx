import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            ✦ IDEALG
          </Link>
          <Link
            href="/ide"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Abrir IDE
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 gradient-text">
          IDE Portugol
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Um interpretador visual e interativo para Portugol (pseudocódigo em português),
          compatível com VisuAlg. Escreva, execute e depure seus programas diretamente no navegador.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/ide"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 font-semibold shadow-lg shadow-purple-500/30"
          >
            Iniciar IDE →
          </Link>
          <Link
            href="https://australis.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors font-semibold"
          >
            Voltar para AUSTRALIS
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Recursos</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur hover:border-purple-500 transition-colors">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-xl font-semibold mb-2">Editor Avançado</h3>
            <p className="text-slate-400">
              Syntax highlighting, autocomplete e realce de linha para melhor experiência.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur hover:border-purple-500 transition-colors">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Execução em Tempo Real</h3>
            <p className="text-slate-400">
              Veja o resultado imediatamente com entrada interativa e console de saída.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur hover:border-purple-500 transition-colors">
            <div className="text-3xl mb-3">🐛</div>
            <h3 className="text-xl font-semibold mb-2">Debugger</h3>
            <p className="text-slate-400">
              Breakpoints e step-by-step debugging com inspeção de variáveis.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur hover:border-purple-500 transition-colors">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-xl font-semibold mb-2">Gerenciamento de Projetos</h3>
            <p className="text-slate-400">
              Salve seus programas localmente e recupere depois.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur hover:border-purple-500 transition-colors">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Compartilhamento</h3>
            <p className="text-slate-400">
              Compartilhe seus programas com um simples link.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur hover:border-purple-500 transition-colors">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-xl font-semibold mb-2">Responsivo</h3>
            <p className="text-slate-400">
              Use em desktop, tablet ou celular — a IDE se adapta.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          <p>
            IDEALG é um projeto de{" "}
            <a
              href="https://github.com/hansufsm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Hans
            </a>
            . Desenvolvido para a educação em Português.
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/hansufsm/idealg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Ver código no GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
