"use client"

import { useEffect, useState, use } from "react"
import { getApplicationsByJob, updateApplicationStatus } from "@/lib/applications"
import { 
  Check, 
  X, 
  User, 
  ArrowLeft, 
  ExternalLink, 
  BadgeCheck, 
  Search, 
  Sparkles, 
  Loader2,
  ChevronLeft,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Application {
  id: number
  freelancerId: number
  freelancerName: string
  status: "PENDING" | "ACCEPTED" | "REFUSED" | "CANCELLED"
  createdAt: string
}

// Interface para o estado do Modal de Confirmação
interface ConfirmDialogState {
  isOpen: boolean;
  applicationId: number | null;
  status: "ACCEPTED" | "REFUSED" | null;
  freelancerName: string;
}

export default function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado que controla o Modal
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    applicationId: null,
    status: null,
    freelancerName: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    if (jobId) loadApplications()
  }, [jobId])

  async function loadApplications() {
    try {
      const data = await getApplicationsByJob(Number(jobId))
      setApplications(data)
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função original mantida, mas agora é chamada pelo Modal
  async function handleStatusUpdate(applicationId: number, newStatus: "ACCEPTED" | "REFUSED") {
    try {
      await updateApplicationStatus(applicationId, newStatus)
      setApplications((prev) => 
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      )
      toast({
        title: newStatus === 'ACCEPTED' ? "Candidato Contratado!" : "Candidatura Recusada",
        description: `O status foi atualizado com sucesso.`,
      })
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Falha na comunicação com o servidor.", 
        variant: "destructive" 
      })
    }
  }

  // Função disparada ao clicar em "Confirmar" no modal
  const executeConfirmation = async () => {
    if (confirmDialog.applicationId && confirmDialog.status) {
      await handleStatusUpdate(confirmDialog.applicationId, confirmDialog.status);
      setConfirmDialog({ isOpen: false, applicationId: null, status: null, freelancerName: "" });
    }
  }

  // Função para abrir o modal
  const openConfirmDialog = (app: Application, status: "ACCEPTED" | "REFUSED") => {
    setConfirmDialog({
      isOpen: true,
      applicationId: app.id,
      status: status,
      freelancerName: app.freelancerName || `Freelancer #${app.freelancerId}`
    })
  }

  return (
    <>
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative z-10">
        
        {/* Botão Voltar */}
        <Link 
          href="/jobs/my" 
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors group w-fit"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar para Meus Jobs
        </Link>

        {/* --- HEADER --- */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Gestão de Talentos</span>
            </div>
            <h1 className="text-4xl font-[950] text-slate-900 tracking-tight leading-none">
              Candidatos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Inscritos</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium">Analise os perfis e escolha o melhor profissional para seu projeto.</p>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-sm font-black text-slate-700 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {applications.length} {applications.length === 1 ? 'Candidatura' : 'Candidaturas'}
          </div>
        </header>

        {/* --- LISTAGEM --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Buscando currículos...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800">Ainda não há candidatos</h3>
            <p className="text-slate-500 mt-2 font-medium">Sua vaga está ativa e aguardando interessados.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className={cn(
                  "group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] transition-all duration-500",
                  "hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-emerald-100",
                  app.status === 'ACCEPTED' && "bg-emerald-50/30 border-emerald-100"
                )}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  
                  {/* Info do Freelancer */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative">
                      <div className={cn(
                        "h-20 w-20 rounded-[1.5rem] flex items-center justify-center text-emerald-600 transition-transform duration-500 group-hover:scale-110 shadow-inner",
                        app.status === 'ACCEPTED' ? "bg-emerald-500 text-white" : "bg-gradient-to-br from-slate-50 to-emerald-50"
                      )}>
                        <User size={40} strokeWidth={1.5} />
                      </div>
                      {app.status === 'ACCEPTED' && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg animate-bounce-short">
                          <BadgeCheck size={18} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <h3 className="text-2xl font-[950] text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors leading-none">
                        {app.freelancerName || `Freelancer #${app.freelancerId}`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                          app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 
                          app.status === 'REFUSED' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        )}>
                          {app.status === 'PENDING' ? 'Em análise' : app.status === 'ACCEPTED' ? 'Selecionado' : 'Recusado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    <Link href={`/profile/${app.freelancerId}`}>
                      <Button variant="ghost" className="h-14 rounded-2xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 font-bold gap-2 px-6">
                        Ver Perfil <ExternalLink size={18} />
                      </Button>
                    </Link>

                    {app.status === "PENDING" && (
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => openConfirmDialog(app, "REFUSED")}
                          variant="ghost"
                          className="h-14 w-14 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                        >
                          <X size={24} />
                        </Button>

                        <Button 
                          onClick={() => openConfirmDialog(app, "ACCEPTED")}
                          className="h-14 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl px-8 font-black shadow-xl hover:shadow-emerald-200 transition-all gap-2"
                        >
                          <Check size={20} /> Aceitar Candidato
                        </Button>
                      </div>
                    )}
                    
                    {app.status === "ACCEPTED" && (
                      <div className="text-emerald-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 bg-emerald-100/50 px-6 py-4 rounded-2xl">
                        <BadgeCheck size={20} /> Contratação Efetuada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
            Painel de Recrutamento do Empregador <span className="text-emerald-500">●</span> ClickJob
          </p>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              
              {/* Ícone dinâmico baseado na ação */}
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                confirmDialog.status === 'ACCEPTED' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              )}>
                {confirmDialog.status === 'ACCEPTED' ? <BadgeCheck size={40} /> : <AlertCircle size={40} />}
              </div>

              {/* Textos dinâmicos */}
              <h2 className="text-2xl font-[950] text-slate-900 mb-2">
                {confirmDialog.status === 'ACCEPTED' ? "Confirmar contratação?" : "Recusar candidato?"}
              </h2>
              <p className="text-slate-500 font-medium mb-8">
                {confirmDialog.status === 'ACCEPTED' 
                  ? <>Você está prestes a aprovar <strong>{confirmDialog.freelancerName}</strong> para este projeto. O candidato será notificado.</>
                  : <>Tem certeza que deseja recusar <strong>{confirmDialog.freelancerName}</strong>? Esta ação não poderá ser desfeita.</>
                }
              </p>

              {/* Botões do Modal */}
              <div className="flex w-full gap-3">
                <Button 
                  onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                  variant="ghost"
                  className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                
                <Button 
                  onClick={executeConfirmation}
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-black text-white shadow-lg",
                    confirmDialog.status === 'ACCEPTED' 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300"
                      : "bg-rose-500 hover:bg-rose-600 shadow-rose-200 hover:shadow-rose-300"
                  )}
                >
                  {confirmDialog.status === 'ACCEPTED' ? "Sim, Contratar" : "Sim, Recusar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}