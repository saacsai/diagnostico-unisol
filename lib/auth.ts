import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from './supabase'

// Confirma que quem está chamando é admin de verdade (não confia só na UI) —
// lê o token do header, resolve o usuário, checa perfil na tabela `usuarios`.
export async function exigirAdmin(req: NextRequest) {
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
