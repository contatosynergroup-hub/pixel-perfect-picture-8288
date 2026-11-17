import { useMemo, useState, type FormEvent } from "react";
import { useGTSolar, type ClientRow } from "@/lib/gt-solar-store";
import {
  ESTADOS_BR,
  formatBRL,
  formatDateBR,
  QUOTE_MODALITY_META,
  QUOTE_STATUS_META,
  type ClientType,
} from "@/lib/calculators";
import {
  UserPlus,
  Search,
  Edit3,
  Trash2,
  FileText,
  PlusCircle,
  X,
  Phone,
  MapPin,
} from "lucide-react";

const CLIENT_TYPES: Array<{ value: ClientType; label: string }> = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "industrial", label: "Industrial" },
  { value: "rural", label: "Rural / Agronegócio" },
];

export function ClientsView() {
  const {
    clients,
    quotes,
    isAdmin,
    saveClient,
    deleteClient,
    startNewQuote,
    startEditQuote,
  } = useGTSolar();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const [clientType, setClientType] = useState<ClientType>("residencial");
  const [notes, setNotes] = useState("");

  // Modal de Histórico de Orçamentos do Cliente
  const [historyClient, setHistoryClient] = useState<ClientRow | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDocument("");
    setPhone("");
    setWhatsapp("");
    setEmail("");
    setCep("");
    setAddress("");
    setCity("");
    setState("SP");
    setClientType("residencial");
    setNotes("");
    setShowForm(false);
  };

  const handleEdit = (c: ClientRow) => {
    setEditingId(c.id);
    setName(c.name);
    setDocument(c.document || "");
    setPhone(c.phone || "");
    setWhatsapp(c.whatsapp || "");
    setEmail(c.email || "");
    setCep(c.cep || "");
    setAddress(c.address || "");
    setCity(c.city || "");
    setState(c.state || "SP");
    setClientType(c.client_type);
    setNotes(c.notes || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const saved = await saveClient({
      ...(editingId ? { id: editingId } : {}),
      name: name.trim(),
      document: document.trim() || null,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      cep: cep.trim() || null,
      address: address.trim() || null,
      city: city.trim() || null,
      state: state || "SP",
      client_type: clientType,
      notes: notes.trim() || null,
    });
    if (saved) resetForm();
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (typeFilter !== "all" && c.client_type !== typeFilter) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const match =
          c.name.toLowerCase().includes(term) ||
          (c.document || "").toLowerCase().includes(term) ||
          (c.city || "").toLowerCase().includes(term) ||
          (c.phone || "").toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [clients, typeFilter, search]);

  const quotesCountByClient = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of quotes) {
      if (q.client_id) {
        map.set(q.client_id, (map.get(q.client_id) ?? 0) + 1);
      }
    }
    return map;
  }, [quotes]);

  const clientQuotes = useMemo(() => {
    if (!historyClient) return [];
    return quotes.filter((q) => q.client_id === historyClient.id);
  }, [quotes, historyClient]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Cadastro e Histórico de Clientes
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie clientes residenciais, comerciais, industriais e rurais e
            consulte todas as propostas vinculadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Fechar Formulário" : "Novo Cliente"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? "Editar Dados do Cliente" : "Cadastrar Novo Cliente"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo ou Razão Social *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Condomínio Solar das Palmeiras / João Silva"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Cliente
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as ClientType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
              >
                {CLIENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone Fixo / Celular
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 0000-0000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(00) 90000-0000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com.br"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Complemento"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UF
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs bg-white"
                >
                  {ESTADOS_BR.map((st) => (
                    <option key={st.uf} value={st.uf}>
                      {st.uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Cliente / Padrão de Entrada
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informações adicionais, concessionária, horário de atendimento..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
            >
              {editingId ? "Salvar Alterações" : "Cadastrar Cliente"}
            </button>
          </div>
        </form>
      )}

      {/* Barra de Busca e Filtro */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, CPF/CNPJ, cidade, telefone ou e-mail..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
        >
          <option value="all">Todos os Perfis de Cliente</option>
          {CLIENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredClients.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <th className="py-3 px-4 font-semibold">
                    Nome / Razão Social
                  </th>
                  <th className="py-3 px-4 font-semibold">CPF / CNPJ</th>
                  <th className="py-3 px-4 font-semibold">Contato</th>
                  <th className="py-3 px-4 font-semibold">Cidade / UF</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Orçamentos
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClients.map((c) => {
                  const qCount = quotesCountByClient.get(c.id) ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        {c.email && (
                          <div className="text-[11px] text-slate-500">
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {c.document || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.whatsapp || c.phone || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {c.city || "—"}
                            {c.state ? `/${c.state}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {c.client_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setHistoryClient(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-[11px] hover:bg-orange-100 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          {qCount} proposta(s)
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            title="Criar Novo Orçamento para este Cliente"
                            onClick={() => startNewQuote({ clientId: c.id })}
                            className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Editar Cliente"
                            onClick={() => handleEdit(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              title="Excluir Cliente"
                              onClick={() => deleteClient(c.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Modal de Histórico de Orçamentos do Cliente */}
      {historyClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Histórico de Orçamentos — {historyClient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {historyClient.document || "Sem CPF/CNPJ"} •{" "}
                  {historyClient.city || ""}/{historyClient.state || ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryClient(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {clientQuotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Nenhum orçamento emitido para este cliente até o momento.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {clientQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {q.number} —{" "}
                        {QUOTE_MODALITY_META[q.modality].shortLabel}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Emitido em {formatDateBR(q.created_at)} •{" "}
                        {QUOTE_STATUS_META[q.status].label}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="text-sm text-slate-900">
                        {formatBRL(q.total_value)}
                      </strong>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryClient(null);
                          startEditQuote(q.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 cursor-pointer"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  const cid = historyClient.id;
                  setHistoryClient(null);
                  startNewQuote({ clientId: cid });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] text-white text-xs font-semibold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-orange-400" />
                Criar Novo Orçamento para {historyClient.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
