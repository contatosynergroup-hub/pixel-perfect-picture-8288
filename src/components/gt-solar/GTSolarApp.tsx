import { useState } from "react";
import {
  GTSolarProvider,
  useGTSolar,
  type NavigationTab,
} from "@/lib/gt-solar-store";
import { AuthScreen } from "./AuthScreen";
import { DashboardView } from "./DashboardView";
import { QuoteWizardView } from "./QuoteWizardView";
import { QuotesListView } from "./QuotesListView";
import { ClientsView } from "./ClientsView";
import { ProductsView } from "./ProductsView";
import { UsersManagementView } from "./UsersManagementView";
import { SettingsView } from "./SettingsView";
import {
  LayoutDashboard,
  Calculator,
  FileSpreadsheet,
  Users,
  Package,
  Settings,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  Menu,
  X,
  Building2,
  Loader2,
} from "lucide-react";

const NAV_ITEMS: Array<{
  id: NavigationTab;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}> = [
  { id: "dashboard", label: "Dashboard Comercial", icon: LayoutDashboard },
  {
    id: "novo-orcamento",
    label: "Novo Orçamento / Calculadoras",
    icon: Calculator,
  },
  { id: "orcamentos", label: "Gestão de Orçamentos", icon: FileSpreadsheet },
  { id: "clientes", label: "Cadastro de Clientes", icon: Users },
  { id: "produtos", label: "Catálogo de Produtos", icon: Package },
  {
    id: "usuarios",
    label: "Vendedores & Usuários (Admin)",
    icon: UserCog,
    adminOnly: true,
  },
  { id: "configuracoes", label: "Configurações & Parâmetros", icon: Settings },
];

function GTSolarWorkspace() {
  const {
    user,
    profile,
    isAdmin,
    authLoading,
    dataLoading,
    activeTab,
    setActiveTab,
    companySettings,
    refreshAllData,
    signOut,
    startNewQuote,
  } = useGTSolar();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F2942] text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm font-semibold">
          Carregando GT Solar | Gestão de Orçamentos...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Colaborador";
  const tradeName = companySettings?.trade_name || "GT Solar";
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="no-print hidden lg:flex lg:w-68 lg:flex-col bg-[#0F2942] text-white shrink-0 border-r border-white/10">
        {/* Identidade e Espaço para Logotipo Oficial */}
        <div className="p-5 border-b border-white/10">
          {companySettings?.logo_url ? (
            <div className="mb-3 bg-white rounded-xl p-2.5 flex items-center justify-center">
              <img
                src={companySettings.logo_url}
                alt={tradeName}
                className="max-h-12 w-auto object-contain"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("configuracoes")}
              className="w-full mb-3 px-3 py-2.5 rounded-xl border border-dashed border-white/25 bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-[11px] text-slate-300 leading-tight">
                Espaço para Logotipo Oficial (Enviar em Configurações)
              </span>
            </button>
          )}

          <div className="text-lg font-extrabold tracking-tight text-white">
            {tradeName}{" "}
            <span className="text-orange-400 font-semibold text-sm block">
              Gestão de Orçamentos
            </span>
          </div>
        </div>

        {/* Botão Destaque Novo Orçamento */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => startNewQuote()}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            + Novo Orçamento
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Rodapé do Usuário Logado */}
        <div className="p-4 border-t border-white/10 bg-[#0B1E32] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user.email}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                isAdmin
                  ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                  : "bg-sky-500/20 text-sky-300 border border-sky-400/30"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3" />
                  Vendedor
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Responsiva */}
        <header className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {tradeName} | Sistema Integrado de Dimensionamento e Propostas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={refreshAllData}
              disabled={dataLoading}
              title="Atualizar dados do Supabase"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-orange-600 ${
                  dataLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          </div>
        </header>

        {/* Menu Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="no-print fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-[#0F2942] text-white h-full flex flex-col justify-between p-5 z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="font-bold text-base">
                    {tradeName}{" "}
                    <span className="text-orange-400 text-xs block">
                      Gestão de Orçamentos
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          active
                            ? "bg-orange-500 text-white"
                            : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="text-xs font-semibold">{displayName}</div>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full py-2 rounded-lg bg-white/10 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Área de Conteúdo da Aba Selecionada */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "novo-orcamento" && <QuoteWizardView />}
          {activeTab === "orcamentos" && <QuotesListView />}
          {activeTab === "clientes" && <ClientsView />}
          {activeTab === "produtos" && <ProductsView />}
          {activeTab === "usuarios" && <UsersManagementView />}
          {activeTab === "configuracoes" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export function GTSolarApp() {
  return (
    <GTSolarProvider>
      <GTSolarWorkspace />
    </GTSolarProvider>
  );
}
