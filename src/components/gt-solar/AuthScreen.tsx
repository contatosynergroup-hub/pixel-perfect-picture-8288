import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sun,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Apenas para o 1º acesso caso o Administrador Master ainda não tenha sido configurado no banco
  const [showFirstAdminSetup, setShowFirstAdminSetup] = useState(false);
  const [adminName, setAdminName] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Informe seu e-mail e senha de acesso.");
      return;
    }
    setLoading(true);
    try {
      if (showFirstAdminSetup) {
        if (!adminName.trim()) {
          toast.error("Informe o nome do Administrador.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: adminName.trim(),
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Administrador configurado com sucesso!");
        } else {
          toast.success(
            "Administrador registrado! Faça login abaixo com suas credenciais.",
          );
          setShowFirstAdminSetup(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Bem-vindo ao GT Solar | Gestão de Orçamentos!");
      }
    } catch (err: any) {
      toast.error(
        err?.message === "Invalid login credentials"
          ? "E-mail ou senha inválidos. Solicite seu acesso ao Administrador."
          : err?.message || "Erro ao autenticar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1E36] via-[#0F2942] to-[#173A5E] p-4 relative overflow-hidden">
      {/* Efeitos sutis de iluminação solar ao fundo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Topo com Identidade Visual GT Solar */}
        <div className="bg-[#0F2942] px-8 pt-8 pb-6 text-center border-b-4 border-orange-500">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500 text-white shadow-md mb-3">
            <Sun className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            GT Solar
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mt-0.5">
            Gestão de Orçamentos
          </p>
        </div>

        {/* Formulário Exclusivo de Login */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              {showFirstAdminSetup
                ? "Configuração Inicial do Administrador"
                : "Acesso Restrito à Plataforma"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {showFirstAdminSetup
                ? "Cadastre a conta matriz de Administrador para gerenciar usuários e vendedores."
                : "Entre com o login e senha fornecidos pela administração da GT Solar."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {showFirstAdminSetup && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nome do Administrador *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                E-mail de Acesso *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@gtsolar.com.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Senha *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3 px-4 text-sm shadow-sm transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  {showFirstAdminSetup
                    ? "Ativar Conta Administrador"
                    : "Entrar no Sistema"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Novos vendedores e usuários são cadastrados exclusivamente no
              painel do Administrador.
            </p>
            <button
              type="button"
              onClick={() => setShowFirstAdminSetup((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {showFirstAdminSetup
                ? "Voltar para a tela de Login"
                : "Primeiro acesso? Configurar Administrador Master"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
