export type PerfilSecao = 'aplicador' | 'tecnico'

export interface SecaoConfig {
  id: string           // chave dentro de respostas/analise_tecnica
  numero: string        // rótulo exibido (ex: "1", "17", "A")
  titulo: string
  perfil: PerfilSecao   // quem preenche
  destino: 'respostas' | 'analise_tecnica' | 'empreendimento'
}

export const SECOES: SecaoConfig[] = [
  { id: 'secao01', numero: '1',  titulo: 'Controle da aplicação',              perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao02', numero: '2',  titulo: 'Identificação do empreendimento',    perfil: 'aplicador', destino: 'empreendimento' },
  { id: 'secao03', numero: '3',  titulo: 'Composição social e perfil',         perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao04', numero: '4',  titulo: 'Histórico e identidade',             perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao05', numero: '5',  titulo: 'Governança e regularidade',          perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao06', numero: '6',  titulo: 'Gestão administrativa e financeira', perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao07', numero: '7',  titulo: 'Atividade econômica e produtos',     perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao08', numero: '8',  titulo: 'Infraestrutura e equipamentos',      perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao09', numero: '9',  titulo: 'Qualidade e rastreabilidade',        perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao10', numero: '10', titulo: 'Comercialização e mercados',         perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao11', numero: '11', titulo: 'Logística e intercooperação',        perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao12', numero: '12', titulo: 'Tecnologia e inserção digital',      perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao13', numero: '13', titulo: 'Sustentabilidade e agroecologia',    perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao14', numero: '14', titulo: 'Formação e assistência técnica',     perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao15', numero: '15', titulo: 'Renda e impacto socioeconômico',     perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao16', numero: '16', titulo: 'Parcerias e políticas públicas',     perfil: 'aplicador', destino: 'respostas' },
  { id: 'secao17', numero: '17', titulo: 'Análise de maturidade (técnico)',    perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'secao18', numero: '18', titulo: 'Plano de encaminhamentos',          perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'anexoA',  numero: 'A',  titulo: 'Anexo A — Evidências',              perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'anexoB',  numero: 'B',  titulo: 'Anexo B — Quadro-síntese',          perfil: 'tecnico',   destino: 'analise_tecnica' },
]

export function secaoAtual(id: string): SecaoConfig {
  return SECOES.find(s => s.id === id) ?? SECOES[0]
}
