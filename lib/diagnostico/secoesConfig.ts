export type PerfilSecao = 'aplicador' | 'tecnico'

export interface SecaoConfig {
  id: string           // chave dentro de respostas/analise_tecnica
  numero: string        // rótulo exibido (ex: "1", "17", "A")
  titulo: string
  perfil: PerfilSecao   // quem preenche
  destino: 'respostas' | 'analise_tecnica' | 'empreendimento'
}

export const SECOES: SecaoConfig[] = [
  { id: 'secao01', numero: 'Parte A', titulo: 'Controle da aplicação',         perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao02', numero: 'Bloco 0', titulo: 'Identificação e territorialidade', perfil: 'aplicador', destino: 'empreendimento' },
  { id: 'parteB', numero: 'Parte B', titulo: 'Beneficiários (composição, renda, formação)', perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco1', numero: 'Bloco 1', titulo: 'Documentação e regularidade',    perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco2', numero: 'Bloco 2', titulo: 'Gestão e governança',            perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco3', numero: 'Bloco 3', titulo: 'Gestão de pessoas',              perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao06', numero: '6',  titulo: 'Gestão administrativa e financeira', perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao07', numero: '7',  titulo: 'Atividade econômica e produtos',     perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao08', numero: '8',  titulo: 'Infraestrutura e equipamentos',      perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao09', numero: '9',  titulo: 'Qualidade e rastreabilidade',        perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao10', numero: '10', titulo: 'Comercialização e mercados',         perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao11', numero: '11', titulo: 'Logística e intercooperação',        perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao12', numero: '12', titulo: 'Tecnologia e inserção digital',      perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao13', numero: '13', titulo: 'Sustentabilidade e agroecologia',    perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao16', numero: '16', titulo: 'Parcerias e políticas públicas',     perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao17', numero: '17', titulo: 'Análise de maturidade (técnico)',    perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'secao18', numero: '18', titulo: 'Plano de encaminhamentos',          perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'anexoA',  numero: 'A',  titulo: 'Anexo A — Evidências',              perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'anexoB',  numero: 'B',  titulo: 'Anexo B — Quadro-síntese',          perfil: 'tecnico',   destino: 'analise_tecnica' },
]

export function secaoAtual(id: string): SecaoConfig {
  return SECOES.find(s => s.id === id) ?? SECOES[0]
}
