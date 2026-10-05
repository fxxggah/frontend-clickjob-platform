"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getById } from "@/lib/jobs"
import { createApplication, getMyApplications } from "@/lib/applications"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  User, 
  CheckCircle2, 
  Send, 
  Clock, 
  XCircle, 
  ChevronLeft,
  Briefcase,
  CircleDollarSign,
  Loader2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function JobDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const [job, setJob] = useState<any>(null)
    const [isApplied, setIsApplied] = useState(false)
    const [loading, setLoading] = useState(true)
    
    // Estados da Candidatura
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [applicationStatus, setApplicationStatus] = useState("PENDING")
    
    // Estado do Modal
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const jobData = await getById(Number(id))
                setJob(jobData)

                const userId = localStorage.getItem("userId")
                const role = localStorage.getItem("role")

                if (role === "FREELANCER" && userId) {
                    const data = await getMyApplications(Number(userId))

                    const appsArray = Array.isArray(data) ? data : (data?.content || [])
                    const currentId = Number(id)

                    const appliedApp = appsArray.find((app: any) => {
                        const appliedJobId = app.job?.id || app.jobId
                        return Number(appliedJobId) === currentId
                    })

                    if (appliedApp) {
                        setIsApplied(true)
                        setApplicationStatus(appliedApp.status || "PENDING")
                    } else {
                        setIsApplied(false)
                    }
                }
            } catch (error) {
                console.error("Erro ao sincronizar dados:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) loadData()
    }, [id])

    // Apenas verifica o login e abre o modal
    function handleApplyClick() {
        const userId = localStorage.getItem("userId")
        if (!userId) {
            alert("Você precisa estar logado como freelancer.")
            return
        }
        setIsConfirmOpen(true)
    }

    // Executa de fato a candidatura após confirmação
    async function executeApply() {
        const userId = localStorage.getItem("userId")
        
        setIsSubmitting(true)
        try {
            await createApplication(Number(id), Number(userId!))
            setIsApplied(true)
            setApplicationStatus("PENDING") 
            setIsConfirmOpen(false)
            alert("Candidatura enviada com sucesso!")
        } catch (error: any) {
            setIsConfirmOpen(false)
            if (error.message?.includes("já se candidatou")) {
                setIsApplied(true)
            } else {
                alert(error.message || "Erro ao se candidatar.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Sincronizando Oportunidade...</p>
        </div>
    )

    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 sm:p-6">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl text-center max-w-md w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 text-slate-300 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h2 className="text-xl sm:text-2xl font-[950] text-slate-900 mb-2">Ops!</h2>
                <p className="text-slate-500 font-medium mb-8 text-sm sm:text-base">Esta oportunidade não foi encontrada ou já foi removida.</p>
                <Button onClick={() => router.back()} className="w-full h-12 sm:h-14 bg-slate-900 rounded-xl sm:rounded-2xl font-black">
                    Voltar ao Mural
                </Button>
            </div>
        </div>
    )

    return (
        <>
            <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-8 sm:pt-12 px-4 sm:px-6 relative z-10">
                
                {/* Botão Voltar */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-6 sm:mb-8 transition-colors group w-fit"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Voltar
                </button>

                {/* CARD PRINCIPAL */}
                <div className="bg-white border-none rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden relative">
                    
                    {/* Header da Vaga */}
                    <div className="p-6 sm:p-8 md:p-12 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-8">
                            <div className="space-y-4 sm:space-y-6 flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full border border-slate-100 shadow-sm w-fit">
                                    <span className="relative flex h-2 w-2">
                                      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", job.status === 'OPEN' ? "bg-emerald-400" : "bg-slate-400")}></span>
                                      <span className={cn("relative inline-flex rounded-full h-2 w-2", job.status === 'OPEN' ? "bg-emerald-500" : "bg-slate-400")}></span>
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600">
                                        {job.status === 'OPEN' ? 'Oportunidade Aberta' : 'Projeto Finalizado'}
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-[950] text-slate-900 tracking-tight leading-tight sm:leading-none">
                                    {job.title}
                                </h1>

                                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-6 text-slate-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shrink-0 rounded-[1rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                            <User size={18} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Contratante</p>
                                            <p className="font-bold text-slate-700 text-sm sm:text-base line-clamp-1">{job.employerName || "Cliente Confidencial"}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block w-px h-8 bg-slate-200" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shrink-0 rounded-[1rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <Calendar size={18} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Publicado em</p>
                                            <p className="font-bold text-slate-700 text-sm sm:text-base">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco de Orçamento */}
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full md:w-auto sm:min-w-[240px] shadow-xl shadow-emerald-900/10 shrink-0 mt-2 md:mt-0 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="flex items-center gap-2 mb-2 opacity-80">
                                    <CircleDollarSign size={16} />
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em]">Orçamento</p>
                                </div>
                                <p className="text-3xl sm:text-4xl font-[950] tracking-tight">
                                    <span className="text-lg sm:text-xl opacity-70 mr-1">R$</span>
                                    {Number(job.budget).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Corpo da Vaga */}   
                    <div className="p-6 sm:p-8 md:p-12">
                        <section className="mb-8 sm:mb-12">
                            <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 sm:mb-6 flex items-center gap-2">
                                <Briefcase size={14} className="text-emerald-500" /> Escopo do Serviço
                            </h3>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base sm:text-lg font-medium">
                                    {job.description}
                                </p>
                            </div>
                        </section>

                        {/* Área de Ação do Freelancer */}
                        {localStorage.getItem("role") === "FREELANCER" && (
                            <div className="pt-8 sm:pt-10 mt-8 sm:mt-10 border-t border-slate-100">
                                {isApplied ? (
                                    /* CARD DE STATUS DE CANDIDATURA */
                                    <div className={cn(
                                        "relative overflow-hidden border p-6 sm:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-500",
                                        applicationStatus === 'ACCEPTED' ? 'bg-emerald-50/50 border-emerald-200' :
                                        applicationStatus === 'REFUSED' ? 'bg-rose-50/50 border-rose-200' :
                                        'bg-slate-50 border-slate-200'
                                    )}>
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                                            <div className={cn(
                                                "w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center text-white shadow-lg",
                                                applicationStatus === 'ACCEPTED' ? 'bg-emerald-500 shadow-emerald-200' :
                                                applicationStatus === 'REFUSED' ? 'bg-rose-500 shadow-rose-200' :
                                                'bg-slate-400 shadow-slate-200'
                                            )}>
                                                {applicationStatus === 'ACCEPTED' && <CheckCircle2 size={32} strokeWidth={1.5} />}
                                                {applicationStatus === 'REFUSED' && <XCircle size={32} strokeWidth={1.5} />}
                                                {(!applicationStatus || applicationStatus === 'PENDING') && <Clock size={32} strokeWidth={1.5} />}
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "text-xl sm:text-2xl font-[950] tracking-tight mb-1",
                                                    applicationStatus === 'ACCEPTED' ? 'text-emerald-900' :
                                                    applicationStatus === 'REFUSED' ? 'text-rose-900' :
                                                    'text-slate-900'
                                                )}>
                                                    {applicationStatus === 'ACCEPTED' ? 'Você foi selecionado!' :
                                                     applicationStatus === 'REFUSED' ? 'Candidatura não aprovada.' :
                                                     'Candidatura em análise'}
                                                </p>
                                                <p className={cn(
                                                    "font-medium text-xs sm:text-sm max-w-sm",
                                                    applicationStatus === 'ACCEPTED' ? 'text-emerald-700/80' :
                                                    applicationStatus === 'REFUSED' ? 'text-rose-700/80' :
                                                    'text-slate-500'
                                                )}>
                                                    {applicationStatus === 'ACCEPTED' ? 'O cliente aprovou seu perfil para este projeto.' :
                                                     applicationStatus === 'REFUSED' ? 'Não desanime, busque novas oportunidades no mural.' :
                                                     'O cliente está avaliando seu perfil no momento.'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Badge Status Lateral */}
                                        <div className={cn(
                                            "flex items-center justify-center w-full lg:w-auto gap-2 bg-white px-5 py-3 rounded-xl sm:rounded-2xl shadow-sm border",
                                            applicationStatus === 'ACCEPTED' ? 'border-emerald-100 text-emerald-600' :
                                            applicationStatus === 'REFUSED' ? 'border-rose-100 text-rose-600' :
                                            'border-slate-100 text-slate-500'
                                        )}>
                                            {applicationStatus === 'ACCEPTED' && <Sparkles size={16} />}
                                            {(!applicationStatus || applicationStatus === 'PENDING') && <Clock size={16} className="animate-spin-slow" />}
                                            <span className="font-black text-[10px] uppercase tracking-widest">
                                                {applicationStatus === 'ACCEPTED' ? 'Aceito' :
                                                 applicationStatus === 'REFUSED' ? 'Recusado' :
                                                 'Aguardando'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* BOTÃO DE CANDIDATURA */
                                    <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5 border border-slate-100">
                                        <div className="px-2 sm:px-4 md:px-0 md:pl-4 text-center md:text-left w-full md:max-w-xs">
                                            <h4 className="text-base sm:text-lg font-bold text-slate-900">Tem interesse?</h4>
                                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Envie seu perfil para análise do contratante.</p>
                                        </div>
                                        <Button
                                            onClick={handleApplyClick}
                                            disabled={job.status !== 'OPEN'}
                                            className="w-full md:w-auto bg-slate-900 hover:bg-emerald-600 text-white h-14 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-[2rem] text-base sm:text-lg font-black shadow-xl hover:shadow-emerald-200 transition-all gap-2 sm:gap-3 group"
                                        >
                                            {job.status !== 'OPEN' ? (
                                                "Vaga Encerrada"
                                            ) : (
                                                <>
                                                    Candidatar-se agora
                                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <style jsx global>{`
                    .animate-spin-slow {
                        animation: spin 3s linear infinite;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>

            {/* --- MODAL DE CONFIRMAÇÃO DE CANDIDATURA --- */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-emerald-100 text-emerald-600">
                                <Send size={40} />
                            </div>

                            <h2 className="text-2xl font-[950] text-slate-900 mb-2">
                                Confirmar Candidatura?
                            </h2>
                            <p className="text-slate-500 font-medium mb-8 text-sm">
                                Você está prestes a enviar seu perfil para <strong>{job.employerName || "este cliente"}</strong>. O cliente terá acesso às informações do seu currículo.
                            </p>

                            <div className="flex w-full gap-3">
                                <Button 
                                    onClick={() => setIsConfirmOpen(false)}
                                    variant="ghost"
                                    disabled={isSubmitting}
                                    className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                                >
                                    Cancelar
                                </Button>
                                
                                <Button 
                                    onClick={executeApply}
                                    disabled={isSubmitting}
                                    className="flex-1 h-14 rounded-2xl font-black text-white shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300 transition-all gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Enviando
                                        </>
                                    ) : (
                                        "Sim, Candidatar"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}