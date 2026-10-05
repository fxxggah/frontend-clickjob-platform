"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import API_URL, { getAuthHeaders } from "@/lib/api"
import { 
  User, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  ShieldCheck, 
  Sparkles, 
  Phone, // ADICIONADO
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// ADICIONADO phone e aboutMe
interface UserData {
  id: number
  name: string
  email: string
  phone?: string
  aboutMe?: string
  createdAt: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
          headers: getAuthHeaders(),
        })
        if (!res.ok) throw new Error("Usuário não encontrado")
        const data = await res.json()
        setUser(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Carregando Perfil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-[950] text-slate-900 mb-2">Ops!</h2>
          <p className="text-slate-500 font-medium mb-8">Não conseguimos encontrar as informações deste talento no momento.</p>
          <Button onClick={() => router.back()} className="w-full h-14 bg-slate-900 rounded-2xl font-black">
            Voltar ao Painel
          </Button>
        </div>
      </div>
    )
  }

  const dateFormatted = new Date(user.createdAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Botão Voltar */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors group w-fit"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Voltar para os Candidatos
      </button>

      {/* --- CARD DE PERFIL --- */}
      <Card className="overflow-hidden border-none rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        
        {/* Banner com Gradiente */}
        <div className="h-40 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 relative">
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute bottom-4 right-8 flex gap-2">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck size={14} /> Verificado
                </div>
            </div>
        </div>
        
        <div className="px-8 pb-12">
          {/* Avatar e Título */}
          <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-10">
            <div className="w-32 h-32 bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-emerald-900/10">
              <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl font-[950] border border-emerald-50">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-4xl font-[950] text-slate-900 tracking-tight leading-none">
                    {user.name}
                 </h1>
                 <Sparkles className="text-emerald-500 w-5 h-5" />
              </div>
              <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                Freelancer <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Coluna Esquerda: Detalhes */}
            <div className="space-y-6">
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Informações de Contato</h4>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all cursor-default">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                        <p className="font-bold text-slate-700">{user.email}</p>
                    </div>
                  </div>

                  {/* NOVO CAMPO: TELEFONE */}
                  {user.phone && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all cursor-default">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
                          <Phone size={20} />
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p>
                          <p className="font-bold text-slate-700">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Membro desde</p>
                        <p className="font-bold text-slate-700 capitalize">{dateFormatted}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Coluna Direita: Bio/Tags */}
            <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Sobre o profissional</h4>
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-dashed border-slate-200 min-h-[140px] flex items-center justify-center">
                    <div className="text-center w-full">
                        {/* LÓGICA DO SOBRE MIM ADICIONADA */}
                        {user.aboutMe ? (
                            <p className="text-slate-600 text-sm font-medium whitespace-pre-wrap text-left">
                                {user.aboutMe}
                            </p>
                        ) : (
                            <p className="text-slate-400 text-sm font-medium italic">
                                "O freelancer ainda não preencheu sua apresentação detalhada."
                            </p>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Badge de Verificação Inferior */}
      <p className="text-center mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
        <ShieldCheck size={14} className="text-emerald-500" /> ClickJob
      </p>
    </div>
  )
}