import { useMemo, useState } from "react";
import { useGTSolar, type QuoteRow } from "@/lib/gt-solar-store";
import {
  formatBRL,
  formatDateBR,
  QUOTE_MODALITY_META,
  QUOTE_STATUS_META,
  type QuoteStatus,
} from "@/lib/calculators";
import { ProposalPdfModal, type ProposalPdfData } from "./ProposalPdfModal";
import {
  PlusCircle,
  Search,
  Copy,
  Edit3,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  X,
} from "lucide-react";

export function QuotesListView() {
  const {
    quotes,
    quoteItemsByQuoteId,
    clients,
    allProfiles,
    companySettings,
    isAdmin,
    user,
    startNewQuote,
    startEditQuote,
    updateQuoteStatus,
    duplicateQuote,
    deleteQuote,
    fetchQuoteHistoryAndRevisions,
  } = useGTSolar();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");

  // Modal de perda / follow-up
  const [lostModalQuote, setLostModalQuote] = useState<QuoteRow | null>(null);
  const [lostReasonText, setLostReasonText] = useState("");

  // Modal de Histórico e Revisões
  const [historyModalQuote, setHistoryModalQuote] = useState<QuoteRow | null>(
    null,
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusHistoryList, setStatusHistoryList] = useState<any[]>([]);
  const [revisionsList, setRevisionsList] = useState<any[]>([]);

  // Modal de Proposta PDF
  const [pdfQuote, setPdfQuote] = useState<QuoteRow | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, (typeof clients)[number]>();
    for (const c of clients) map.set(c.id, c);
    return map;
  }, [clients]);

  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of allProfiles) {
      map.set(p.id, p.full_name || p.email || "Vendedor");
    }
    return map;
  }, [allProfiles]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      if (!isAdmin && user && q.seller_id !== user.id) return false;
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (modalityFilter !== "all" && q.modality !== modalityFilter)
        return false;
      if (clientFilter !== "all" && q.client_id !== clientFilter) return false;
      if (sellerFilter !== "all" && q.seller_id !== sellerFilter) return false;

      if (search.trim()) {
        const term = search.toLowerCase();
        const cliName = q.client_id
          ? clientMap.get(q.client_id)?.name?.toLowerCase() || ""
          : "";
        const num = q.number.toLowerCase();
        const ttl = (q.title || "").toLowerCase();
        if (
          !num.includes(term) &&
          !cliName.includes(term) &&
          !ttl.includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    quotes,
    isAdmin,
    user,
    statusFilter,
    modalityFilter,
    clientFilter,
    sellerFilter,
    search,
    clientMap,
  ]);

  const handleOpenHistory = async (quote: QuoteRow) => {
    setHistoryModalQuote(quote);
    setHistoryLoading(true);
    try {
      const res = await fetchQuoteHistoryAndRevisions(quote.id);
      setStatusHistoryList(res.history);
      setRevisionsList(res.revisions);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleConfirmLost = async () => {
    if (!lostModalQuote) return;
    await updateQuoteStatus(lostModalQuote.id, "perdido", {
      lostReason: lostReasonText.trim() || "Não informado",
      note: `Motivo de perda: ${lostReasonText.trim() || "Não informado"}`,
    });
    setLostModalQuote(null);
    setLostReasonText("");
  };

  const buildPdfDataForQuote = (q: QuoteRow): ProposalPdfData => {
    const rawItems = quoteItemsByQuoteId[q.id] ?? [];
    return {
      number: q.number,
      revision: q.revision,
      createdAt: q.created_at,
      validUntil: q.valid_until,
      modality: q.modality,
      title: q.title,
      sellerName: profileMap.get(q.seller_id) || "Consultor GT Solar",
      client: q.client_id ? clientMap.get(q.client_id) ?? null : null,
      company: companySettings,
      sizingInput: (q.sizing_input as Record<string, any>) || {},
      sizingResult: (q.sizing_result as Record<string, any>) || {},
      items: rawItems.map((it, idx) => ({
        id: it.id,
        product_id: it.product_id,
        description: it.description,
        category_slug: it.category_slug,
        unit: it.unit,
        quantity: Number(it.quantity),
        unit_cost: Number(it.unit_cost),
        unit_price: Number(it.unit_price),
        sort_order: idx + 1,
      })),
      subtotalBeforeDiscount: Number(q.total_value) + Number(q.discount || 0),
      discount: Number(q.discount || 0),
      totalValue: Number(q.total_value || 0),
      paymentTerms: q.payment_terms,
      executionDays: q.execution_days,
      notes: q.notes,
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Central de Gestão de Orçamentos e Propostas
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe negociações, duplique propostas, registre revisões e
            converta orçamentos aprovados em vendas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => startNewQuote()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      {/* Filtros de Pesquisa */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar Nº, cliente ou título..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
        >
          <option value="all">Todos os Status</option>
          {Object.entries(QUOTE_STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <select
          value={modalityFilter}
          onChange={(e) => setModalityFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
        >
          <option value="all">Todas as Modalidades</option>
          {Object.entries(QUOTE_MODALITY_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
        >
          <option value="all">Todos os Clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {isAdmin && (
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
          >
            <option value="all">Todos os Vendedores</option>
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.email}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista de Orçamentos */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Nenhum orçamento encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <th className="py-3 px-4 font-semibold">Nº / Revisão</th>
                  <th className="py-3 px-4 font-semibold">Cliente / Título</th>
                  <th className="py-3 px-4 font-semibold">Modalidade</th>
                  <th className="py-3 px-4 font-semibold">Vendedor</th>
                  <th className="py-3 px-4 font-semibold">Status Comercial</th>
                  <th className="py-3 px-4 font-semibold">Próx. Contato</th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Valor Final
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQuotes.map((q) => {
                  const cli = q.client_id ? clientMap.get(q.client_id) : null;
                  const modMeta = QUOTE_MODALITY_META[q.modality];
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {q.number}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Rev. {q.revision} • {formatDateBR(q.created_at)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {cli?.name || "Cliente não vinculado"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {q.title || "Proposta Comercial GT Solar"}
                        </div>
                        {q.status === "perdido" && q.lost_reason && (
                          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                            Motivo perda: {q.lost_reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${modMeta.badgeClass}`}
                        >
                          {modMeta.shortLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {profileMap.get(q.seller_id) || "Consultor"}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={q.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value as QuoteStatus;
                            if (nextStatus === "perdido") {
                              setLostModalQuote(q);
                              setLostReasonText(q.lost_reason || "");
                            } else {
                              updateQuoteStatus(q.id, nextStatus);
                            }
                          }}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${QUOTE_STATUS_META[q.status].badgeClass}`}
                        >
                          {Object.entries(QUOTE_STATUS_META).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="date"
                            value={q.next_contact || ""}
                            onChange={(e) =>
                              updateQuoteStatus(q.id, q.status, {
                                nextContact: e.target.value,
                              })
                            }
                            className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-700"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatBRL(q.total_value)}
                        </div>
                        {isAdmin && (
                          <div className="text-[10px] text-slate-400">
                            Custo: {formatBRL(q.total_cost)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {q.status !== "aprovado" && (
                            <button
                              type="button"
                              title="Converter em Venda (Aprovar)"
                              onClick={() => updateQuoteStatus(q.id, "aprovado")}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Visualizar e Imprimir Proposta PDF"
                            onClick={() => setPdfQuote(q)}
                            className="p-1.5 rounded-lg text-[#0F2942] hover:bg-slate-100 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Editar Orçamento / Criar Revisão"
                            onClick={() => startEditQuote(q.id)}
                            className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Duplicar Orçamento"
                            onClick={() => duplicateQuote(q.id)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Consultar Histórico de Status e Revisões"
                            onClick={() => handleOpenHistory(q)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Excluir Orçamento"
                            onClick={() => deleteQuote(q.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para registrar motivo de perda */}
      {lostModalQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Registrar Motivo de Perda — {lostModalQuote.number}
              </h3>
              <button
                type="button"
                onClick={() => setLostModalQuote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Informe o motivo pelo qual a proposta não foi fechada para análise
              comercial futura:
            </p>
            <textarea
              rows={3}
              value={lostReasonText}
              onChange={(e) => setLostReasonText(e.target.value)}
              placeholder="Ex: Concorrente com menor preço, cliente adiou obra, financiamento recusado..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLostModalQuote(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLost}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Confirmar Status Perdido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Status e Revisões */}
      {historyModalQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Histórico e Revisões — {historyModalQuote.number}
                </h3>
                <p className="text-xs text-slate-500">
                  Rastreabilidade completa de status e snapshots de revisões
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalQuote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Carregando histórico...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="font-bold uppercase text-slate-600">
                    Linha do Tempo de Status
                  </div>
                  {statusHistoryList.length === 0 ? (
                    <p className="text-slate-400">Sem registros adicionais.</p>
                  ) : (
                    statusHistoryList.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="font-bold text-slate-900 uppercase">
                          {QUOTE_STATUS_META[h.status as QuoteStatus]?.label ||
                            h.status}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(h.created_at).toLocaleString("pt-BR")}
                        </div>
                        {h.note && (
                          <div className="mt-1 text-slate-700">{h.note}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <div className="font-bold uppercase text-slate-600">
                    Revisões Anteriores Arquivadas
                  </div>
                  {revisionsList.length === 0 ? (
                    <p className="text-slate-400">
                      Nenhuma revisão anterior (orçamento na revisão original).
                    </p>
                  ) : (
                    revisionsList.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="font-bold text-slate-900">
                          Revisão #{r.revision}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Salva em{" "}
                          {new Date(r.created_at).toLocaleString("pt-BR")}
                        </div>
                        {r.snapshot?.quote?.total_value !== undefined && (
                          <div className="mt-1 font-semibold text-orange-600">
                            Valor na revisão:{" "}
                            {formatBRL(r.snapshot.quote.total_value)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal PDF */}
      {pdfQuote && (
        <ProposalPdfModal
          proposal={buildPdfDataForQuote(pdfQuote)}
          onClose={() => setPdfQuote(null)}
        />
      )}
    </div>
  );
}
