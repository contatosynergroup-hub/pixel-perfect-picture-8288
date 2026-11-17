import { useMemo, useState } from "react";
import { useGTSolar } from "@/lib/gt-solar-store";
import {
  formatBRL,
  formatDateBR,
  formatNumber,
  QUOTE_MODALITY_META,
  QUOTE_STATUS_META,
  type QuoteModality,
} from "@/lib/calculators";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  Sun,
  Flame,
  Waves,
  PlusCircle,
  Filter,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
} from "lucide-react";

type PeriodFilter = "7d" | "30d" | "90d" | "365d" | "all";

export function DashboardView() {
  const {
    quotes,
    clients,
    allProfiles,
    isAdmin,
    user,
    startNewQuote,
    startEditQuote,
    setActiveTab,
  } = useGTSolar();

  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");

  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of allProfiles) {
      map.set(p.id, p.full_name || p.email || "Vendedor");
    }
    if (user && !map.has(user.id)) {
      map.set(user.id, user.email?.split("@")[0] || "Você");
    }
    return map;
  }, [allProfiles, user]);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) {
      map.set(c.id, c.name);
    }
    return map;
  }, [clients]);

  const filteredQuotes = useMemo(() => {
    const now = new Date();
    return quotes.filter((q) => {
      if (!isAdmin && user && q.seller_id !== user.id) return false;
      if (sellerFilter !== "all" && q.seller_id !== sellerFilter) return false;
      if (modalityFilter !== "all" && q.modality !== modalityFilter)
        return false;

      if (period !== "all") {
        const days =
          period === "7d"
            ? 7
            : period === "30d"
              ? 30
              : period === "90d"
                ? 90
                : 365;
        const created = new Date(q.created_at);
        const diffDays =
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > days) return false;
      }
      return true;
    });
  }, [quotes, isAdmin, user, sellerFilter, modalityFilter, period]);

  const metrics = useMemo(() => {
    const totalCount = filteredQuotes.length;
    const totalOrcado = filteredQuotes.reduce(
      (acc, q) => acc + Number(q.total_value || 0),
      0,
    );

    const aprovados = filteredQuotes.filter((q) => q.status === "aprovado");
    const pendentes = filteredQuotes.filter(
      (q) =>
        q.status === "rascunho" ||
        q.status === "enviado" ||
        q.status === "negociacao",
    );
    const perdidos = filteredQuotes.filter(
      (q) => q.status === "perdido" || q.status === "expirado",
    );

    const valorVendido = aprovados.reduce(
      (acc, q) => acc + Number(q.total_value || 0),
      0,
    );
    const valorEmNegociacao = pendentes.reduce(
      (acc, q) => acc + Number(q.total_value || 0),
      0,
    );

    const taxaConversao =
      totalCount > 0 ? (aprovados.length / totalCount) * 100 : 0;

    return {
      totalCount,
      totalOrcado,
      aprovadosCount: aprovados.length,
      pendentesCount: pendentes.length,
      perdidosCount: perdidos.length,
      valorVendido,
      valorEmNegociacao,
      taxaConversao,
    };
  }, [filteredQuotes]);

  // Gráfico de vendas e orçamentos por mês (últimos 6 meses)
  const monthlySeries = useMemo(() => {
    const months: Array<{
      key: string;
      label: string;
      orcado: number;
      vendido: number;
      qtd: number;
    }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
      months.push({ key, label, orcado: 0, vendido: 0, qtd: 0 });
    }

    const map = new Map(months.map((m) => [m.key, m]));
    for (const q of filteredQuotes) {
      const d = new Date(q.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = map.get(key);
      if (bucket) {
        bucket.qtd += 1;
        bucket.orcado += Number(q.total_value || 0);
        if (q.status === "aprovado") {
          bucket.vendido += Number(q.total_value || 0);
        }
      }
    }
    return months;
  }, [filteredQuotes]);

  const maxMonthlyVal = useMemo(() => {
    return Math.max(
      1,
      ...monthlySeries.map((m) => Math.max(m.orcado, m.vendido)),
    );
  }, [monthlySeries]);

  // Distribuição por modalidade
  const modalityDistribution = useMemo(() => {
    const modalities: QuoteModality[] = [
      "fotovoltaico",
      "boiler",
      "piscina",
      "manual",
    ];
    return modalities.map((mod) => {
      const subset = filteredQuotes.filter((q) => q.modality === mod);
      const sold = subset.filter((q) => q.status === "aprovado");
      const totalVal = subset.reduce(
        (acc, q) => acc + Number(q.total_value || 0),
        0,
      );
      const soldVal = sold.reduce(
        (acc, q) => acc + Number(q.total_value || 0),
        0,
      );
      return {
        modality: mod,
        meta: QUOTE_MODALITY_META[mod],
        count: subset.length,
        soldCount: sold.length,
        totalVal,
        soldVal,
      };
    });
  }, [filteredQuotes]);

  // Desempenho por vendedor
  const sellerPerformance = useMemo(() => {
    const map = new Map<
      string,
      {
        sellerId: string;
        name: string;
        totalQuotes: number;
        approvedQuotes: number;
        totalOrcado: number;
        totalVendido: number;
      }
    >();

    for (const q of filteredQuotes) {
      const sId = q.seller_id;
      const existing = map.get(sId) ?? {
        sellerId: sId,
        name: profileMap.get(sId) || `Vendedor (${sId.slice(0, 6)})`,
        totalQuotes: 0,
        approvedQuotes: 0,
        totalOrcado: 0,
        totalVendido: 0,
      };
      existing.totalQuotes += 1;
      existing.totalOrcado += Number(q.total_value || 0);
      if (q.status === "aprovado") {
        existing.approvedQuotes += 1;
        existing.totalVendido += Number(q.total_value || 0);
      }
      map.set(sId, existing);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.totalVendido - a.totalVendido || b.totalOrcado - a.totalOrcado,
    );
  }, [filteredQuotes, profileMap]);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-vindas e Ações Rápidas */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F2942] via-[#153759] to-[#1D4872] text-white p-6 shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold">
            <Sun className="w-3.5 h-3.5" />
            Central Comercial GT Solar
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            Painel de Indicadores & Dimensionamento
          </h2>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Inicie um novo dimensionamento técnico ou acompanhe o funil de
            propostas, conversão e faturamento em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => startNewQuote({ modality: "fotovoltaico" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Sun className="w-4 h-4" />
            + Solar Fotovoltaico
          </button>
          <button
            type="button"
            onClick={() => startNewQuote({ modality: "boiler" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            + Aquecimento Boiler
          </button>
          <button
            type="button"
            onClick={() => startNewQuote({ modality: "piscina" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Waves className="w-4 h-4" />
            + Piscina
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-orange-600" />
          Filtros do Painel
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Período
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todo o histórico</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="365d">Últimos 12 meses</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Modalidade
            </label>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas as modalidades</option>
              <option value="fotovoltaico">Energia Solar Fotovoltaica</option>
              <option value="boiler">Aquecimento Solar — Boiler</option>
              <option value="piscina">Aquecimento de Piscinas</option>
              <option value="manual">Orçamento Manual</option>
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Vendedor
              </label>
              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos os vendedores</option>
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Orçamentos
            </span>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {metrics.totalCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Propostas registradas no período
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Valor Total Orçado
            </span>
            <span className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-xl font-bold text-slate-900 truncate">
            {formatBRL(metrics.totalOrcado)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Volume financeiro em propostas
          </p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Total Vendido (Aprov.)
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-xl font-bold text-emerald-700 truncate">
            {formatBRL(metrics.valorVendido)}
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {metrics.aprovadosCount} orçamento(s) aprovado(s)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase">
              Orçamentos Pendentes
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-700">
            {metrics.pendentesCount}
          </div>
          <p className="mt-1 text-xs text-amber-600 truncate">
            {formatBRL(metrics.valorEmNegociacao)} em aberto
          </p>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase">
              Orçamentos Perdidos
            </span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-700">
            {metrics.perdidosCount}
          </div>
          <p className="mt-1 text-xs text-rose-600">Perdidos ou expirados</p>
        </div>

        <div className="bg-white rounded-xl border border-sky-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 uppercase">
              Taxa de Conversão
            </span>
            <span className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-sky-800">
            {formatNumber(metrics.taxaConversao, 1)}%
          </div>
          <p className="mt-1 text-xs text-sky-600">
            Aprovados sobre total emitido
          </p>
        </div>
      </div>

      {/* Gráficos: Vendas por Mês e Distribuição por Modalidade */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Vendas por Mês */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                Evolução de Orçamentos e Vendas por Mês
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo entre volume total orçado e valor efetivamente
                vendido (últimos 6 meses)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                Valor Orçado
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-orange-500 inline-block" />
                Valor Vendido
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 items-end h-52 pt-4 px-2 border-b border-slate-200">
            {monthlySeries.map((m) => {
              const orcadoHeight = Math.max(
                6,
                Math.round((m.orcado / maxMonthlyVal) * 160),
              );
              const vendidoHeight =
                m.vendido > 0
                  ? Math.max(6, Math.round((m.vendido / maxMonthlyVal) * 160))
                  : 0;
              return (
                <div
                  key={m.key}
                  className="flex flex-col items-center justify-end h-full group"
                >
                  <div className="text-[10px] font-semibold text-slate-500 mb-1 text-center">
                    {m.vendido > 0 ? formatBRL(m.vendido) : `${m.qtd} orç.`}
                  </div>
                  <div className="flex items-end justify-center gap-1.5 w-full">
                    <div
                      style={{ height: `${orcadoHeight}px` }}
                      title={`Orçado em ${m.label}: ${formatBRL(m.orcado)}`}
                      className="w-4 sm:w-6 bg-slate-200 hover:bg-slate-300 rounded-t-md transition-all"
                    />
                    <div
                      style={{ height: `${vendidoHeight}px` }}
                      title={`Vendido em ${m.label}: ${formatBRL(m.vendido)}`}
                      className="w-4 sm:w-6 bg-orange-500 hover:bg-orange-600 rounded-t-md transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-6 gap-3 pt-2 text-center">
            {monthlySeries.map((m) => (
              <div
                key={m.key}
                className="text-xs font-semibold text-slate-600 uppercase"
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição de Vendas por Categoria / Modalidade */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-orange-600" />
              Distribuição por Categoria de Solução
            </h3>
            <p className="text-xs text-slate-500">
              Volume comercial orçado e vendido em cada modalidade técnica
            </p>
          </div>

          <div className="space-y-4">
            {modalityDistribution.map((item) => {
              const pct =
                metrics.totalOrcado > 0
                  ? (item.totalVal / metrics.totalOrcado) * 100
                  : 0;
              return (
                <div
                  key={item.modality}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.meta.label}</span>
                    <span className="text-slate-600">
                      {item.count} orç. ({item.soldCount} aprov.)
                    </span>
                  </div>
                  <div className="mt-2 w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.max(pct, item.count > 0 ? 6 : 0)}%`,
                        backgroundColor: item.meta.color,
                      }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Orçado:{" "}
                      <strong className="text-slate-700">
                        {formatBRL(item.totalVal)}
                      </strong>
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      Vendido: {formatBRL(item.soldVal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desempenho por Vendedor e Últimos Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranking de Vendedores */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-600" />
              Desempenho por Vendedor
            </h3>
            <p className="text-xs text-slate-500">
              Produtividade, volume orçado e conversão por consultor comercial
            </p>
          </div>

          {sellerPerformance.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum orçamento registrado no período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {sellerPerformance.map((s, idx) => {
                const conv =
                  s.totalQuotes > 0
                    ? (s.approvedQuotes / s.totalQuotes) * 100
                    : 0;
                return (
                  <div
                    key={s.sellerId}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}º
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {s.totalQuotes} proposta(s) • {s.approvedQuotes}{" "}
                          venda(s) ({formatNumber(conv, 0)}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700">
                        {formatBRL(s.totalVendido)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Orçado: {formatBRL(s.totalOrcado)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Últimas Propostas Emitidas */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Orçamentos Recentes
              </h3>
              <p className="text-xs text-slate-500">
                Acesso rápido às últimas propostas elaboradas
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("orcamentos")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Ver todos
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-600 font-medium">
                Nenhum orçamento cadastrado ainda.
              </p>
              <button
                type="button"
                onClick={() => startNewQuote()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Primeiro Orçamento
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase">
                    <th className="py-2.5 pr-3 font-semibold">Nº / Data</th>
                    <th className="py-2.5 px-3 font-semibold">Cliente</th>
                    <th className="py-2.5 px-3 font-semibold">Modalidade</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Valor Total
                    </th>
                    <th className="py-2.5 pl-3 font-semibold text-right">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.slice(0, 6).map((q) => {
                    const statusMeta = QUOTE_STATUS_META[q.status];
                    const modMeta = QUOTE_MODALITY_META[q.modality];
                    return (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-3">
                          <div className="font-bold text-slate-900">
                            {q.number}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDateBR(q.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {q.client_id
                            ? clientMap.get(q.client_id) || "Cliente"
                            : "Cliente não vinculado"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${modMeta.badgeClass}`}
                          >
                            {modMeta.shortLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatBRL(q.total_value)}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => startEditQuote(q.id)}
                            className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                          >
                            Abrir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
