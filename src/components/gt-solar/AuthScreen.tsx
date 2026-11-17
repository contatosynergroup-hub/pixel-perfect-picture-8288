import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sun,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Loader2,
} from "lucide-react";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha o e-mail e a senha.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Bem-vindo ao GT Solar | Gestão de Orçamentos!");
      } else {
        if (!fullName.trim()) {
          toast.error("Informe o seu nome completo.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada e autenticada com sucesso!");
        } else {
          toast.success(
            "Cadastro realizado! Verifique seu e-mail ou faça login abaixo.",
          );
          setMode("login");
        }
      }
    } catch (err: any) {
      toast.error(
        err?.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : err?.message || "Erro na autenticação.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-white">
      {/* Painel institucional lateral (Azul Solar + Laranja GT Solar) */}
      <div className="lg:w-7/12 relative overflow-hidden bg-gradient-to-br from-[#0B1E36] via-[#0F2942] to-[#173A5E] p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold tracking-wider uppercase">
            <Sun className="w-4 h-4 text-orange-400" />
            Plataforma Comercial & Engenharia
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center gap-4">
              <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-300">
                Espaço reservado para Logotipo Oficial GT Solar
              </div>
            </div>
            <h1 className="mt-6 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              GT Solar{" "}
              <span className="text-orange-500">| Gestão de Orçamentos</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Dimensionamento técnico preciso, formação de preços comerciais e
              emissão de propostas em PDF para energia solar fotovoltaica,
              aquecimento solar de água (boiler) e aquecimento de piscinas.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-2.5 text-orange-400 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5" />
                Acesso Administrador
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Gestão de usuários, catálogo de produtos, parâmetros de
                dimensionamento, margens por categoria, dados da empresa e visão
                global de vendas.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-sm">
                <UserCheck className="w-5 h-5" />
                Acesso Vendedor
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Cadastro de clientes, calculadoras de dimensionamento (FV,
                Boiler e Piscina), criação de orçamentos e emissão de propostas
                comerciais em PDF.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <span>GT Solar — Energia Solar & Aquecimento</span>
          <span>
            Nota: O 1º usuário cadastrado no banco assume automaticamente o
            perfil de Administrador.
          </span>
        </div>
      </div>

      {/* Formulário de Login / Cadastro */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 sm:p-12 bg-white text-slate-900">
        <div className="w-full max-w-md">
          <div className="flex rounded-xl bg-slate-100 p-1 mb-8">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Entrar na Plataforma
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === "login"
                ? "Acesse sua conta comercial"
                : "Cadastro de colaborador"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "login"
                ? "Informe suas credenciais corporativas para acessar o sistema."
                : "Preencha seus dados para acessar o sistema de orçamentos GT Solar."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Carlos Mendes"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Telefone / WhatsApp Comercial
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 90000-0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                E-mail Corporativo *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@gtsolar.com.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 px-4 text-sm shadow-sm transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  {mode === "login"
                    ? "Entrar no Sistema"
                    : "Concluir Cadastro"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
