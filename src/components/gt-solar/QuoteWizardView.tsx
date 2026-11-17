import { useEffect, useMemo, useState } from "react";
import { useGTSolar } from "@/lib/gt-solar-store";
import {
  calculateBoiler,
  calculateCommercialPricing,
  calculatePhotovoltaic,
  calculatePool,
  CONCESSIONARIAS_BR,
  ESTADOS_BR,
  formatBRL,
  formatNumber,
  PRODUCT_CATEGORIES_META,
  QUOTE_MODALITY_META,
  QUOTE_STATUS_META,
  STANDARD_BOILER_VOLUMES_L,
  TIPOS_INSTALACAO_FV,
  TIPOS_TELHADO,
  type BoilerInput,
  type PhotovoltaicInput,
  type PoolInput,
  type QuoteItemDraft,
  type QuoteModality,
  type QuoteStatus,
} from "@/lib/calculators";
import { ProposalPdfModal, type ProposalPdfData } from "./ProposalPdfModal";
import { toast } from "sonner";
import {
  Sun,
  Flame,
  Waves,
  FileSignature,
  UserPlus,
  Check,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Package,
  DollarSign,
  FileCheck,
  Printer,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  History,
} from "lucide-react";

const WIZARD_STEPS = [
  { id: 1, label: "1. Cliente" },
  { id: 2, label: "2. Modalidade" },
  { id: 3, label: "3. Dimensionar" },
  { id: 4, label: "4. Equipamentos" },
  { id: 5, label: "5. Preços & Margem" },
  { id: 6, label: "6. Revisar & PDF" },
] as const;

export function QuoteWizardView() {
  const {
    clients,
    products,
    categories,
    quotes,
    quoteItemsByQuoteId,
    companySettings,
    pvParams,
    boilerParams,
    poolParams,
    profile,
    user,
    isAdmin,
    editingQuoteId,
    preselectedClientId,
    preselectedModality,
    saveClient,
    saveQuoteWithItems,
    setActiveTab,
  } = useGTSolar();

  const existingQuote = useMemo(
    () => (editingQuoteId ? quotes.find((q) => q.id === editingQuoteId) : null),
    [editingQuoteId, quotes],
  );

  const [step, setStep] = useState<number>(1);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [modality, setModality] = useState<QuoteModality>("fotovoltaico");
  const [status, setStatus] = useState<QuoteStatus>("rascunho");
  const [title, setTitle] = useState<string>("");

  // Quick client creation inside wizard
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [quickClientName, setQuickClientName] = useState("");
  const [quickClientDoc, setQuickClientDoc] = useState("");
  const [quickClientPhone, setQuickClientPhone] = useState("");
  const [quickClientCity, setQuickClientCity] = useState("São Paulo");
  const [quickClientState, setQuickClientState] = useState("SP");

  // 1. Inputs Fotovoltaico
  const [pvInput, setPvInput] = useState<PhotovoltaicInput>({
    consumoMensalKwh: 650,
    valorMedioConta: 620,
    cidade: "São Paulo",
    estado: "SP",
    concessionaria: "CPFL Paulista",
    tipoInstalacao: "bifasico",
    tipoTelhado: "ceramico",
    potenciaModuloW: 550,
    quantidadeModulosManual: undefined,
    potenciaInversorManualKw: undefined,
    irradiacaoSolarMedia: 4.9,
    perdasSistemaPct: pvParams.perdas_pct || 20,
    tarifaEnergia: 0.92,
    custoDisponibilidadeKwh: 50,
    encargosNaoCompensaveisPct: 12,
    taxaIluminacaoPublicaR$: 35,
    compensacaoDesejadaPct: pvParams.compensacao_pct || 95,
    areaPorModuloM2: pvParams.area_por_modulo_m2 || 2.6,
  });

  // 2. Inputs Boiler
  const [boilerInput, setBoilerInput] = useState<BoilerInput>({
    moradores: 4,
    banheiros: 3,
    chuveiros: 3,
    pontosAguaQuente: 6,
    consumoLitrosPessoaDia: boilerParams.litros_por_pessoa || 50,
    temperaturaDesejadaC: 48,
    temperaturaEntradaC: 20,
    capacidadeBoilerManualL: undefined,
    tipoInstalacao: "termossifao",
    tipoApoioTermico: "eletrico",
    cidade: "São Paulo",
    estado: "SP",
    irradiacaoKwhM2Dia: boilerParams.irradiacao_kwh_m2_dia || 4.5,
    eficienciaColetorPct: boilerParams.eficiencia_coletor_pct || 55,
    areaColetorUnitarioM2: boilerParams.area_coletor_m2 || 2.0,
  });
  const [boilerCollectorManualQty, setBoilerCollectorManualQty] = useState<
    number | undefined
  >(undefined);

  // 3. Inputs Piscina
  const [poolInput, setPoolInput] = useState<PoolInput>({
    comprimentoM: 8,
    larguraM: 4,
    profundidadeMediaM: 1.4,
    volumeManualM3: undefined,
    cidade: "São Paulo",
    estado: "SP",
    ambiente: "aberta",
    usoCapaTermica: true,
    exposicaoVento: "media",
    temperaturaDesejadaC: 29,
    temperaturaInicialC: 21,
    periodoUtilizacao: "ano_todo",
    tipoAquecimento: "solar",
    areaDisponivelColetoresM2: 35,
    areaColetorUnitarioM2: poolParams.area_coletor_m2 || 3.3,
    razaoBaseAreaColetor: poolParams.razao_area_coletor || 0.85,
    perdaDiariaAbertaC: poolParams.perda_diaria_c_aberta || 2.2,
    perdaDiariaComCapaC: poolParams.perda_diaria_c_capa || 1.0,
  });
  const [poolCollectorManualQty, setPoolCollectorManualQty] = useState<
    number | undefined
  >(undefined);

  // 4. Itens de Equipamentos e Serviços
  const [items, setItems] = useState<QuoteItemDraft[]>([]);
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] =
    useState<string>("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualCatSlug, setManualCatSlug] = useState("modulos");
  const [manualUnit, setManualUnit] = useState("un");
  const [manualQty, setManualQty] = useState(1);
  const [manualCost, setManualCost] = useState(0);
  const [manualPrice, setManualPrice] = useState(0);

  // 5. Precificação e Condições Comerciais
  const [laborCost, setLaborCost] = useState<number>(1800);
  const [travelCost, setTravelCost] = useState<number>(250);
  const [freightCost, setFreightCost] = useState<number>(350);
  const [extraCost, setExtraCost] = useState<number>(0);
  const [taxPct, setTaxPct] = useState<number>(8);
  const [marginPct, setMarginPct] = useState<number>(22);
  const [pricingMode, setPricingMode] = useState<
    "margin_on_sale" | "markup_on_cost"
  >("margin_on_sale");
  const [discount, setDiscount] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>(
    companySettings?.payment_terms ||
      "À vista com 5% de desconto, PIX ou financiamento solar em até 60x.",
  );
  const [executionDays, setExecutionDays] = useState<number>(20);
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + (companySettings?.default_validity_days ?? 15));
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState<string>("");
  const [nextContact, setNextContact] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Carregar dados caso esteja editando ou com cliente/modalidade pré-selecionados
  useEffect(() => {
    if (existingQuote) {
      setSelectedClientId(existingQuote.client_id || "");
      setModality(existingQuote.modality);
      setStatus(existingQuote.status);
      setTitle(existingQuote.title || "");
      setLaborCost(Number(existingQuote.labor_cost || 0));
      setTravelCost(Number(existingQuote.travel_cost || 0));
      setFreightCost(Number(existingQuote.freight_cost || 0));
      setExtraCost(Number(existingQuote.extra_cost || 0));
      setTaxPct(Number(existingQuote.tax_pct || 0));
      setMarginPct(Number(existingQuote.margin_pct || 0));
      setDiscount(Number(existingQuote.discount || 0));
      setPaymentTerms(
        existingQuote.payment_terms ||
          companySettings?.payment_terms ||
          "À vista ou financiamento em até 60x.",
      );
      setExecutionDays(existingQuote.execution_days ?? 20);
      if (existingQuote.valid_until) setValidUntil(existingQuote.valid_until);
      setNotes(existingQuote.notes || "");
      setNextContact(existingQuote.next_contact || "");

      const savedInput = (existingQuote.sizing_input as Record<string, any>) || {};
      if (existingQuote.modality === "fotovoltaico" && savedInput.consumoMensalKwh) {
        setPvInput((prev) => ({ ...prev, ...savedInput }));
      } else if (existingQuote.modality === "boiler" && savedInput.moradores) {
        setBoilerInput((prev) => ({ ...prev, ...savedInput }));
      } else if (existingQuote.modality === "piscina" && savedInput.comprimentoM) {
        setPoolInput((prev) => ({ ...prev, ...savedInput }));
      }

      const existingItems = quoteItemsByQuoteId[existingQuote.id] ?? [];
      setItems(
        existingItems.map((it, idx) => ({
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
      );
    } else {
      if (preselectedClientId) setSelectedClientId(preselectedClientId);
      if (preselectedModality) setModality(preselectedModality);
    }
  }, [
    existingQuote,
    preselectedClientId,
    preselectedModality,
    quoteItemsByQuoteId,
    companySettings,
  ]);

  // Sincronizar cidade/UF do cliente selecionado
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  useEffect(() => {
    if (selectedClient && !existingQuote) {
      const uf = selectedClient.state || "SP";
      const city = selectedClient.city || "São Paulo";
      const estadoInfo = ESTADOS_BR.find((e) => e.uf === uf);
      const irr = estadoInfo?.irradiacaoMedia ?? 4.9;

      setPvInput((prev) => ({
        ...prev,
        cidade: city,
        estado: uf,
        irradiacaoSolarMedia: irr,
      }));
      setBoilerInput((prev) => ({
        ...prev,
        cidade: city,
        estado: uf,
      }));
      setPoolInput((prev) => ({
        ...prev,
        cidade: city,
        estado: uf,
      }));
    }
  }, [selectedClient, existingQuote]);

  // Cálculos comerciais e técnicos em tempo real
  const pricingResult = useMemo(
    () =>
      calculateCommercialPricing({
        items,
        laborCost,
        travelCost,
        freightCost,
        extraCost,
        taxPct,
        marginPct,
        pricingMode,
        discount,
      }),
    [
      items,
      laborCost,
      travelCost,
      freightCost,
      extraCost,
      taxPct,
      marginPct,
      pricingMode,
      discount,
    ],
  );

  const pvResult = useMemo(
    () => calculatePhotovoltaic(pvInput, pricingResult.valorFinal),
    [pvInput, pricingResult.valorFinal],
  );

  const boilerResult = useMemo(
    () => calculateBoiler(boilerInput, boilerCollectorManualQty),
    [boilerInput, boilerCollectorManualQty],
  );

  const poolResult = useMemo(
    () => calculatePool(poolInput, poolCollectorManualQty),
    [poolInput, poolCollectorManualQty],
  );

  const categoryIdToSlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.slug);
    return map;
  }, [categories]);

  // Sugerir automaticamente equipamentos com base no dimensionamento!
  const handleAutoPopulateEquipment = () => {
    const generated: QuoteItemDraft[] = [];

    if (modality === "fotovoltaico") {
      const modProduct = products.find(
        (p) =>
          p.active && categoryIdToSlug.get(p.category_id || "") === "modulos",
      );
      const invProduct = products.find(
        (p) =>
          p.active &&
          categoryIdToSlug.get(p.category_id || "") === "inversores",
      );
      const estProduct = products.find(
        (p) =>
          p.active &&
          categoryIdToSlug.get(p.category_id || "") === "estruturas",
      );
      const cabProduct = products.find(
        (p) =>
          p.active && categoryIdToSlug.get(p.category_id || "") === "cabos",
      );
      const protProduct = products.find(
        (p) =>
          p.active && categoryIdToSlug.get(p.category_id || "") === "protecoes",
      );

      generated.push({
        id: crypto.randomUUID(),
        product_id: modProduct?.id ?? null,
        description:
          modProduct?.description ||
          `Módulo Solar Fotovoltaico Monocristalino ${pvInput.potenciaModuloW}W`,
        category_slug: "modulos",
        unit: "un",
        quantity: pvResult.quantidadeModulos,
        unit_cost: modProduct ? Number(modProduct.cost_price) : 520,
        unit_price: modProduct ? Number(modProduct.sale_price) : 690,
        sort_order: 1,
      });

      generated.push({
        id: crypto.randomUUID(),
        product_id: invProduct?.id ?? null,
        description:
          invProduct?.description ||
          `Inversor Solar On-Grid ${pvResult.potenciaInversorSelecionadaKw} kW (${pvInput.tipoInstalacao})`,
        category_slug: "inversores",
        unit: "un",
        quantity: 1,
        unit_cost: invProduct
          ? Number(invProduct.cost_price)
          : Math.round(pvResult.potenciaInversorSelecionadaKw * 480),
        unit_price: invProduct
          ? Number(invProduct.sale_price)
          : Math.round(pvResult.potenciaInversorSelecionadaKw * 650),
        sort_order: 2,
      });

      const kitsEstrutura = Math.max(1, Math.ceil(pvResult.quantidadeModulos / 4));
      generated.push({
        id: crypto.randomUUID(),
        product_id: estProduct?.id ?? null,
        description:
          estProduct?.description ||
          `Kit Estrutura de Fixação em Alumínio/Inox (${pvInput.tipoTelhado}) p/ 4 Módulos`,
        category_slug: "estruturas",
        unit: "kit",
        quantity: kitsEstrutura,
        unit_cost: estProduct ? Number(estProduct.cost_price) : 380,
        unit_price: estProduct ? Number(estProduct.sale_price) : 540,
        sort_order: 3,
      });

      generated.push({
        id: crypto.randomUUID(),
        product_id: cabProduct?.id ?? null,
        description:
          cabProduct?.description ||
          "Kit Cabos Solares 6mm² 1.8kV CC Preto/Vermelho + Conectores MC4",
        category_slug: "cabos",
        unit: "kit",
        quantity: 1,
        unit_cost: cabProduct ? Number(cabProduct.cost_price) : 360,
        unit_price: cabProduct ? Number(cabProduct.sale_price) : 510,
        sort_order: 4,
      });

      generated.push({
        id: crypto.randomUUID(),
        product_id: protProduct?.id ?? null,
        description:
          protProduct?.description ||
          "Quadro de Proteção String Box CC/CA com DPS e Disjuntores",
        category_slug: "protecoes",
        unit: "un",
        quantity: 1,
        unit_cost: protProduct ? Number(protProduct.cost_price) : 420,
        unit_price: protProduct ? Number(protProduct.sale_price) : 620,
        sort_order: 5,
      });
    } else if (modality === "boiler") {
      const boilerProd = products.find(
        (p) =>
          p.active && categoryIdToSlug.get(p.category_id || "") === "boilers",
      );
      const colAguaProd = products.find(
        (p) =>
          p.active &&
          categoryIdToSlug.get(p.category_id || "") === "coletores_agua",
      );

      generated.push({
        id: crypto.randomUUID(),
        product_id: boilerProd?.id ?? null,
        description: `Reservatório Térmico (Boiler) Aço Inox ${boilerResult.volumeSelecionadoBoilerL}L (${
          boilerInput.tipoInstalacao === "pressurizado"
            ? "Alta Pressão"
            : "Baixa Pressão"
        })`,
        category_slug: "boilers",
        unit: "un",
        quantity: 1,
        unit_cost: boilerProd
          ? Number(boilerProd.cost_price)
          : Math.round(boilerResult.volumeSelecionadoBoilerL * 7.8),
        unit_price: boilerProd
          ? Number(boilerProd.sale_price)
          : Math.round(boilerResult.volumeSelecionadoBoilerL * 10.9),
        sort_order: 1,
      });

      generated.push({
        id: crypto.randomUUID(),
        product_id: colAguaProd?.id ?? null,
        description:
          colAguaProd?.description ||
          `Coletor Solar Placa Plana Vidro Temperado ${boilerInput.areaColetorUnitarioM2.toFixed(1)}m² Inmetro A`,
        category_slug: "coletores_agua",
        unit: "un",
        quantity: boilerResult.quantidadeColetoresSelecionada,
        unit_cost: colAguaProd ? Number(colAguaProd.cost_price) : 890,
        unit_price: colAguaProd ? Number(colAguaProd.sale_price) : 1290,
        sort_order: 2,
      });

      generated.push({
        id: crypto.randomUUID(),
        product_id: null,
        description:
          "Kit Hidráulico Térmico (Válvula Eliminadora de Ar, Conexões Cobre/CPVC e Isolamento Térmico)",
        category_slug: "conexoes",
        unit: "kit",
        quantity: 1,
        unit_cost: 680,
        unit_price: 980,
        sort_order: 3,
      });

      if (
        boilerInput.tipoInstalacao !== "termossifao" ||
        boilerResult.volumeSelecionadoBoilerL >= 600
      ) {
        generated.push({
          id: crypto.randomUUID(),
          product_id: null,
          description:
            "Kit Motobomba de Recirculação Água Quente + Controlador Diferencial Digital (CDT)",
          category_slug: "bombas",
          unit: "kit",
          quantity: 1,
          unit_cost: 950,
          unit_price: 1390,
          sort_order: 4,
        });
      }
    } else if (modality === "piscina") {
      const colPiscProd = products.find(
        (p) =>
          p.active &&
          categoryIdToSlug.get(p.category_id || "") === "coletores_piscina",
      );

      if (poolInput.tipoAquecimento !== "bomba_calor") {
        generated.push({
          id: crypto.randomUUID(),
          product_id: colPiscProd?.id ?? null,
          description:
            colPiscProd?.description ||
            `Coletor Solar para Piscina em Polipropileno UV ${poolInput.areaColetorUnitarioM2.toFixed(1)}m²`,
          category_slug: "coletores_piscina",
          unit: "un",
          quantity: poolResult.quantidadeColetoresSelecionada,
          unit_cost: colPiscProd ? Number(colPiscProd.cost_price) : 390,
          unit_price: colPiscProd ? Number(colPiscProd.sale_price) : 580,
          sort_order: 1,
        });
      }

      if (
        poolInput.tipoAquecimento === "bomba_calor" ||
        poolInput.tipoAquecimento === "hibrido"
      ) {
        generated.push({
          id: crypto.randomUUID(),
          product_id: null,
          description: `Trocador de Calor (Bomba de Calor Inverter) ${poolResult.potenciaBombaCalorSugeridaKw} kW Térmicos`,
          category_slug: "bombas",
          unit: "un",
          quantity: 1,
          unit_cost: Math.round(poolResult.potenciaBombaCalorSugeridaKw * 850),
          unit_price: Math.round(
            poolResult.potenciaBombaCalorSugeridaKw * 1220,
          ),
          sort_order: 2,
        });
      }

      generated.push({
        id: crypto.randomUUID(),
        product_id: null,
        description:
          "Motobomba de Circulação + Controlador Diferencial Digital CDT c/ Sensores + Válvula Quebra-Vácuo",
        category_slug: "bombas",
        unit: "kit",
        quantity: 1,
        unit_cost: 1180,
        unit_price: 1690,
        sort_order: 3,
      });

      generated.push({
        id: crypto.randomUUID(),
        product_id: null,
        description:
          "Kit Tubulações, Registros, Válvula de Retenção e Conexões Hidráulicas PVC/CPVC",
        category_slug: "tubulacoes",
        unit: "kit",
        quantity: 1,
        unit_cost: 590,
        unit_price: 890,
        sort_order: 4,
      });
    }

    setItems(generated);
    toast.success(
      "Lista de equipamentos preenchida automaticamente conforme o dimensionamento!",
    );
  };

  const handleAddCatalogProduct = () => {
    const prod = products.find((p) => p.id === selectedProductIdToAdd);
    if (!prod) {
      toast.error("Selecione um produto do catálogo para adicionar.");
      return;
    }
    const slug = prod.category_id
      ? categoryIdToSlug.get(prod.category_id) || "acessorios"
      : "acessorios";

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        product_id: prod.id,
        description: `${prod.description}${prod.manufacturer ? ` (${prod.manufacturer})` : ""}`,
        category_slug: slug,
        unit: prod.unit || "un",
        quantity: 1,
        unit_cost: Number(prod.cost_price || 0),
        unit_price: Number(prod.sale_price || 0),
        sort_order: prev.length + 1,
      },
    ]);
    setSelectedProductIdToAdd("");
    toast.success("Item adicionado ao orçamento!");
  };

  const handleAddManualItem = () => {
    if (!manualDesc.trim()) {
      toast.error("Informe a descrição do item ou serviço.");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        product_id: null,
        description: manualDesc.trim(),
        category_slug: manualCatSlug,
        unit: manualUnit || "un",
        quantity: Math.max(0.01, Number(manualQty) || 1),
        unit_cost: Math.max(0, Number(manualCost) || 0),
        unit_price: Math.max(0, Number(manualPrice) || 0),
        sort_order: prev.length + 1,
      },
    ]);
    setManualDesc("");
    setManualQty(1);
    setManualCost(0);
    setManualPrice(0);
    toast.success("Item manual incluído!");
  };

  const handleQuickCreateClient = async () => {
    if (!quickClientName.trim()) {
      toast.error("Informe o nome ou razão social do cliente.");
      return;
    }
    const created = await saveClient({
      name: quickClientName.trim(),
      document: quickClientDoc.trim() || null,
      phone: quickClientPhone.trim() || null,
      whatsapp: quickClientPhone.trim() || null,
      city: quickClientCity.trim() || "São Paulo",
      state: quickClientState || "SP",
      client_type: "residencial",
    });
    if (created) {
      setSelectedClientId(created.id);
      setShowQuickClient(false);
      setQuickClientName("");
      setQuickClientDoc("");
      setQuickClientPhone("");
    }
  };

  const currentSizingInput =
    modality === "fotovoltaico"
      ? pvInput
      : modality === "boiler"
        ? boilerInput
        : modality === "piscina"
          ? poolInput
          : {};

  const currentSizingResult =
    modality === "fotovoltaico"
      ? pvResult
      : modality === "boiler"
        ? boilerResult
        : modality === "piscina"
          ? poolResult
          : {};

  const handleSaveQuote = async (options?: {
    asDraft?: boolean;
    createRevision?: boolean;
    openPdfAfter?: boolean;
  }) => {
    if (!selectedClientId && !options?.asDraft) {
      toast.error("Selecione ou cadastre um cliente antes de finalizar.");
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      const targetStatus: QuoteStatus = options?.asDraft ? "rascunho" : status;
      const defaultTitle =
        title.trim() ||
        `${QUOTE_MODALITY_META[modality].shortLabel} — ${
          selectedClient?.name || "Proposta GT Solar"
        }`;

      const saved = await saveQuoteWithItems(
        {
          ...(existingQuote ? { id: existingQuote.id } : {}),
          client_id: selectedClientId || null,
          modality,
          status: targetStatus,
          title: defaultTitle,
          sizing_input: currentSizingInput as any,
          sizing_result: currentSizingResult as any,
          labor_cost: pricingResult.custoMaoDeObra,
          travel_cost: pricingResult.custoDeslocamento,
          freight_cost: pricingResult.custoFrete,
          extra_cost: pricingResult.custoDespesasExtras,
          tax_pct: taxPct,
          margin_pct: marginPct,
          discount: pricingResult.descontoValor,
          total_cost: pricingResult.custoDiretoTotal,
          total_value: pricingResult.valorFinal,
          payment_terms: paymentTerms,
          execution_days: executionDays,
          notes: notes || null,
          next_contact: nextContact || null,
          valid_until: validUntil || null,
        },
        items,
        { createRevision: options?.createRevision },
      );

      if (saved && options?.openPdfAfter) {
        setShowPdfModal(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const proposalPdfData: ProposalPdfData = {
    number: existingQuote?.number || "GT-PREVIA",
    revision: existingQuote?.revision ?? 0,
    createdAt: existingQuote?.created_at || new Date().toISOString(),
    validUntil,
    modality,
    title:
      title ||
      `${QUOTE_MODALITY_META[modality].label} — ${selectedClient?.name || ""}`,
    sellerName:
      profile?.full_name || user?.email?.split("@")[0] || "Consultor GT Solar",
    sellerPhone: profile?.phone,
    client: selectedClient,
    company: companySettings,
    sizingInput: currentSizingInput as Record<string, any>,
    sizingResult: currentSizingResult as Record<string, any>,
    items,
    subtotalBeforeDiscount: pricingResult.subtotalAntesDesconto,
    discount: pricingResult.descontoValor,
    totalValue: pricingResult.valorFinal,
    paymentTerms,
    executionDays,
    notes,
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Assistente de Orçamento */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
              {existingQuote
                ? `Editando ${existingQuote.number} (Rev. ${existingQuote.revision})`
                : "Novo Orçamento Guiado"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${QUOTE_MODALITY_META[modality].badgeClass}`}
            >
              {QUOTE_MODALITY_META[modality].shortLabel}
            </span>
          </div>
          <h2 className="mt-1.5 text-xl font-bold text-slate-900">
            Assistente de Dimensionamento & Precificação Comercial
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveQuote({ asDraft: true })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F2942] hover:bg-[#163a5c] text-white text-xs font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            Visualizar PDF
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveQuote()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Salvar Orçamento ({formatBRL(pricingResult.valorFinal)})
          </button>
        </div>
      </div>

      {/* Indicador de Progresso por Etapas */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] gap-2">
          {WIZARD_STEPS.map((s, idx) => {
            const active = step === s.id;
            const completed = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-orange-600 text-white shadow-xs"
                      : completed
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {completed && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span>{s.label}</span>
                </button>
                {idx < WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ETAPA 1: SELECIONAR CLIENTE */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Etapa 1 — Identificação do Cliente e Título da Proposta
              </h3>
              <p className="text-xs text-slate-500">
                Selecione um cliente já cadastrado ou cadastre rapidamente sem
                sair do orçamento.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickClient((v) => !v)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold hover:bg-orange-100 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {showQuickClient ? "Cancelar Cadastro Rápido" : "+ Novo Cliente Rápido"}
            </button>
          </div>

          {showQuickClient && (
            <div className="rounded-xl bg-orange-50/50 border border-orange-200 p-4 space-y-4">
              <div className="text-xs font-bold uppercase text-orange-800">
                Cadastro Rápido de Cliente
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Nome ou Razão Social *"
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="CPF ou CNPJ"
                  value={quickClientDoc}
                  onChange={(e) => setQuickClientDoc(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="WhatsApp / Telefone"
                  value={quickClientPhone}
                  onChange={(e) => setQuickClientPhone(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={quickClientCity}
                    onChange={(e) => setQuickClientCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  <select
                    value={quickClientState}
                    onChange={(e) => setQuickClientState(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"
                  >
                    {ESTADOS_BR.map((uf) => (
                      <option key={uf.uf} value={uf.uf}>
                        {uf.uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleQuickCreateClient}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 cursor-pointer"
                >
                  Salvar e Selecionar Cliente
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Cliente do Orçamento *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Selecione um cliente cadastrado --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `(${c.city}/${c.state || ""})` : ""} —{" "}
                    {c.client_type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Título / Identificação da Proposta
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Usina Residencial 6,6 kWp — Telhado Colonial"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {selectedClient && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Cliente</span>
                <strong className="text-slate-800">{selectedClient.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Documento</span>
                <strong className="text-slate-800">
                  {selectedClient.document || "Não informado"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Contato</span>
                <strong className="text-slate-800">
                  {selectedClient.whatsapp ||
                    selectedClient.phone ||
                    selectedClient.email ||
                    "—"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Cidade / UF</span>
                <strong className="text-slate-800">
                  {selectedClient.city || "—"} / {selectedClient.state || "—"}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ETAPA 2: ESCOLHER MODALIDADE */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Etapa 2 — Escolha a Modalidade de Solução
            </h3>
            <p className="text-xs text-slate-500">
              Cada modalidade aciona sua calculadora de engenharia dedicada e
              parâmetros técnicos específicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setModality("fotovoltaico")}
              className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                modality === "fotovoltaico"
                  ? "border-orange-500 bg-orange-50/40 shadow-sm"
                  : "border-slate-200 hover:border-orange-300"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-900">
                Energia Solar Fotovoltaica
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Dimensionamento por consumo kWh, irradiação local, módulos,
                inversor, regras de compensação da concessionária e payback.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setModality("boiler")}
              className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                modality === "boiler"
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 hover:border-sky-300"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-900">
                Aquecimento de Água — Boiler
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Cálculo de demanda diária por moradores, chuveiros, volume do
                reservatório térmico, área e quantidade de coletores solares.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setModality("piscina")}
              className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                modality === "piscina"
                  ? "border-teal-600 bg-teal-50/40 shadow-sm"
                  : "border-slate-200 hover:border-teal-300"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4">
                <Waves className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-900">
                Aquecimento de Piscinas
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Dimensionamento por dimensões e volume (m³), cobertura, uso de
                capa térmica, perdas diárias, placas coletoras e bomba de calor.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setModality("manual")}
              className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                modality === "manual"
                  ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                <FileSignature className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-900">
                Orçamento Livre / Manual
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Composição livre de equipamentos, peças avulsas, manutenção ou
                serviços personalizados de engenharia.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: CALCULADORAS DE DIMENSIONAMENTO */}
      {step === 3 && (
        <div className="space-y-6">
          {/* MODALIDADE A: ENERGIA SOLAR FOTOVOLTAICA */}
          {modality === "fotovoltaico" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-orange-500" />
                      Calculadora de Energia Solar Fotovoltaica
                    </h3>
                    <p className="text-xs text-slate-500">
                      Preencha os dados da conta e local da instalação para
                      dimensionar o gerador fotovoltaico
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consumo Mensal (kWh/mês) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pvInput.consumoMensalKwh}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          consumoMensalKwh: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor Médio da Conta (R$)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={pvInput.valorMedioConta}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          valorMedioConta: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tarifa de Energia (R$/kWh)
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step="0.01"
                      value={pvInput.tarifaEnergia}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          tarifaEnergia: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado (UF)
                    </label>
                    <select
                      value={pvInput.estado}
                      onChange={(e) => {
                        const uf = e.target.value;
                        const found = ESTADOS_BR.find((st) => st.uf === uf);
                        setPvInput({
                          ...pvInput,
                          estado: uf,
                          irradiacaoSolarMedia:
                            found?.irradiacaoMedia ?? pvInput.irradiacaoSolarMedia,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      {ESTADOS_BR.map((uf) => (
                        <option key={uf.uf} value={uf.uf}>
                          {uf.uf} — {uf.nome} ({uf.irradiacaoMedia} kWh/m²)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cidade da Instalação
                    </label>
                    <input
                      type="text"
                      value={pvInput.cidade}
                      onChange={(e) =>
                        setPvInput({ ...pvInput, cidade: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Concessionária de Energia
                    </label>
                    <select
                      value={pvInput.concessionaria}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          concessionaria: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      {CONCESSIONARIAS_BR.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Padrão / Tipo de Ligação
                    </label>
                    <select
                      value={pvInput.tipoInstalacao}
                      onChange={(e) => {
                        const val = e.target.value as
                          | "monofasico"
                          | "bifasico"
                          | "trifasico";
                        const found = TIPOS_INSTALACAO_FV.find(
                          (t) => t.value === val,
                        );
                        setPvInput({
                          ...pvInput,
                          tipoInstalacao: val,
                          custoDisponibilidadeKwh: found?.minKwh ?? 50,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      {TIPOS_INSTALACAO_FV.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Telhado / Estrutura
                    </label>
                    <select
                      value={pvInput.tipoTelhado}
                      onChange={(e) =>
                        setPvInput({ ...pvInput, tipoTelhado: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      {TIPOS_TELHADO.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Potência do Módulo (W)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={5}
                      value={pvInput.potenciaModuloW}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          potenciaModuloW: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Irradiação Solar (kWh/m²/dia)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      value={pvInput.irradiacaoSolarMedia}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          irradiacaoSolarMedia: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Perdas do Sistema (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={pvInput.perdasSistemaPct}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          perdasSistemaPct: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Compensação Desejada (%)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={pvInput.compensacaoDesejadaPct}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          compensacaoDesejadaPct: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Regras da Concessionária e Ajustes Manuais */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Custo Disponib. (kWh)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pvInput.custoDisponibilidadeKwh}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          custoDisponibilidadeKwh: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tributos / Fio B (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={pvInput.encargosNaoCompensaveisPct}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          encargosNaoCompensaveisPct: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Qtd. Módulos (Manual opc.)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder={`Auto (${pvResult.quantidadeModulosSugerida})`}
                      value={pvInput.quantidadeModulosManual ?? ""}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          quantidadeModulosManual: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Inversor kW (Manual opc.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      placeholder={`Auto (${pvResult.potenciaInversorRecomendadaKw} kW)`}
                      value={pvInput.potenciaInversorManualKw ?? ""}
                      onChange={(e) =>
                        setPvInput({
                          ...pvInput,
                          potenciaInversorManualKw: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Resultados do Dimensionamento Fotovoltaico */}
              <div className="lg:col-span-5 bg-[#0F2942] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Resultado do Dimensionamento Técnico
                  </span>
                  <h4 className="text-xl font-bold mt-1">
                    Sistema Fotovoltaico de{" "}
                    <span className="text-orange-400">
                      {formatNumber(pvResult.potenciaInstaladaKwp, 2)} kWp
                    </span>
                  </h4>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Potência Necessária</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {formatNumber(pvResult.potenciaNecessariaKwp, 2)} kWp
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Quantidade de Módulos</div>
                      <div className="text-base font-bold text-orange-400 mt-0.5">
                        {pvResult.quantidadeModulos} módulos ({pvInput.potenciaModuloW}W)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Inversor Recomendado</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {pvResult.potenciaInversorSelecionadaKw} kW
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Área Aproximada</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        ~{formatNumber(pvResult.areaAproximadaM2, 1)} m²
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Geração Mensal Est.</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {formatNumber(pvResult.geracaoMensalEstimadaKwh, 0)} kWh/mês
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Geração Anual Est.</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {formatNumber(pvResult.geracaoAnualEstimadaKwh, 0)} kWh/ano
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/15 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Conta Atual Estimada:</span>
                      <strong>{formatBRL(pvResult.contaAtualEstimadaR$)}/mês</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">
                        Nova Conta (c/ taxa mín. + Fio B):
                      </span>
                      <strong className="text-amber-300">
                        {formatBRL(pvResult.novaContaEstimadaR$)}/mês
                      </strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/10">
                      <span className="text-emerald-300 font-semibold">
                        Economia Mensal / Anual:
                      </span>
                      <strong className="text-emerald-400">
                        {formatBRL(pvResult.economiaMensalEstimadaR$)} /{" "}
                        {formatBRL(pvResult.economiaAnualEstimadaR$)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Payback Simples:</span>
                      <strong className="text-orange-300">
                        {pvResult.paybackSimplesAnos > 0
                          ? `${formatNumber(pvResult.paybackSimplesAnos, 1)} anos (${pvResult.paybackSimplesMeses} meses)`
                          : "Defina os equipamentos na próx. etapa"}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAutoPopulateEquipment();
                    setStep(4);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Kit de Equipamentos e Avançar
                </button>
              </div>
            </div>
          )}

          {/* MODALIDADE B: AQUECIMENTO SOLAR DE ÁGUA — BOILER */}
          {modality === "boiler" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-sky-600" />
                    Calculadora de Aquecimento Solar de Água — Boiler
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dimensionamento térmico de reservatório (boiler) e coletores
                    solares planos
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Moradores / Usuários *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={boilerInput.moradores}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          moradores: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qtd. de Banheiros
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={boilerInput.banheiros}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          banheiros: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qtd. de Chuveiros
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={boilerInput.chuveiros}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          chuveiros: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pontos de Água Quente
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={boilerInput.pontosAguaQuente}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          pontosAguaQuente: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consumo Diário (L/pessoa)
                    </label>
                    <input
                      type="number"
                      min={20}
                      value={boilerInput.consumoLitrosPessoaDia}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          consumoLitrosPessoaDia: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Capacidade do Boiler (L)
                    </label>
                    <select
                      value={boilerInput.capacidadeBoilerManualL ?? ""}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          capacidadeBoilerManualL: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="">
                        Automático ({boilerResult.volumeRecomendadoBoilerL}L)
                      </option>
                      {STANDARD_BOILER_VOLUMES_L.map((v) => (
                        <option key={v} value={v}>
                          Selecionar Manual: {v} Litros
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temperatura Desejada (°C)
                    </label>
                    <input
                      type="number"
                      value={boilerInput.temperaturaDesejadaC}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          temperaturaDesejadaC: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temp. Água de Entrada (°C)
                    </label>
                    <input
                      type="number"
                      value={boilerInput.temperaturaEntradaC}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          temperaturaEntradaC: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Instalação
                    </label>
                    <select
                      value={boilerInput.tipoInstalacao}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          tipoInstalacao: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="termossifao">
                        Termossifão (Gravidade / Baixa Pressão)
                      </option>
                      <option value="circulacao_forcada">
                        Circulação Forçada (Com Bomba/CDT)
                      </option>
                      <option value="pressurizado">
                        Pressurizado (Alta Pressão)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Apoio Térmico
                    </label>
                    <select
                      value={boilerInput.tipoApoioTermico}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          tipoApoioTermico: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="eletrico">Resistência Elétrica</option>
                      <option value="gas">Aquecedor a Gás de Passagem</option>
                      <option value="bomba_calor">Bomba de Calor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Área Unit. Coletor (m²)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={boilerInput.areaColetorUnitarioM2}
                      onChange={(e) =>
                        setBoilerInput({
                          ...boilerInput,
                          areaColetorUnitarioM2: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qtd. Coletores (Manual opc.)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder={`Sugerido (${boilerResult.quantidadeColetoresSugerida})`}
                      value={boilerCollectorManualQty ?? ""}
                      onChange={(e) =>
                        setBoilerCollectorManualQty(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#0F2942] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Dimensionamento Térmico — Boiler
                  </span>
                  <h4 className="text-xl font-bold mt-1">
                    Boiler de{" "}
                    <span className="text-orange-400">
                      {boilerResult.volumeSelecionadoBoilerL} Litros
                    </span>{" "}
                    + {boilerResult.quantidadeColetoresSelecionada} Coletor(es)
                  </h4>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Demanda Diária Est.</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {boilerResult.demandaDiariaLitros} L/dia
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Volume Recomendado</div>
                      <div className="text-base font-bold text-orange-400 mt-0.5">
                        {boilerResult.volumeRecomendadoBoilerL} Litros
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Energia Térmica/Dia</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {formatNumber(boilerResult.energiaTermicaDiariaKwh, 1)}{" "}
                        kWh/dia
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Área de Coletores</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {formatNumber(boilerResult.areaColetorEstimadaM2, 2)} m² (
                        {boilerResult.quantidadeColetoresSelecionada} placas)
                      </div>
                    </div>
                  </div>

                  {boilerResult.requerValidacaoTecnica && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs text-amber-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Atenção — Validação Técnica Recomendada:
                      </div>
                      {boilerResult.motivosValidacaoTecnica.map((m, i) => (
                        <div key={i}>• {m}</div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAutoPopulateEquipment();
                    setStep(4);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Kit Boiler + Coletores e Avançar
                </button>
              </div>
            </div>
          )}

          {/* MODALIDADE C: AQUECIMENTO DE PISCINAS */}
          {modality === "piscina" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Waves className="w-5 h-5 text-teal-600" />
                    Calculadora de Aquecimento de Piscinas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dimensionamento para piscinas residenciais e comerciais por
                    coletores solares ou bomba de calor
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Comprimento (m) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      value={poolInput.comprimentoM}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          comprimentoM: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Largura (m) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      value={poolInput.larguraM}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          larguraM: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Profundidade Média (m) *
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min={0.3}
                      value={poolInput.profundidadeMediaM}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          profundidadeMediaM: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Volume em m³ (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder={`Auto (${poolResult.volumeCalculadoM3} m³)`}
                      value={poolInput.volumeManualM3 ?? ""}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          volumeManualM3: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Piscina Aberta ou Coberta
                    </label>
                    <select
                      value={poolInput.ambiente}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          ambiente: e.target.value as "aberta" | "coberta",
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="aberta">Piscina Aberta (Externa)</option>
                      <option value="coberta">Piscina Coberta (Fechada)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Uso de Capa Térmica
                    </label>
                    <select
                      value={poolInput.usoCapaTermica ? "sim" : "nao"}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          usoCapaTermica: e.target.value === "sim",
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="sim">Sim (Com Capa Térmica Noturna)</option>
                      <option value="nao">Não (Sem Capa Térmica)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temperatura Desejada (°C)
                    </label>
                    <input
                      type="number"
                      value={poolInput.temperaturaDesejadaC}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          temperaturaDesejadaC: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temperatura Inicial (°C)
                    </label>
                    <input
                      type="number"
                      value={poolInput.temperaturaInicialC}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          temperaturaInicialC: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Período de Utilização
                    </label>
                    <select
                      value={poolInput.periodoUtilizacao}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          periodoUtilizacao: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="ano_todo">O Ano Todo (Incluindo Inverno)</option>
                      <option value="primavera_verao">Primavera / Verão</option>
                      <option value="fins_de_semana">Finais de Semana / Lazer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Aquecimento
                    </label>
                    <select
                      value={poolInput.tipoAquecimento}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          tipoAquecimento: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="solar">Coletores Solares de Piscina</option>
                      <option value="bomba_calor">
                        Bomba de Calor (Trocador Elétrico)
                      </option>
                      <option value="hibrido">
                        Híbrido (Solar + Bomba de Calor)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Área Disponível Telhado (m²)
                    </label>
                    <input
                      type="number"
                      value={poolInput.areaDisponivelColetoresM2}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          areaDisponivelColetoresM2: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exposição ao Vento
                    </label>
                    <select
                      value={poolInput.exposicaoVento}
                      onChange={(e) =>
                        setPoolInput({
                          ...poolInput,
                          exposicaoVento: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="baixa">Baixa (Local Abrigado)</option>
                      <option value="media">Média (Residencial Padrão)</option>
                      <option value="alta">Alta (Sítio / Cobertura / Vento Forte)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#0F2942] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    Dimensionamento Térmico — Piscina
                  </span>
                  <h4 className="text-xl font-bold mt-1">
                    Piscina de{" "}
                    <span className="text-orange-400">
                      {formatNumber(poolResult.volumeCalculadoM3, 1)} m³
                    </span>{" "}
                    ({formatNumber(poolResult.areaSuperficieM2, 1)} m²)
                  </h4>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Energia Aquec. Inicial</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {formatNumber(poolResult.energiaAquecimentoInicialKwh, 0)}{" "}
                        kWh
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Manutenção Térmica/Dia</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {formatNumber(poolResult.demandaManutencaoDiariaKwh, 1)}{" "}
                        kWh/dia
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Área Rec. Coletores</div>
                      <div className="text-base font-bold text-orange-400 mt-0.5">
                        {formatNumber(poolResult.areaRecomendadaColetoresM2, 1)}{" "}
                        m²
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-300">Qtd. Placas / Coletores</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {poolResult.quantidadeColetoresSelecionada} coletores
                      </div>
                    </div>
                  </div>

                  {poolResult.alertaAreaInsuficiente && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200">
                      <strong>Alerta de Área:</strong> A área disponível no
                      telhado ({poolInput.areaDisponivelColetoresM2} m²) é menor
                      que a área recomendada (
                      {poolResult.areaRecomendadaColetoresM2} m²). Considere
                      sistema híbrido com Bomba de Calor (~
                      {poolResult.potenciaBombaCalorSugeridaKw} kW).
                    </div>
                  )}

                  <p className="mt-3 text-[11px] text-slate-300 leading-relaxed">
                    {poolResult.avisoTecnicoCondicoes}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAutoPopulateEquipment();
                    setStep(4);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Kit de Aquecimento de Piscina e Avançar
                </button>
              </div>
            </div>
          )}

          {modality === "manual" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
              <Calculator className="w-10 h-10 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">
                Orçamento em Modo Livre / Manual
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No modo manual você seleciona diretamente os produtos, peças e
                serviços na próxima etapa sem vínculo obrigatório com uma
                calculadora específica.
              </p>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 cursor-pointer"
              >
                Avançar para Seleção de Equipamentos
              </button>
            </div>
          )}
        </div>
      )}

      {/* ETAPA 4: SELECIONAR EQUIPAMENTOS E MATERIAIS */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Etapa 4 — Seleção de Equipamentos, Materiais e Serviços
              </h3>
              <p className="text-xs text-slate-500">
                Adicione produtos do catálogo oficial, gere o kit automático do
                dimensionamento ou insira itens personalizados.
              </p>
            </div>
            {modality !== "manual" && (
              <button
                type="button"
                onClick={handleAutoPopulateEquipment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold hover:bg-orange-100 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Recarregar Sugestão do Dimensionamento
              </button>
            )}
          </div>

          {/* Adicionar do Catálogo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="lg:col-span-9">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Adicionar Equipamento ou Serviço do Catálogo Oficial
              </label>
              <select
                value={selectedProductIdToAdd}
                onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
              >
                <option value="">
                  -- Escolha um produto cadastrado ({products.length}{" "}
                  disponíveis) --
                </option>
                {products
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code || "ITEM"}] {p.description} — Venda:{" "}
                      {formatBRL(p.sale_price)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="lg:col-span-3 flex items-end">
              <button
                type="button"
                onClick={handleAddCatalogProduct}
                className="w-full py-2 px-4 rounded-lg bg-[#0F2942] hover:bg-[#173b5e] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Incluir do Catálogo
              </button>
            </div>
          </div>

          {/* Adicionar Item Manual */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-slate-600">
              Ou Adicionar Item / Material / Serviço Manualmente
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                placeholder="Descrição do equipamento ou serviço..."
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                className="sm:col-span-4 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
              <select
                value={manualCatSlug}
                onChange={(e) => setManualCatSlug(e.target.value)}
                className="sm:col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white"
              >
                {PRODUCT_CATEGORIES_META.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Unid."
                value={manualUnit}
                onChange={(e) => setManualUnit(e.target.value)}
                className="sm:col-span-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-center"
              />
              <input
                type="number"
                min={0.1}
                step="1"
                placeholder="Qtd"
                value={manualQty}
                onChange={(e) => setManualQty(Number(e.target.value))}
                className="sm:col-span-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Custo R$"
                value={manualCost || ""}
                onChange={(e) => setManualCost(Number(e.target.value))}
                className="sm:col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={handleAddManualItem}
                className="sm:col-span-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold py-1.5 px-3 cursor-pointer"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Tabela de Itens do Orçamento */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase">
                  <th className="py-2.5 px-3 font-semibold">Descrição</th>
                  <th className="py-2.5 px-3 font-semibold">Categoria</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Un.</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Qtd.</th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Custo Unit.
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Custo Total
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">
                    Remover
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-500"
                    >
                      Nenhum equipamento adicionado. Clique em "Recarregar
                      Sugestão do Dimensionamento" ou selecione um item acima.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) =>
                              prev.map((row, i) =>
                                i === idx ? { ...row, description: val } : row,
                              ),
                            );
                          }}
                          className="w-full rounded border border-transparent hover:border-slate-300 focus:border-orange-500 px-2 py-1 font-medium text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {it.category_slug || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center uppercase">
                        {it.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min={0.1}
                          step="1"
                          value={it.quantity}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setItems((prev) =>
                              prev.map((row, i) =>
                                i === idx ? { ...row, quantity: val } : row,
                              ),
                            );
                          }}
                          className="w-20 text-right rounded border border-slate-300 px-2 py-1 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={it.unit_cost}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setItems((prev) =>
                              prev.map((row, i) =>
                                i === idx ? { ...row, unit_cost: val } : row,
                              ),
                            );
                          }}
                          className="w-28 text-right rounded border border-slate-300 px-2 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatBRL(it.quantity * it.unit_cost)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setItems((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ETAPA 5: DEFINIR PREÇOS, CUSTOS E MARGENS */}
      {step === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                Etapa 5 — Formação de Preço, Margem Comercial e Condições
              </h3>
              <p className="text-xs text-slate-500">
                Configure mão de obra, logística, tributos, método de
                precificação (Margem sobre Venda vs Markup sobre Custo) e
                desconto.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo de Mão de Obra / Instalação (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="50"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo de Deslocamento / Viagem (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="20"
                  value={travelCost}
                  onChange={(e) => setTravelCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frete / Logística de Entrega (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="20"
                  value={freightCost}
                  onChange={(e) => setFreightCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Despesas Adicionais / ART / Homologação (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="20"
                  value={extraCost}
                  onChange={(e) => setExtraCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Regra de Cálculo Comercial
                </label>
                <select
                  value={pricingMode}
                  onChange={(e) => setPricingMode(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
                >
                  <option value="margin_on_sale">
                    Margem sobre Preço de Venda (Preço = Custo / (1 - Margem%))
                  </option>
                  <option value="markup_on_cost">
                    Markup sobre Custo Direto (Preço = Custo × (1 + Markup%))
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {pricingMode === "margin_on_sale"
                    ? "Margem Comercial (%)"
                    : "Markup sobre Custo (%)"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  step="0.5"
                  value={marginPct}
                  onChange={(e) => setMarginPct(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-orange-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tributos Estimados (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  step="0.5"
                  value={taxPct}
                  onChange={(e) => setTaxPct(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desconto Comercial (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="50"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo de Execução (dias)
                </label>
                <input
                  type="number"
                  min={1}
                  value={executionDays}
                  onChange={(e) => setExecutionDays(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Validade da Proposta
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condições de Pagamento na Proposta
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Comerciais / Técnicas da Proposta
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Incluso acompanhamento de vistoria junto à concessionária..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Demonstrativo de Formação de Preço */}
          <div className="lg:col-span-5 bg-[#0F2942] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Demonstrativo de Precificação Automática
              </span>
              <h4 className="text-xl font-bold mt-1">
                Composição Comercial do Orçamento
              </h4>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    1. Custo dos Equipamentos Principais:
                  </span>
                  <strong>{formatBRL(pricingResult.custoEquipamentos)}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    2. Custo dos Materiais Auxiliares:
                  </span>
                  <strong>
                    {formatBRL(pricingResult.custoMateriaisAuxiliares)}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    3. Mão de Obra + Serviços:
                  </span>
                  <strong>
                    {formatBRL(
                      pricingResult.custoMaoDeObra +
                        pricingResult.custoServicosCatalogo,
                    )}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    4. Deslocamento + Frete + Extras:
                  </span>
                  <strong>
                    {formatBRL(
                      pricingResult.custoDeslocamento +
                        pricingResult.custoFrete +
                        pricingResult.custoDespesasExtras,
                    )}
                  </strong>
                </div>
                <div className="flex justify-between py-2 bg-white/5 px-3 rounded-lg">
                  <span className="font-semibold text-orange-300">
                    Custo Direto Total:
                  </span>
                  <strong className="text-orange-300">
                    {formatBRL(pricingResult.custoDiretoTotal)}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    Tributos Estimados ({taxPct}%):
                  </span>
                  <strong>
                    {formatBRL(pricingResult.tributosEstimadosValor)}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    Subtotal com Margem/Markup:
                  </span>
                  <strong>
                    {formatBRL(pricingResult.subtotalAntesDesconto)}
                  </strong>
                </div>
                {pricingResult.descontoValor > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-white/10 text-emerald-400">
                    <span>Desconto Concedido:</span>
                    <strong>- {formatBRL(pricingResult.descontoValor)}</strong>
                  </div>
                )}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-orange-500/20 border border-orange-400/40">
                <div className="text-xs uppercase font-bold text-orange-300">
                  Valor Final da Proposta ao Cliente
                </div>
                <div className="text-3xl font-black text-white mt-1">
                  {formatBRL(pricingResult.valorFinal)}
                </div>
              </div>

              {/* Indicadores de Lucro Bruto e Margem Final (visível conforme permissão) */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Lucro Bruto Est.
                  </div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {isAdmin
                      ? formatBRL(pricingResult.lucroBrutoEstimado)
                      : `${formatNumber(pricingResult.margemSobreVendaFinalPct, 1)}%`}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Margem s/ Venda
                  </div>
                  <div className="font-bold text-white mt-0.5">
                    {formatNumber(pricingResult.margemSobreVendaFinalPct, 1)}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Markup s/ Custo
                  </div>
                  <div className="font-bold text-sky-300 mt-0.5">
                    {formatNumber(pricingResult.markupEfetivoSobreCustoPct, 1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 6: REVISAR, GERAR PDF E SALVAR */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Etapa 6 — Revisão Final, Geração de PDF e Salvamento
              </h3>
              <p className="text-xs text-slate-500">
                Confira o resumo do orçamento, defina o status comercial e gere
                o PDF oficial da GT Solar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Status do Orçamento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold bg-white"
              >
                {Object.entries(QUOTE_STATUS_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Próximo Contato / Follow-up
              </label>
              <input
                type="date"
                value={nextContact}
                onChange={(e) => setNextContact(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5 flex flex-col justify-center">
              <div className="text-xs text-orange-800 font-semibold">
                Valor Final da Proposta:
              </div>
              <div className="text-2xl font-black text-orange-600">
                {formatBRL(pricingResult.valorFinal)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F2942] hover:bg-[#173b5e] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              <Printer className="w-4 h-4 text-orange-400" />
              Abrir e Imprimir Proposta em PDF
            </button>

            {existingQuote && (
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await handleSaveQuote({ createRevision: true });
                  setActiveTab("orcamentos");
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                <History className="w-4 h-4" />
                Salvar como Nova Revisão (Rev. {existingQuote.revision + 1})
              </button>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                await handleSaveQuote({ openPdfAfter: false });
                setActiveTab("orcamentos");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {existingQuote
                ? "Salvar Alterações do Orçamento"
                : "Finalizar e Salvar Orçamento"}
            </button>
          </div>
        </div>
      )}

      {/* Barra inferior de navegação entre etapas */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Etapa Anterior
        </button>

        {step < 6 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(6, s + 1))}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#173b5e] text-white text-xs font-bold cursor-pointer"
          >
            Próxima Etapa
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {showPdfModal && (
        <ProposalPdfModal
          proposal={proposalPdfData}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
