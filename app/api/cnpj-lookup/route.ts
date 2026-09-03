import { NextRequest, NextResponse } from 'next/server'

// Consulta pública, sem chave — BrasilAPI espelha dados da Receita Federal.
export async function GET(req: NextRequest) {
  const cnpj = (req.nextUrl.searchParams.get('cnpj') || '').replace(/\D/g, '')
  if (cnpj.length !== 14) {
    return NextResponse.json({ error: 'CNPJ inválido — precisa ter 14 dígitos.' }, { status: 400 })
  }

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: { Accept: 'application/json' },
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
