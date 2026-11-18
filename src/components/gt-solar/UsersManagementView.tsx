import { useMemo, useState, type FormEvent } from "react";
import { useGTSolar, type ProfileRow } from "@/lib/gt-solar-store";
import { formatBRL, type AppRole } from "@/lib/calculators";
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  Lock,
  User,
  Edit3,
  Check,
  X,
  Loader2,
} from "lucide-react";

export function UsersManagementView() {
  const {
    allProfiles,
    allUserRoles,
    quotes,
    isAdmin,
    createTeamUser,
    updateUserRoleAndStatus,
  } = useGTSolar();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("vendedor");

  // Edição inline de nome/telefone de um usuário existente
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const getUserRole = (userId: string): AppRole => {
    const hasAdmin = allUserRoles.some(
      (r) => r.user_id === userId && r.role === "admin",
    );
    return hasAdmin ? "admin" : "vendedor";
  };

  const statsBySeller = useMemo(() => {
    const map = new Map<string, { quotesCount: number; soldTotal: number }>();
    for (const q of quotes) {
      const curr = map.get(q.seller_id) ?? { quotesCount: 0, soldTotal: 0 };
      curr.quotesCount += 1;
      if (q.status === "aprovado") {
        curr.soldTotal += Number(q.total_value || 0);
      }
      map.set(q.seller_id, curr);
    }
    return map;
  }, [quotes]);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">
          Acesso restrito aos Administradores da GT Solar.
        </p>
      </div>
    );
  }

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || password.length < 6) return;
    setCreating(true);
    try {
      const ok = await createTeamUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: newRole,
      });
      if (ok) {
        setFullName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setNewRole("vendedor");
        setShowCreateForm(false);
      }
    } finally {
      setCreating(false);
    }
  };

  const startEditRow = (p: ProfileRow) => {
    setEditingProfileId(p.id);
    setEditName(p.full_name || "");
    setEditPhone(p.phone || "");
  };

  const saveEditRow = async (p: ProfileRow) => {
    const role = getUserRole(p.id);
    await updateUserRoleAndStatus(
      p.id,
      role,
      p.active,
      editName.trim() || p.full_name,
      editPhone.trim(),
    );
    setEditingProfileId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Gestão de Logins, Vendedores e Administradores
          </h2>
          <p className="text-xs text-slate-500">
            Cadastre novos vendedores e usuários da equipe, defina senhas de
            acesso, níveis de permissão e bloqueie/ative contas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showCreateForm
            ? "Fechar Cadastro"
            : "+ Cadastrar Vendedor / Usuário"}
        </button>
      </div>

      {/* Formulário de Cadastro de Novo Login pelo Administrador */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateUser}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Criar Novo Login de Acesso (Vendedor ou Administrador)
              </h3>
              <p className="text-xs text-slate-500">
                O colaborador poderá entrar imediatamente na tela de login com o
                e-mail e senha definidos abaixo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo do Vendedor / Usuário *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Rodrigo Almeida"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Login *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendedor@gtsolar.com.br"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha de Acesso (mín. 6) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 90000-0000"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-slate-600">
                Nível de Acesso:
              </span>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="userRole"
                  checked={newRole === "vendedor"}
                  onChange={() => setNewRole("vendedor")}
                />
                <UserCheck className="w-4 h-4 text-sky-600" />
                Vendedor Comercial
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="userRole"
                  checked={newRole === "admin"}
                  onChange={() => setNewRole("admin")}
                />
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Administrador Total
              </label>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cadastrando Login...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Criar Login de Usuário
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tabela de Usuários e Vendedores Cadastrados */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                <th className="py-3.5 px-4 font-semibold">
                  Nome do Colaborador
                </th>
                <th className="py-3.5 px-4 font-semibold">E-mail de Login</th>
                <th className="py-3.5 px-4 font-semibold">
                  Telefone / WhatsApp
                </th>
                <th className="py-3.5 px-4 font-semibold">Nível de Acesso</th>
                <th className="py-3.5 px-4 font-semibold text-center">
                  Orçamentos / Vendas
                </th>
                <th className="py-3.5 px-4 font-semibold text-center">
                  Status do Login
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allProfiles.map((p) => {
                const currentRole = getUserRole(p.id);
                const stats = statsBySeller.get(p.id) ?? {
                  quotesCount: 0,
                  soldTotal: 0,
                };
                const isEditing = editingProfileId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs w-full"
                        />
                      ) : (
                        p.full_name || "Colaborador"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {p.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs w-36"
                        />
                      ) : (
                        p.phone || "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-2">
                        {currentRole === "admin" ? (
                          <ShieldCheck className="w-4 h-4 text-orange-600" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-sky-600" />
                        )}
                        <select
                          value={currentRole}
                          onChange={(e) =>
                            updateUserRoleAndStatus(
                              p.id,
                              e.target.value as AppRole,
                              p.active,
                            )
                          }
                          className="rounded-lg border border-slate-300 px-2.5 py-1 font-semibold bg-white"
                        >
                          <option value="vendedor">Vendedor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800">
                        {stats.quotesCount} orç.
                      </span>{" "}
                      <span className="text-emerald-700 font-semibold">
                        ({formatBRL(stats.soldTotal)})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateUserRoleAndStatus(p.id, currentRole, !p.active)
                        }
                        className={`px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer ${
                          p.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {p.active ? "Ativo" : "Bloqueado"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveEditRow(p)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProfileId(null)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditRow(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                          title="Editar Nome e Telefone"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
