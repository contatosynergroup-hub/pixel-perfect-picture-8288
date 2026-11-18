import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient, type Session, type User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  DEFAULT_BOILER_PARAMS,
  DEFAULT_POOL_PARAMS,
  DEFAULT_PV_PARAMS,
  type AppRole,
  type BoilerSizingParams,
  type PhotovoltaicSizingParams,
  type PoolSizingParams,
  type QuoteItemDraft,
  type QuoteModality,
  type QuoteStatus,
} from "./calculators";
import { INITIAL_SOLAR_CATALOG_PRESETS } from "./catalog-presets";
import { toast } from "sonner";

export type ProfileRow = Tables<"profiles">;
export type UserRoleRow = Tables<"user_roles">;
export type ClientRow = Tables<"clients">;
export type ProductCategoryRow = Tables<"product_categories">;
export type ProductRow = Tables<"products">;
export type CompanySettingsRow = Tables<"company_settings">;
export type QuoteRow = Tables<"quotes">;
export type QuoteItemRow = Tables<"quote_items">;
export type QuoteRevisionRow = Tables<"quote_revisions">;
export type QuoteStatusHistoryRow = Tables<"quote_status_history">;

export type NavigationTab =
  | "dashboard"
  | "novo-orcamento"
  | "orcamentos"
  | "clientes"
  | "produtos"
  | "usuarios"
  | "configuracoes";

interface GTSolarContextValue {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  role: AppRole;
  isAdmin: boolean;
  authLoading: boolean;
  dataLoading: boolean;

  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Editing / viewing quote state
  editingQuoteId: string | null;
  preselectedClientId: string | null;
  preselectedModality: QuoteModality | null;
  startNewQuote: (options?: {
    clientId?: string | null;
    modality?: QuoteModality | null;
  }) => void;
  startEditQuote: (quoteId: string) => void;

  // Data collections
  clients: ClientRow[];
  categories: ProductCategoryRow[];
  products: ProductRow[];
  quotes: QuoteRow[];
  quoteItemsByQuoteId: Record<string, QuoteItemRow[]>;
  allProfiles: ProfileRow[];
  allUserRoles: UserRoleRow[];
  companySettings: CompanySettingsRow | null;
  pvParams: PhotovoltaicSizingParams;
  boilerParams: BoilerSizingParams;
  poolParams: PoolSizingParams;

  // Actions
  refreshAllData: () => Promise<void>;
  signOut: () => Promise<void>;

  // Client CRUD
  saveClient: (
    data: TablesInsert<"clients"> & { id?: string },
  ) => Promise<ClientRow | null>;
  deleteClient: (id: string) => Promise<boolean>;

  // Product & Category CRUD
  saveProduct: (
    data: TablesInsert<"products"> & { id?: string },
  ) => Promise<ProductRow | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateCategoryMargin: (
    categoryId: string,
    defaultMargin: number,
  ) => Promise<void>;
  seedInitialCatalog: () => Promise<void>;

  // Quote CRUD & workflow
  saveQuoteWithItems: (
    quoteData: TablesInsert<"quotes"> & { id?: string },
    items: QuoteItemDraft[],
    options?: { createRevision?: boolean },
  ) => Promise<QuoteRow | null>;
  updateQuoteStatus: (
    quoteId: string,
    status: QuoteStatus,
    options?: { lostReason?: string; nextContact?: string; note?: string },
  ) => Promise<boolean>;
  duplicateQuote: (quoteId: string) => Promise<QuoteRow | null>;
  deleteQuote: (quoteId: string) => Promise<boolean>;
  fetchQuoteHistoryAndRevisions: (quoteId: string) => Promise<{
    history: QuoteStatusHistoryRow[];
    revisions: QuoteRevisionRow[];
  }>;

  // Settings & Admin
  saveCompanySettings: (
    settings: TablesUpdate<"company_settings">,
  ) => Promise<void>;
  saveSizingParameters: (
    modality: QuoteModality,
    params: Record<string, number>,
  ) => Promise<void>;
  createTeamUser: (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role: AppRole;
  }) => Promise<boolean>;
  updateUserRoleAndStatus: (
    targetUserId: string,
    newRole: AppRole,
    active: boolean,
    fullName?: string,
    phone?: string,
  ) => Promise<void>;
}

const GTSolarContext = createContext<GTSolarContextValue | null>(null);

export function GTSolarProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [role, setRole] = useState<AppRole>("vendedor");
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [preselectedClientId, setPreselectedClientId] = useState<string | null>(
    null,
  );
  const [preselectedModality, setPreselectedModality] =
    useState<QuoteModality | null>(null);

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [categories, setCategories] = useState<ProductCategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [quoteItemsByQuoteId, setQuoteItemsByQuoteId] = useState<
    Record<string, QuoteItemRow[]>
  >({});
  const [allProfiles, setAllProfiles] = useState<ProfileRow[]>([]);
  const [allUserRoles, setAllUserRoles] = useState<UserRoleRow[]>([]);
  const [companySettings, setCompanySettings] =
    useState<CompanySettingsRow | null>(null);

  const [pvParams, setPvParams] =
    useState<PhotovoltaicSizingParams>(DEFAULT_PV_PARAMS);
  const [boilerParams, setBoilerParams] =
    useState<BoilerSizingParams>(DEFAULT_BOILER_PARAMS);
  const [poolParams, setPoolParams] =
    useState<PoolSizingParams>(DEFAULT_POOL_PARAMS);

  const loadUserProfileAndRole = useCallback(async (currentUser: User) => {
    try {
      const [{ data: profData }, { data: rolesData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle(),
        supabase.from("user_roles").select("*").eq("user_id", currentUser.id),
      ]);

      if (profData) {
        setProfile(profData);
      } else {
        const fallbackName =
          (currentUser.user_metadata?.full_name as string) ||
          currentUser.email?.split("@")[0] ||
          "Usuário GT Solar";
        const { data: insertedProf } = await supabase
          .from("profiles")
          .upsert({
            id: currentUser.id,
            full_name: fallbackName,
            email: currentUser.email ?? null,
          })
          .select("*")
          .maybeSingle();
        if (insertedProf) setProfile(insertedProf);
      }

      const hasAdmin = (rolesData ?? []).some((r) => r.role === "admin");
      setRole(hasAdmin ? "admin" : "vendedor");
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [
        clientsRes,
        catRes,
        prodRes,
        quotesRes,
        itemsRes,
        compRes,
        sizingRes,
        profilesRes,
        rolesRes,
      ] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("product_categories")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .order("description", { ascending: true }),
        supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("quote_items")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase.from("company_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("sizing_parameters").select("*"),
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase.from("user_roles").select("*"),
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (quotesRes.data) setQuotes(quotesRes.data);

      if (itemsRes.data) {
        const grouped: Record<string, QuoteItemRow[]> = {};
        for (const item of itemsRes.data) {
          if (!grouped[item.quote_id]) grouped[item.quote_id] = [];
          grouped[item.quote_id].push(item);
        }
        setQuoteItemsByQuoteId(grouped);
      }

      if (compRes.data) setCompanySettings(compRes.data);
      if (profilesRes.data) setAllProfiles(profilesRes.data);
      if (rolesRes.data) setAllUserRoles(rolesRes.data);

      if (sizingRes.data) {
        for (const row of sizingRes.data) {
          const p = (row.params as Record<string, number>) || {};
          if (row.modality === "fotovoltaico") {
            setPvParams({ ...DEFAULT_PV_PARAMS, ...p });
          } else if (row.modality === "boiler") {
            setBoilerParams({ ...DEFAULT_BOILER_PARAMS, ...p });
          } else if (row.modality === "piscina") {
            setPoolParams({ ...DEFAULT_POOL_PARAMS, ...p });
          }
        }
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          loadUserProfileAndRole(initialSession.user).finally(() => {
            if (mounted) setAuthLoading(false);
          });
        } else {
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserProfileAndRole(newSession.user);
      } else {
        setProfile(null);
        setRole("vendedor");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfileAndRole]);

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user, refreshAllData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada com sucesso.");
  };

  const startNewQuote = (options?: {
    clientId?: string | null;
    modality?: QuoteModality | null;
  }) => {
    setEditingQuoteId(null);
    setPreselectedClientId(options?.clientId ?? null);
    setPreselectedModality(options?.modality ?? null);
    setActiveTab("novo-orcamento");
  };

  const startEditQuote = (quoteId: string) => {
    setEditingQuoteId(quoteId);
    setPreselectedClientId(null);
    setPreselectedModality(null);
    setActiveTab("novo-orcamento");
  };

  const saveClient = async (
    data: TablesInsert<"clients"> & { id?: string },
  ): Promise<ClientRow | null> => {
    if (!user) return null;
    try {
      if (data.id) {
        const { id, ...updatePayload } = data;
        const { data: updated, error } = await supabase
          .from("clients")
          .update(updatePayload)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        setClients((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
        toast.success("Cliente atualizado com sucesso!");
        return updated;
      } else {
        const { data: inserted, error } = await supabase
          .from("clients")
          .insert({ ...data, owner_id: user.id })
          .select("*")
          .single();
        if (error) throw error;
        setClients((prev) => [inserted, ...prev]);
        toast.success("Cliente cadastrado com sucesso!");
        return inserted;
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar cliente.");
      return null;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente removido.");
      return true;
    } catch (err: any) {
      toast.error(
        err?.message ||
          "Apenas administradores podem excluir clientes do cadastro.",
      );
      return false;
    }
  };

  const saveProduct = async (
    data: TablesInsert<"products"> & { id?: string },
  ): Promise<ProductRow | null> => {
    try {
      if (data.id) {
        const { id, ...updatePayload } = data;
        const { data: updated, error } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        toast.success("Produto atualizado no catálogo!");
        return updated;
      } else {
        const { data: inserted, error } = await supabase
          .from("products")
          .insert(data)
          .select("*")
          .single();
        if (error) throw error;
        setProducts((prev) => [...prev, inserted]);
        toast.success("Produto adicionado ao catálogo!");
        return inserted;
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar produto.");
      return null;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto excluído do catálogo.");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir produto.");
      return false;
    }
  };

  const updateCategoryMargin = async (
    categoryId: string,
    defaultMargin: number,
  ) => {
    try {
      const { data: updated, error } = await supabase
        .from("product_categories")
        .update({ default_margin: defaultMargin })
        .eq("id", categoryId)
        .select("*")
        .single();
      if (error) throw error;
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? updated : c)),
      );
      toast.success(`Margem da categoria ${updated.name} atualizada!`);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar margem da categoria.");
    }
  };

  const seedInitialCatalog = async () => {
    try {
      const slugToId = new Map<string, string>();
      for (const cat of categories) {
        slugToId.set(cat.slug, cat.id);
      }

      const payload: TablesInsert<"products">[] =
        INITIAL_SOLAR_CATALOG_PRESETS.map((preset) => ({
          code: preset.code,
          category_id: slugToId.get(preset.category_slug) ?? null,
          manufacturer: preset.manufacturer,
          model: preset.model,
          description: preset.description,
          unit: preset.unit,
          cost_price: preset.cost_price,
          sale_price: preset.sale_price,
          supplier: preset.supplier,
          specs: preset.specs,
          active: true,
        }));

      const { data: inserted, error } = await supabase
        .from("products")
        .insert(payload)
        .select("*");
      if (error) throw error;
      if (inserted) {
        setProducts((prev) => [...prev, ...inserted]);
      }
      toast.success(
        `${inserted?.length ?? 0} produtos solares de referência importados para o catálogo!`,
      );
    } catch (err: any) {
      toast.error(err?.message || "Erro ao importar kit inicial de produtos.");
    }
  };

  const saveQuoteWithItems = async (
    quoteData: TablesInsert<"quotes"> & { id?: string },
    items: QuoteItemDraft[],
    options?: { createRevision?: boolean },
  ): Promise<QuoteRow | null> => {
    if (!user) return null;
    try {
      let savedQuote: QuoteRow;

      if (quoteData.id) {
        const existing = quotes.find((q) => q.id === quoteData.id);
        const nextRevision = options?.createRevision
          ? (existing?.revision ?? 0) + 1
          : (quoteData.revision ?? existing?.revision ?? 0);

        if (options?.createRevision && existing) {
          const oldItems = quoteItemsByQuoteId[existing.id] ?? [];
          await supabase.from("quote_revisions").insert({
            quote_id: existing.id,
            revision: existing.revision,
            created_by: user.id,
            snapshot: {
              quote: existing,
              items: oldItems,
              saved_at: new Date().toISOString(),
            } as any,
          });
        }

        const { id, ...updatePayload } = quoteData;
        const { data: updated, error } = await supabase
          .from("quotes")
          .update({
            ...updatePayload,
            revision: nextRevision,
          })
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        savedQuote = updated;

        await supabase
          .from("quote_items")
          .delete()
          .eq("quote_id", savedQuote.id);
      } else {
        const { data: inserted, error } = await supabase
          .from("quotes")
          .insert({
            ...quoteData,
            seller_id: user.id,
          })
          .select("*")
          .single();
        if (error) throw error;
        savedQuote = inserted;
      }

      let savedItems: QuoteItemRow[] = [];
      if (items.length > 0) {
        const itemsPayload: TablesInsert<"quote_items">[] = items.map(
          (item, index) => ({
            quote_id: savedQuote.id,
            product_id: item.product_id || null,
            description: item.description,
            category_slug: item.category_slug || null,
            unit: item.unit || "un",
            quantity: Number(item.quantity) || 1,
            unit_cost: Number(item.unit_cost) || 0,
            unit_price: Number(item.unit_price) || 0,
            sort_order: index + 1,
          }),
        );
        const { data: insItems, error: itemsErr } = await supabase
          .from("quote_items")
          .insert(itemsPayload)
          .select("*");
        if (itemsErr) throw itemsErr;
        savedItems = insItems ?? [];
      }

      setQuotes((prev) => {
        const exists = prev.some((q) => q.id === savedQuote.id);
        return exists
          ? prev.map((q) => (q.id === savedQuote.id ? savedQuote : q))
          : [savedQuote, ...prev];
      });
      setQuoteItemsByQuoteId((prev) => ({
        ...prev,
        [savedQuote.id]: savedItems,
      }));

      toast.success(
        options?.createRevision
          ? `Orçamento ${savedQuote.number} salvo com nova revisão (Rev. ${savedQuote.revision})!`
          : `Orçamento ${savedQuote.number} salvo com sucesso!`,
      );
      return savedQuote;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar orçamento.");
      return null;
    }
  };

  const updateQuoteStatus = async (
    quoteId: string,
    status: QuoteStatus,
    options?: { lostReason?: string; nextContact?: string; note?: string },
  ): Promise<boolean> => {
    try {
      const updatePayload: TablesUpdate<"quotes"> = {
        status,
        ...(options?.lostReason !== undefined
          ? { lost_reason: options.lostReason }
          : {}),
        ...(options?.nextContact !== undefined
          ? { next_contact: options.nextContact || null }
          : {}),
        ...(status === "aprovado" ? { sold_at: new Date().toISOString() } : {}),
      };

      const { data: updated, error } = await supabase
        .from("quotes")
        .update(updatePayload)
        .eq("id", quoteId)
        .select("*")
        .single();
      if (error) throw error;

      if (options?.note && user) {
        await supabase.from("quote_status_history").insert({
          quote_id: quoteId,
          status,
          note: options.note,
          changed_by: user.id,
        });
      }

      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? updated : q)),
      );
      toast.success(
        status === "aprovado"
          ? `Orçamento ${updated.number} aprovado e convertido em venda!`
          : `Status do orçamento ${updated.number} atualizado!`,
      );
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar status do orçamento.");
      return false;
    }
  };

  const duplicateQuote = async (quoteId: string): Promise<QuoteRow | null> => {
    if (!user) return null;
    const source = quotes.find((q) => q.id === quoteId);
    if (!source) return null;
    const sourceItems = quoteItemsByQuoteId[quoteId] ?? [];

    try {
      const validityDays = companySettings?.default_validity_days ?? 15;
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + validityDays);

      const { data: duplicated, error } = await supabase
        .from("quotes")
        .insert({
          seller_id: user.id,
          client_id: source.client_id,
          modality: source.modality,
          status: "rascunho",
          title: `${source.title || "Proposta GT Solar"} (Cópia)`,
          sizing_input: source.sizing_input,
          sizing_result: source.sizing_result,
          labor_cost: source.labor_cost,
          travel_cost: source.travel_cost,
          freight_cost: source.freight_cost,
          extra_cost: source.extra_cost,
          tax_pct: source.tax_pct,
          margin_pct: source.margin_pct,
          discount: source.discount,
          total_cost: source.total_cost,
          total_value: source.total_value,
          payment_terms: source.payment_terms,
          execution_days: source.execution_days,
          notes: source.notes,
          valid_until: validUntilDate.toISOString().slice(0, 10),
          revision: 0,
        })
        .select("*")
        .single();
      if (error) throw error;

      let newItems: QuoteItemRow[] = [];
      if (sourceItems.length > 0) {
        const { data: insItems } = await supabase
          .from("quote_items")
          .insert(
            sourceItems.map((it, idx) => ({
              quote_id: duplicated.id,
              product_id: it.product_id,
              description: it.description,
              category_slug: it.category_slug,
              unit: it.unit,
              quantity: it.quantity,
              unit_cost: it.unit_cost,
              unit_price: it.unit_price,
              sort_order: idx + 1,
            })),
          )
          .select("*");
        newItems = insItems ?? [];
      }

      setQuotes((prev) => [duplicated, ...prev]);
      setQuoteItemsByQuoteId((prev) => ({
        ...prev,
        [duplicated.id]: newItems,
      }));
      toast.success(`Orçamento duplicado como ${duplicated.number}!`);
      return duplicated;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao duplicar orçamento.");
      return null;
    }
  };

  const deleteQuote = async (quoteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId);
      if (error) throw error;
      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      toast.success("Orçamento excluído.");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir orçamento.");
      return false;
    }
  };

  const fetchQuoteHistoryAndRevisions = async (quoteId: string) => {
    const [histRes, revRes] = await Promise.all([
      supabase
        .from("quote_status_history")
        .select("*")
        .eq("quote_id", quoteId)
        .order("created_at", { ascending: false }),
      supabase
        .from("quote_revisions")
        .select("*")
        .eq("quote_id", quoteId)
        .order("revision", { ascending: false }),
    ]);
    return {
      history: histRes.data ?? [],
      revisions: revRes.data ?? [],
    };
  };

  const saveCompanySettings = async (
    settings: TablesUpdate<"company_settings">,
  ) => {
    try {
      const { data: updated, error } = await supabase
        .from("company_settings")
        .upsert({ id: 1, ...settings })
        .select("*")
        .single();
      if (error) throw error;
      setCompanySettings(updated);
      toast.success("Configurações da GT Solar salvas com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar configurações da empresa.");
    }
  };

  const saveSizingParameters = async (
    modality: QuoteModality,
    params: Record<string, number>,
  ) => {
    try {
      const { error } = await supabase.from("sizing_parameters").upsert({
        modality,
        params: params as any,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      if (modality === "fotovoltaico") {
        setPvParams((prev) => ({ ...prev, ...params }));
      } else if (modality === "boiler") {
        setBoilerParams((prev) => ({ ...prev, ...params }));
      } else if (modality === "piscina") {
        setPoolParams((prev) => ({ ...prev, ...params }));
      }
      toast.success("Parâmetros técnicos atualizados com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar parâmetros técnicos.");
    }
  };

  const createTeamUser = async (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role: AppRole;
  }): Promise<boolean> => {
    try {
      const supabaseUrl =
        import.meta.env["VITE_SUPABASE_URL"] ||
        "https://c--f846d2c8-6339-4be0-9661-77343b8a9b13-prod.lovable.cloud";
      const supabaseKey =
        import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
        "sb_publishable_2jRKp1XJV1JGaPhQ4HaPPw_1Jl9DdjH";

      const isolatedClient = createClient<Database>(supabaseUrl, supabaseKey, {
        global: {
          fetch: (urlInput, init) => {
            const headers = new Headers(init?.headers);
            if (
              (supabaseKey.startsWith("sb_publishable_") ||
                supabaseKey.startsWith("sb_secret_")) &&
              headers.get("Authorization") === `Bearer ${supabaseKey}`
            ) {
              headers.delete("Authorization");
            }
            headers.set("apikey", supabaseKey);
            return fetch(urlInput, { ...init, headers });
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: "gt-solar-admin-temp-signup",
        },
      });

      const { data, error } = await isolatedClient.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: {
            full_name: input.fullName.trim(),
            phone: input.phone?.trim() || "",
          },
        },
      });

      if (error) throw error;

      const createdUserId = data.user?.id;
      if (createdUserId) {
        // Atualiza telefone/nome no perfil criado pelo trigger e define o papel escolhido pelo Admin
        await supabase
          .from("profiles")
          .update({
            full_name: input.fullName.trim(),
            email: input.email.trim(),
            phone: input.phone?.trim() || null,
            active: true,
          })
          .eq("id", createdUserId);

        if (input.role === "admin") {
          await supabase.from("user_roles").delete().eq("user_id", createdUserId);
          await supabase
            .from("user_roles")
            .insert({ user_id: createdUserId, role: "admin" });
        }
      }

      await refreshAllData();
      toast.success(
        `Usuário ${input.fullName.trim()} (${input.role === "admin" ? "Administrador" : "Vendedor"}) cadastrado com sucesso!`,
      );
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao cadastrar novo usuário.");
      return false;
    }
  };

  const updateUserRoleAndStatus = async (
    targetUserId: string,
    newRole: AppRole,
    active: boolean,
    fullName?: string,
    phone?: string,
  ) => {
    try {
      const profileUpdate: TablesUpdate<"profiles"> = { active };
      if (fullName !== undefined) profileUpdate.full_name = fullName;
      if (phone !== undefined) profileUpdate.phone = phone;

      const { error: profErr } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", targetUserId);
      if (profErr) throw profErr;

      // Update roles: remove opposite role and ensure newRole exists
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId);
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role: newRole });
      if (roleErr) throw roleErr;

      await refreshAllData();
      if (user && targetUserId === user.id) {
        setRole(newRole);
      }
      toast.success("Dados e permissões do usuário atualizados!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar usuário.");
    }
  };

  return (
    <GTSolarContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isAdmin: role === "admin",
        authLoading,
        dataLoading,
        activeTab,
        setActiveTab,
        editingQuoteId,
        preselectedClientId,
        preselectedModality,
        startNewQuote,
        startEditQuote,
        clients,
        categories,
        products,
        quotes,
        quoteItemsByQuoteId,
        allProfiles,
        allUserRoles,
        companySettings,
        pvParams,
        boilerParams,
        poolParams,
        refreshAllData,
        signOut,
        saveClient,
        deleteClient,
        saveProduct,
        deleteProduct,
        updateCategoryMargin,
        seedInitialCatalog,
        saveQuoteWithItems,
        updateQuoteStatus,
        duplicateQuote,
        deleteQuote,
        fetchQuoteHistoryAndRevisions,
        saveCompanySettings,
        saveSizingParameters,
        createTeamUser,
        updateUserRoleAndStatus,
      }}
    >
      {children}
    </GTSolarContext.Provider>
  );
}

export function useGTSolar() {
  const ctx = useContext(GTSolarContext);
  if (!ctx) {
    throw new Error("useGTSolar must be used within a GTSolarProvider");
  }
  return ctx;
}
