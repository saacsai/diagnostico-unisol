export type PerfilSecao = 'aplicador' | 'tecnico'

export interface SecaoConfig {
  id: string           // chave dentro de respostas/analise_tecnica
  numero: string        // rótulo exibido (ex: "1", "17", "A")
  titulo: string
  perfil: PerfilSecao   // quem preenche
  destino: 'respostas' | 'analise_tecnica' | 'empreendimento'
}

export const SECOES: SecaoConfig[] = [
  { id: 'parteA',  numero: 'A',  titulo: 'Controle da aplicação',                       perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco0',  numero: '0',  titulo: 'Identificação e territorialidade',             perfil: 'aplicador', destino: 'empreendimento' },
  { id: 'parteB',  numero: 'B',  titulo: 'Beneficiários (composição, renda, formação)',  perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco1',  numero: '1',  titulo: 'Documentação e regularidade',                  perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco2',  numero: '2',  titulo: 'Gestão e governança',                          perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco3',  numero: '3',  titulo: 'Gestão de pessoas',                            perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco4',  numero: '4',  titulo: 'Gestão financeira',                            perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco5',  numero: '5',  titulo: 'Gestão comercial',                             perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco6',  numero: '6',  titulo: 'Gestão dos processos produtivos',              perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco7',  numero: '7',  titulo: 'Gestão socioambiental',                        perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco8',  numero: '8',  titulo: 'Demandas e potencialidades',                   perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco9',  numero: '9',  titulo: 'Adaptação ao meio e relações institucionais',  perfil: 'aplicador', destino: 'respostas' },
  { id: 'bloco10', numero: '10', titulo: 'Módulos complementares por segmento',           perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'bloco11', numero: '11', titulo: 'Régua de maturidade (técnico)',                 perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'bloco12', numero: '12', titulo: 'Devolutiva e encaminhamentos',                  perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'anexoA',  numero: 'A',        titulo: 'Anexo A — Evidências',                          perfil: 'tecnico',   destino: 'analise_tecnica' },
  { id: 'anexoB',  numero: 'B',        titulo: 'Anexo B — Quadro-síntese',                      perfil: 'tecnico',   destino: 'analise_tecnica' },
]

export function secaoAtual(id: string): SecaoConfig {
  return SECOES.find(s => s.id === id) ?? SECOES[0]
}
