export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="text-center space-y-2 max-w-sm">
        <p className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>Sem conexão</p>
        <p className="text-sm text-gray-600">
          Esta página ainda não tinha sido aberta neste aparelho. Diagnósticos já abertos
          continuam funcionando offline normalmente — os dados ficam salvos no aparelho e
          sincronizam sozinhos quando a internet voltar.
        </p>
      </div>
    </div>
  )
}
