import { NextRequest, NextResponse } from 'next/server'

// Consulta pública, sem chave — BrasilAPI espelha dados da Receita Federal.
export async function GET(req: NextRequest) {
  const cnpj = (req.nextUrl.searchParams.get('cnpj') || '').replace(/\D/g, '')
  if (cnpj.length !== 14) {
    return NextResponse.json({ error: 'CNPJ inválido — precisa ter 14 dígitos.' }, { status: 400 })
  }

  // BrasilAPI bloqueia (403) requisições sem User-Agent de navegador — o fetch padrão do
  // Node/Vercel não manda um, precisa forçar.
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    return NextResponse.json({ error: 'CNPJ não encontrado ou serviço indisponível.' }, { status: 404 })
  }
  const dados = await res.json()

  return NextResponse.json({
    razao_social: dados.razao_social as string | undefined,
    nome_fantasia: dados.nome_fantasia as string | undefined,
    endereco: [dados.logradouro, dados.numero, dados.complemento, dados.bairro].filter(Boolean).join(', '),
    municipio: dados.municipio as string | undefined,
    uf: dados.uf as string | undefined,
    cep: dados.cep as string | undefined,
    situacao_cadastral: dados.descricao_situacao_cadastral as string | undefined,
  })
}
