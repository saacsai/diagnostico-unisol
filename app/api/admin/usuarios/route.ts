import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Confirma que quem está chamando é admin de verdade (não confia só na UI) —
// lê o token do header, resolve o usuário, checa perfil na tabela `usuarios`.
async function exigirAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null

  const sbAdmin = getSupabaseAdmin()
  const { data: userData, error } = await sbAdmin.auth.getUser(token)
  if (error || !userData.user) return null

  const { data: perfilRow } = await sbAdmin.from('usuarios').select('perfil').eq('id', userData.user.id).single()
  if (perfilRow?.perfil !== 'admin') return null

  return userData.user
}

export async function POST(req: NextRequest) {
  const admin = await exigirAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })

  const body = await req.json()
  const { nome, email, senha, perfil, instituicao, unisol_estadual_id } = body

  if (!nome || !email || !senha || !perfil) {
    return NextResponse.json({ error: 'nome, email, senha e perfil são obrigatórios.' }, { status: 400 })
  }

  const sbAdmin = getSupabaseAdmin()
  const { data: novoUser, error: erroAuth } = await sbAdmin.auth.admin.createUser({
    email, password: senha, email_confirm: true,
  })
  if (erroAuth || !novoUser.user) {
    return NextResponse.json({ error: erroAuth?.message || 'Erro ao criar usuário.' }, { status: 400 })
  }

  const { error: erroPerfil } = await sbAdmin.from('usuarios').insert({
    id: novoUser.user.id, nome, email, perfil,
    instituicao: instituicao || null,
    unisol_estadual_id: unisol_estadual_id || null,
  })
  if (erroPerfil) {
    await sbAdmin.auth.admin.deleteUser(novoUser.user.id)
    return NextResponse.json({ error: erroPerfil.message }, { status: 400 })
  }

  return NextResponse.json({ id: novoUser.user.id })
}
