import type { Database } from "@/integrations/supabase/types";

export type QuoteModality = Database["public"]["Enums"]["quote_modality"];
export type QuoteStatus = Database["public"]["Enums"]["quote_status"];
export type ClientType = Database["public"]["Enums"]["client_type"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export function formatBRL(value: number | null | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatNumber(
  value: number | null | undefined,
  decimals = 2,
): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export const ESTADOS_BR: Array<{
  uf: string;
  nome: string;
  irradiacaoMedia: number;
}> = [
  { uf: "AC", nome: "Acre", irradiacaoMedia: 4.6 },
  { uf: "AL", nome: "Alagoas", irradiacaoMedia: 5.3 },
  { uf: "AM", nome: "Amazonas", irradiacaoMedia: 4.5 },
  { uf: "AP", nome: "Amapá", irradiacaoMedia: 4.7 },
  { uf: "BA", nome: "Bahia", irradiacaoMedia: 5.5 },
  { uf: "CE", nome: "Ceará", irradiacaoMedia: 5.6 },
  { uf: "DF", nome: "Distrito Federal", irradiacaoMedia: 5.3 },
  { uf: "ES", nome: "Espírito Santo", irradiacaoMedia: 4.9 },
  { uf: "GO", nome: "Goiás", irradiacaoMedia: 5.3 },
  { uf: "MA", nome: "Maranhão", irradiacaoMedia: 5.2 },
  { uf: "MG", nome: "Minas Gerais", irradiacaoMedia: 5.2 },
  { uf: "MS", nome: "Mato Grosso do Sul", irradiacaoMedia: 5.1 },
  { uf: "MT", nome: "Mato Grosso", irradiacaoMedia: 5.2 },
  { uf: "PA", nome: "Pará", irradiacaoMedia: 4.8 },
  { uf: "PB", nome: "Paraíba", irradiacaoMedia: 5.6 },
  { uf: "PE", nome: "Pernambuco", irradiacaoMedia: 5.5 },
  { uf: "PI", nome: "Piauí", irradiacaoMedia: 5.7 },
  { uf: "PR", nome: "Paraná", irradiacaoMedia: 4.6 },
  { uf: "RJ", nome: "Rio de Janeiro", irradiacaoMedia: 4.8 },
  { uf: "RN", nome: "Rio Grande do Norte", irradiacaoMedia: 5.7 },
  { uf: "RO", nome: "Rondônia", irradiacaoMedia: 4.7 },
  { uf: "RR", nome: "Roraima", irradiacaoMedia: 4.8 },
  { uf: "RS", nome: "Rio Grande do Sul", irradiacaoMedia: 4.5 },
  { uf: "SC", nome: "Santa Catarina", irradiacaoMedia: 4.4 },
  { uf: "SE", nome: "Sergipe", irradiacaoMedia: 5.4 },
  { uf: "SP", nome: "São Paulo", irradiacaoMedia: 4.9 },
  { uf: "TO", nome: "Tocantins", irradiacaoMedia: 5.3 },
];

export const CONCESSIONARIAS_BR = [
  "CEMIG",
  "CPFL Paulista",
  "CPFL Piratininga",
  "Enel SP",
  "Enel RJ",
  "Enel CE",
  "Neoenergia Elektro",
  "Neoenergia Coelba",
  "Neoenergia Pernambuco",
  "Neoenergia Cosern",
  "Neoenergia Brasília",
  "Copel",
  "Celesc",
  "RGE Sul",
  "CEEE Equatorial",
  "Equatorial GO",
  "Equatorial MA",
  "Equatorial PA",
  "Equatorial PI",
  "Equatorial AL",
  "Energisa MT",
  "Energisa MS",
  "Energisa MG",
  "Energisa PB",
  "Energisa SE",
  "Energisa TO",
  "EDP SP",
  "EDP ES",
  "Light",
  "Amazonas Energia",
  "Outra",
];

export const TIPOS_INSTALACAO_FV = [
  { value: "monofasico", label: "Monofásico (Taxa mín. 30 kWh)", minKwh: 30 },
  { value: "bifasico", label: "Bifásico (Taxa mín. 50 kWh)", minKwh: 50 },
  { value: "trifasico", label: "Trifásico (Taxa mín. 100 kWh)", minKwh: 100 },
] as const;

export const TIPOS_TELHADO = [
  { value: "ceramico", label: "Cerâmico / Colonial" },
  { value: "fibrocimento", label: "Fibrocimento / Ondulado" },
  { value: "metalico", label: "Metálico / Trapezoidal" },
  { value: "laje", label: "Laje Impermeabilizada" },
  { value: "solo", label: "Solo / Usina em Solo" },
  { value: "carport", label: "Carport / Estacionamento Solar" },
] as const;

export const PRODUCT_CATEGORIES_META: Array<{
  slug: string;
  name: string;
  group: "equipamento" | "auxiliar" | "servico";
}> = [
  { slug: "modulos", name: "Módulos fotovoltaicos", group: "equipamento" },
  { slug: "inversores", name: "Inversores", group: "equipamento" },
  { slug: "microinversores", name: "Microinversores", group: "equipamento" },
  { slug: "estruturas", name: "Estruturas", group: "auxiliar" },
  { slug: "cabos", name: "Cabos e conectores", group: "auxiliar" },
  { slug: "protecoes", name: "Proteções elétricas", group: "auxiliar" },
  { slug: "boilers", name: "Boilers", group: "equipamento" },
  { slug: "coletores_agua", name: "Coletores solares de água", group: "equipamento" },
  { slug: "coletores_piscina", name: "Coletores de piscina", group: "equipamento" },
  { slug: "bombas", name: "Bombas e controladores", group: "equipamento" },
  { slug: "tubulacoes", name: "Tubulações", group: "auxiliar" },
  { slug: "conexoes", name: "Conexões", group: "auxiliar" },
  { slug: "acessorios", name: "Acessórios", group: "auxiliar" },
  { slug: "servicos", name: "Serviços e mão de obra", group: "servico" },
];

export const QUOTE_STATUS_META: Record<
  QuoteStatus,
  { label: string; badgeClass: string; dotColor: string }
> = {
  rascunho: {
    label: "Rascunho",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    dotColor: "#64748b",
  },
  enviado: {
    label: "Enviado",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "#2563eb",
  },
  negociacao: {
    label: "Em Negociação",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    dotColor: "#d97706",
  },
  aprovado: {
    label: "Aprovado",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
    dotColor: "#059669",
  },
  perdido: {
    label: "Perdido",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotColor: "#e11d48",
  },
  expirado: {
    label: "Expirado",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "#7c3aed",
  },
};

export const QUOTE_MODALITY_META: Record<
  QuoteModality,
  { label: string; shortLabel: string; color: string; badgeClass: string }
> = {
  fotovoltaico: {
    label: "Energia Solar Fotovoltaica",
    shortLabel: "Fotovoltaico",
    color: "#ea580c",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  boiler: {
    label: "Aquecimento Solar de Água — Boiler",
    shortLabel: "Boiler / Água Quente",
    color: "#0284c7",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  piscina: {
    label: "Aquecimento de Piscinas",
    shortLabel: "Piscinas",
    color: "#0d9488",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  manual: {
    label: "Orçamento Personalizado / Manual",
    shortLabel: "Manual",
    color: "#4f46e5",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

// ============================================================================
// 1. MOTOR DE CÁLCULO — ENERGIA SOLAR FOTOVOLTAICA
// ============================================================================

export interface PhotovoltaicSizingParams {
  perdas_pct: number;
  area_por_modulo_m2: number;
  custo_disponibilidade_kwh: number;
  compensacao_pct: number;
  fator_simultaneidade_pct?: number;
  encargos_fio_b_pct?: number;
}

export const DEFAULT_PV_PARAMS: PhotovoltaicSizingParams = {
  perdas_pct: 20,
  area_por_modulo_m2: 2.6,
  custo_disponibilidade_kwh: 100,
  compensacao_pct: 95,
  fator_simultaneidade_pct: 30,
  encargos_fio_b_pct: 12,
};

export interface PhotovoltaicInput {
  consumoMensalKwh: number;
  valorMedioConta: number;
  cidade: string;
  estado: string;
  concessionaria: string;
  tipoInstalacao: "monofasico" | "bifasico" | "trifasico";
  tipoTelhado: string;
  potenciaModuloW: number;
  quantidadeModulosManual?: number;
  potenciaInversorManualKw?: number;
  irradiacaoSolarMedia: number; // kWh/m²/dia
  perdasSistemaPct: number;
  tarifaEnergia: number; // R$/kWh
  custoDisponibilidadeKwh: number; // 30, 50 ou 100 kWh
  encargosNaoCompensaveisPct: number; // Tributos / Fio B / Iluminação Pública (%)
  taxaIluminacaoPublicaR$: number;
  compensacaoDesejadaPct: number;
  areaPorModuloM2: number;
}

export interface PhotovoltaicResult {
  potenciaNecessariaKwp: number;
  quantidadeModulosSugerida: number;
  quantidadeModulos: number;
  potenciaInstaladaKwp: number;
  potenciaInversorRecomendadaKw: number;
  potenciaInversorSelecionadaKw: number;
  geracaoMensalEstimadaKwh: number;
  geracaoAnualEstimadaKwh: number;
  areaAproximadaM2: number;
  contaAtualEstimadaR$: number;
  custoMinimoConcessionariaR$: number;
  novaContaEstimadaR$: number;
  economiaMensalEstimadaR$: number;
  economiaAnualEstimadaR$: number;
  economia25AnosEstimadaR$: number;
  percentualReducaoRealConta: number;
  paybackSimplesAnos: number;
  paybackSimplesMeses: number;
  observacaoRegulatoria: string;
}

const STANDARD_INVERTER_KW = [
  1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 15, 20, 25, 30, 36, 40, 50, 60, 75,
  100, 125,
];

export function calculatePhotovoltaic(
  input: PhotovoltaicInput,
  investimentoTotalR$ = 0,
): PhotovoltaicResult {
  const consumo = Math.max(0, Number(input.consumoMensalKwh) || 0);
  const tarifa = Math.max(0.01, Number(input.tarifaEnergia) || 0.92);
  const irradiacao = Math.max(1, Number(input.irradiacaoSolarMedia) || 4.9);
  const perdasPct = Math.min(60, Math.max(0, Number(input.perdasSistemaPct) || 20));
  const potenciaModuloW = Math.max(100, Number(input.potenciaModuloW) || 550);
  const compensacaoPct = Math.min(
    120,
    Math.max(10, Number(input.compensacaoDesejadaPct) || 95),
  );
  const custoDispKwh = Math.max(0, Number(input.custoDisponibilidadeKwh) || 50);
  const encargosPct = Math.min(
    50,
    Math.max(0, Number(input.encargosNaoCompensaveisPct) || 12),
  );
  const cipR$ = Math.max(0, Number(input.taxaIluminacaoPublicaR$) || 35);
  const areaUnitM2 = Math.max(1, Number(input.areaPorModuloM2) || 2.6);

  const rendimento = 1 - perdasPct / 100;
  const geracaoDiariaPorKwp = irradiacao * rendimento;
  const geracaoMensalPorKwp = geracaoDiariaPorKwp * 30;

  // Energia alvo a ser gerada pelo sistema
  const energiaAlvoKwh = consumo * (compensacaoPct / 100);
  const potenciaNecessariaKwp =
    geracaoMensalPorKwp > 0 ? energiaAlvoKwh / geracaoMensalPorKwp : 0;

  const quantidadeModulosSugerida =
    potenciaNecessariaKwp > 0
      ? Math.ceil((potenciaNecessariaKwp * 1000) / potenciaModuloW)
      : 0;

  const quantidadeModulos =
    input.quantidadeModulosManual && input.quantidadeModulosManual > 0
      ? Math.round(input.quantidadeModulosManual)
      : quantidadeModulosSugerida;

  const potenciaInstaladaKwp = (quantidadeModulos * potenciaModuloW) / 1000;

  // Dimensionamento do inversor (fator de sobrecarga FDI ~ 1.15)
  const potenciaInversorAlvo = potenciaInstaladaKwp / 1.15;
  const potenciaInversorRecomendadaKw =
    STANDARD_INVERTER_KW.find((kw) => kw >= potenciaInversorAlvo) ??
    Math.ceil(potenciaInversorAlvo);

  const potenciaInversorSelecionadaKw =
    input.potenciaInversorManualKw && input.potenciaInversorManualKw > 0
      ? Number(input.potenciaInversorManualKw)
      : potenciaInversorRecomendadaKw;

  const geracaoMensalEstimadaKwh = potenciaInstaladaKwp * geracaoMensalPorKwp;
  const geracaoAnualEstimadaKwh = geracaoMensalEstimadaKwh * 12;
  const areaAproximadaM2 = quantidadeModulos * areaUnitM2;

  // Conta atual (usa valor informado ou calcula pelo consumo * tarifa + CIP)
  const contaCalculada = consumo * tarifa + cipR$;
  const contaAtualEstimadaR$ =
    input.valorMedioConta && input.valorMedioConta > 0
      ? Number(input.valorMedioConta)
      : contaCalculada;

  // Custo mínimo regulatório: disponibilidade da rede + iluminação pública + encargos Fio B sobre injeção
  const energiaInjetadaEstimadaKwh = geracaoMensalEstimadaKwh * 0.7; // ~70% injetado, 30% simultaneidade
  const encargoFioBR$ =
    energiaInjetadaEstimadaKwh * tarifa * (encargosPct / 100);
  const custoDisponibilidadeR$ = custoDispKwh * tarifa;
  const energiaNaoCompensadaKwh = Math.max(0, consumo - geracaoMensalEstimadaKwh);
  const custoConsumoResidualR$ = Math.max(
    custoDisponibilidadeR$,
    energiaNaoCompensadaKwh * tarifa + encargoFioBR$,
  );

  const custoMinimoConcessionariaR$ = custoDisponibilidadeR$ + cipR$;
  const novaContaEstimadaR$ = Math.min(
    contaAtualEstimadaR$,
    custoConsumoResidualR$ + cipR$,
  );

  const economiaMensalEstimadaR$ = Math.max(
    0,
    contaAtualEstimadaR$ - novaContaEstimadaR$,
  );
  const economiaAnualEstimadaR$ = economiaMensalEstimadaR$ * 12;
  // Projeção de 25 anos considerando reajuste tarifário líquido de ~4% a.a. e degradação de 0,5% a.a.
  let economia25AnosEstimadaR$ = 0;
  for (let ano = 1; ano <= 25; ano++) {
    const fatorTarifa = Math.pow(1.035, ano - 1);
    economia25AnosEstimadaR$ += economiaAnualEstimadaR$ * fatorTarifa;
  }

  const percentualReducaoRealConta =
    contaAtualEstimadaR$ > 0
      ? (economiaMensalEstimadaR$ / contaAtualEstimadaR$) * 100
      : 0;

  const paybackSimplesAnos =
    economiaAnualEstimadaR$ > 0 && investimentoTotalR$ > 0
      ? investimentoTotalR$ / economiaAnualEstimadaR$
      : 0;
  const paybackSimplesMeses = Math.round(paybackSimplesAnos * 12);

  const observacaoRegulatoria = `Cálculo considera taxa mínima de disponibilidade (${custoDispKwh} kWh - ${input.tipoInstalacao}), CIP (R$ ${cipR$.toFixed(2)}) e encargos regulatórios da concessionária (${encargosPct}%). A conta de energia não é zerada em 100% devido aos custos mínimos obrigatórios da distribuidora (${input.concessionaria || "concessionária local"}).`;

  return {
    potenciaNecessariaKwp: Number(potenciaNecessariaKwp.toFixed(2)),
    quantidadeModulosSugerida,
    quantidadeModulos,
    potenciaInstaladaKwp: Number(potenciaInstaladaKwp.toFixed(2)),
    potenciaInversorRecomendadaKw,
    potenciaInversorSelecionadaKw,
    geracaoMensalEstimadaKwh: Math.round(geracaoMensalEstimadaKwh),
    geracaoAnualEstimadaKwh: Math.round(geracaoAnualEstimadaKwh),
    areaAproximadaM2: Number(areaAproximadaM2.toFixed(1)),
    contaAtualEstimadaR$: Number(contaAtualEstimadaR$.toFixed(2)),
    custoMinimoConcessionariaR$: Number(custoMinimoConcessionariaR$.toFixed(2)),
    novaContaEstimadaR$: Number(novaContaEstimadaR$.toFixed(2)),
    economiaMensalEstimadaR$: Number(economiaMensalEstimadaR$.toFixed(2)),
    economiaAnualEstimadaR$: Number(economiaAnualEstimadaR$.toFixed(2)),
    economia25AnosEstimadaR$: Number(economia25AnosEstimadaR$.toFixed(2)),
    percentualReducaoRealConta: Number(percentualReducaoRealConta.toFixed(1)),
    paybackSimplesAnos: Number(paybackSimplesAnos.toFixed(1)),
    paybackSimplesMeses,
    observacaoRegulatoria,
  };
}

// ============================================================================
// 2. MOTOR DE CÁLCULO — AQUECIMENTO SOLAR DE ÁGUA (BOILER)
// ============================================================================

export interface BoilerSizingParams {
  litros_por_pessoa: number;
  eficiencia_coletor_pct: number;
  irradiacao_kwh_m2_dia: number;
  area_coletor_m2: number;
}

export const DEFAULT_BOILER_PARAMS: BoilerSizingParams = {
  litros_por_pessoa: 50,
  eficiencia_coletor_pct: 55,
  irradiacao_kwh_m2_dia: 4.5,
  area_coletor_m2: 2.0,
};

export const STANDARD_BOILER_VOLUMES_L = [
  200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000,
];

export interface BoilerInput {
  moradores: number;
  banheiros: number;
  chuveiros: number;
  pontosAguaQuente: number;
  consumoLitrosPessoaDia: number;
  temperaturaDesejadaC: number;
  temperaturaEntradaC: number;
  capacidadeBoilerManualL?: number;
  tipoInstalacao: "termossifao" | "circulacao_forcada" | "pressurizado";
  tipoApoioTermico: "eletrico" | "gas" | "bomba_calor";
  cidade: string;
  estado: string;
  irradiacaoKwhM2Dia: number;
  eficienciaColetorPct: number;
  areaColetorUnitarioM2: number;
}

export interface BoilerResult {
  demandaDiariaLitros: number;
  volumeRecomendadoBoilerL: number;
  volumeSelecionadoBoilerL: number;
  energiaTermicaDiariaKcal: number;
  energiaTermicaDiariaKwh: number;
  areaColetorEstimadaM2: number;
  quantidadeColetoresSugerida: number;
  quantidadeColetoresSelecionada: number;
  materiaisAcessorioSugeridos: string[];
  requerValidacaoTecnica: boolean;
  motivosValidacaoTecnica: string[];
}

export function calculateBoiler(
  input: BoilerInput,
  quantidadeColetoresManual?: number,
): BoilerResult {
  const moradores = Math.max(1, Number(input.moradores) || 4);
  const chuveiros = Math.max(1, Number(input.chuveiros) || 2);
  const pontosExtras = Math.max(0, (Number(input.pontosAguaQuente) || 4) - chuveiros);
  const litrosPessoa = Math.max(20, Number(input.consumoLitrosPessoaDia) || 50);
  const tempDesejada = Math.min(80, Math.max(35, Number(input.temperaturaDesejadaC) || 48));
  const tempEntrada = Math.min(30, Math.max(5, Number(input.temperaturaEntradaC) || 20));
  const irradiacao = Math.max(2, Number(input.irradiacaoKwhM2Dia) || 4.5);
  const eficienciaPct = Math.min(90, Math.max(25, Number(input.eficienciaColetorPct) || 55));
  const areaUnitM2 = Math.max(0.5, Number(input.areaColetorUnitarioM2) || 2.0);

  // Demanda diária: consumo por pessoa + adicional por pontos secundários (torneiras, banheiras, etc.)
  const demandaBase = moradores * litrosPessoa + pontosExtras * 15;
  const demandaMinimaPorChuveiro = chuveiros * 80;
  const demandaDiariaLitros = Math.round(
    Math.max(demandaBase, demandaMinimaPorChuveiro),
  );

  const volumeRecomendadoBoilerL =
    STANDARD_BOILER_VOLUMES_L.find((vol) => vol >= demandaDiariaLitros) ??
    Math.ceil(demandaDiariaLitros / 500) * 500;

  const volumeSelecionadoBoilerL =
    input.capacidadeBoilerManualL && input.capacidadeBoilerManualL > 0
      ? Number(input.capacidadeBoilerManualL)
      : volumeRecomendadoBoilerL;

  const deltaT = Math.max(5, tempDesejada - tempEntrada);
  // Q (kcal) = Volume (L) * 1 kcal/(kg°C) * deltaT
  const energiaTermicaDiariaKcal = volumeSelecionadoBoilerL * deltaT;
  const energiaTermicaDiariaKwh = energiaTermicaDiariaKcal / 860;

  // Área de coletores = Energia (kWh/dia) / (Irradiação * Eficiência)
  const rendimentoColetor = eficienciaPct / 100;
  const areaColetorEstimadaM2 =
    irradiacao * rendimentoColetor > 0
      ? energiaTermicaDiariaKwh / (irradiacao * rendimentoColetor)
      : 0;

  const quantidadeColetoresSugerida = Math.max(
    1,
    Math.ceil(areaColetorEstimadaM2 / areaUnitM2),
  );

  const quantidadeColetoresSelecionada =
    quantidadeColetoresManual && quantidadeColetoresManual > 0
      ? Math.round(quantidadeColetoresManual)
      : quantidadeColetoresSugerida;

  const materiaisAcessorioSugeridos: string[] = [
    `Reservatório Térmico (Boiler) Inox ${volumeSelecionadoBoilerL}L (${
      input.tipoInstalacao === "pressurizado" ? "Alta Pressão" : "Baixa Pressão"
    })`,
    `${quantidadeColetoresSelecionada}x Coletor Solar Placa Plana (${areaUnitM2.toFixed(1)} m²)`,
    "Válvula Eliminadora de Ar + Válvula de Segurança/Alívio Térmico",
    "Kit Tubulação Termorresistente (Cobre / CPVC Aquatherm) e Isolamento Térmico Elastômero",
  ];

  if (
    input.tipoInstalacao === "circulacao_forcada" ||
    input.tipoInstalacao === "pressurizado" ||
    volumeSelecionadoBoilerL >= 600
  ) {
    materiaisAcessorioSugeridos.push(
      "Controlador Diferencial de Temperatura Digital (CDT) + Sensores NTC",
      "Motobomba de Recirculação para Água Quente (Bronze/Inox)",
    );
  }
  if (input.tipoInstalacao === "pressurizado") {
    materiaisAcessorioSugeridos.push(
      "Vaso de Expansão Térmica + Válvula Misturadora Termostática",
    );
  }

  const motivosValidacaoTecnica: string[] = [];
  if (volumeSelecionadoBoilerL >= 1000) {
    motivosValidacaoTecnica.push(
      "Sistema de grande porte (≥ 1.000L): requer verificação estrutural da laje/telhado e projeto hidráulico dedicado.",
    );
  }
  if (volumeSelecionadoBoilerL < demandaDiariaLitros * 0.85) {
    motivosValidacaoTecnica.push(
      `Boiler selecionado (${volumeSelecionadoBoilerL}L) é inferior à demanda estimada (${demandaDiariaLitros}L/dia). O apoio térmico (${input.tipoApoioTermico}) será acionado com maior frequência.`,
    );
  }
  if (deltaT > 38) {
    motivosValidacaoTecnica.push(
      `Diferencial térmico elevado (ΔT = ${deltaT}°C). Recomenda-se coletor de alta eficiência ou validação de isolamento térmico.`,
    );
  }
  if (chuveiros >= 4 && input.tipoInstalacao === "termossifao") {
    motivosValidacaoTecnica.push(
      "Múltiplos chuveiros (4+) em sistema por termossifão: recomenda-se avaliar circulação forçada com anel de recirculação.",
    );
  }

  return {
    demandaDiariaLitros,
    volumeRecomendadoBoilerL,
    volumeSelecionadoBoilerL,
    energiaTermicaDiariaKcal: Math.round(energiaTermicaDiariaKcal),
    energiaTermicaDiariaKwh: Number(energiaTermicaDiariaKwh.toFixed(2)),
    areaColetorEstimadaM2: Number(areaColetorEstimadaM2.toFixed(2)),
    quantidadeColetoresSugerida,
    quantidadeColetoresSelecionada,
    materiaisAcessorioSugeridos,
    requerValidacaoTecnica: motivosValidacaoTecnica.length > 0,
    motivosValidacaoTecnica,
  };
}

// ============================================================================
// 3. MOTOR DE CÁLCULO — AQUECIMENTO DE PISCINAS
// ============================================================================

export interface PoolSizingParams {
  perda_diaria_c_aberta: number;
  perda_diaria_c_capa: number;
  razao_area_coletor: number;
  area_coletor_m2: number;
}

export const DEFAULT_POOL_PARAMS: PoolSizingParams = {
  perda_diaria_c_aberta: 2.2,
  perda_diaria_c_capa: 1.0,
  razao_area_coletor: 0.85,
  area_coletor_m2: 3.3,
};

export interface PoolInput {
  comprimentoM: number;
  larguraM: number;
  profundidadeMediaM: number;
  volumeManualM3?: number;
  cidade: string;
  estado: string;
  ambiente: "aberta" | "coberta";
  usoCapaTermica: boolean;
  exposicaoVento: "baixa" | "media" | "alta";
  temperaturaDesejadaC: number;
  temperaturaInicialC: number;
  periodoUtilizacao: "ano_todo" | "primavera_verao" | "fins_de_semana";
  tipoAquecimento: "solar" | "bomba_calor" | "hibrido";
  areaDisponivelColetoresM2: number;
  areaColetorUnitarioM2: number;
  razaoBaseAreaColetor: number;
  perdaDiariaAbertaC: number;
  perdaDiariaComCapaC: number;
}

export interface PoolResult {
  areaSuperficieM2: number;
  volumeCalculadoM3: number;
  volumeLitros: number;
  energiaAquecimentoInicialKcal: number;
  energiaAquecimentoInicialKwh: number;
  perdaDiariaEstimadaC: number;
  demandaManutencaoDiariaKcal: number;
  demandaManutencaoDiariaKwh: number;
  fatorDimensionamento: number;
  areaRecomendadaColetoresM2: number;
  quantidadeColetoresSugerida: number;
  quantidadeColetoresSelecionada: number;
  potenciaBombaCalorSugeridaKw: number;
  vazaoRecomendadaM3h: number;
  equipamentosAuxiliares: string[];
  alertaAreaInsuficiente: boolean;
  avisoTecnicoCondicoes: string;
}

export function calculatePool(
  input: PoolInput,
  quantidadeColetoresManual?: number,
): PoolResult {
  const comp = Math.max(1, Number(input.comprimentoM) || 8);
  const larg = Math.max(1, Number(input.larguraM) || 4);
  const prof = Math.max(0.4, Number(input.profundidadeMediaM) || 1.4);

  const areaSuperficieM2 = comp * larg;
  const volumeGeometricoM3 = areaSuperficieM2 * prof;
  const volumeCalculadoM3 =
    input.volumeManualM3 && input.volumeManualM3 > 0
      ? Number(input.volumeManualM3)
      : volumeGeometricoM3;
  const volumeLitros = volumeCalculadoM3 * 1000;

  const tempDesejada = Math.min(36, Math.max(24, Number(input.temperaturaDesejadaC) || 29));
  const tempInicial = Math.min(28, Math.max(10, Number(input.temperaturaInicialC) || 21));
  const deltaTInicial = Math.max(2, tempDesejada - tempInicial);

  const energiaAquecimentoInicialKcal = volumeLitros * deltaTInicial;
  const energiaAquecimentoInicialKwh = energiaAquecimentoInicialKcal / 860;

  // Perda térmica diária considerando cobertura, ambiente e vento
  const perdaBase = input.usoCapaTermica
    ? Number(input.perdaDiariaComCapaC) || 1.0
    : Number(input.perdaDiariaAbertaC) || 2.2;
  const fatorAmbiente = input.ambiente === "coberta" ? 0.75 : 1.0;
  const fatorVento =
    input.exposicaoVento === "alta"
      ? 1.25
      : input.exposicaoVento === "baixa"
        ? 0.9
        : 1.05;

  const perdaDiariaEstimadaC = perdaBase * fatorAmbiente * fatorVento;
  const demandaManutencaoDiariaKcal = volumeLitros * perdaDiariaEstimadaC;
  const demandaManutencaoDiariaKwh = demandaManutencaoDiariaKcal / 860;

  // Fator de dimensionamento de área de coletores em relação à área de espelho d'água
  const razaoBase = Math.max(0.5, Number(input.razaoBaseAreaColetor) || 0.85);
  const fatorPeriodo =
    input.periodoUtilizacao === "ano_todo"
      ? 1.2
      : input.periodoUtilizacao === "fins_de_semana"
        ? 1.0
        : 0.9;
  const fatorCapa = input.usoCapaTermica ? 0.9 : 1.2;
  const fatorTemp = tempDesejada > 29 ? 1 + (tempDesejada - 29) * 0.08 : 1.0;

  const fatorDimensionamento =
    razaoBase * fatorAmbiente * fatorVento * fatorPeriodo * fatorCapa * fatorTemp;

  const areaRecomendadaColetoresM2 =
    input.tipoAquecimento === "bomba_calor"
      ? 0
      : areaSuperficieM2 * fatorDimensionamento;

  const areaUnitM2 = Math.max(1, Number(input.areaColetorUnitarioM2) || 3.3);
  const quantidadeColetoresSugerida =
    input.tipoAquecimento === "bomba_calor"
      ? 0
      : Math.max(1, Math.ceil(areaRecomendadaColetoresM2 / areaUnitM2));

  const quantidadeColetoresSelecionada =
    quantidadeColetoresManual && quantidadeColetoresManual > 0
      ? Math.round(quantidadeColetoresManual)
      : quantidadeColetoresSugerida;

  // Potência térmica sugerida para Bomba de Calor (trocador de calor) considerando reposição em ~10h/dia
  const potenciaBombaCalorSugeridaKw = Number(
    Math.max(5, demandaManutencaoDiariaKwh / 8).toFixed(1),
  );

  // Vazão recomendada (~140 L/h por m² de coletor)
  const vazaoRecomendadaM3h = Number(
    (((quantidadeColetoresSelecionada * areaUnitM2) * 145) / 1000).toFixed(1),
  );

  const equipamentosAuxiliares: string[] = [];
  if (input.tipoAquecimento !== "bomba_calor") {
    equipamentosAuxiliares.push(
      `${quantidadeColetoresSelecionada}x Coletor Solar Polipropileno para Piscina (${areaUnitM2.toFixed(1)} m²)`,
      `Motobomba Centrífuga de Circulação (${Math.max(0.5, Number((vazaoRecomendadaM3h / 8).toFixed(1)))} cv - vazão est. ${vazaoRecomendadaM3h} m³/h)`,
      "Controlador Diferencial de Temperatura Digital com 2 Sensores (Piscina / Telhado)",
      "Válvula Quebra-Vácuo + Válvula de Retenção em PVC/CPVC",
      "Kit de União, Adaptadores e Tubulação Hidráulica de Retorno",
    );
  }
  if (
    input.tipoAquecimento === "bomba_calor" ||
    input.tipoAquecimento === "hibrido"
  ) {
    equipamentosAuxiliares.push(
      `Trocador de Calor (Bomba de Calor) Inverter ~${potenciaBombaCalorSugeridaKw} kW Térmicos`,
      "Quadro de Comando Elétrico com Disjuntor e DPS Dedicado",
    );
  }
  if (!input.usoCapaTermica) {
    equipamentosAuxiliares.push(
      `Capa Térmica Bolha (${areaSuperficieM2.toFixed(1)} m²) — Altamente recomendada para reduzir perdas noturnas em até 60%`,
    );
  }

  const areaDisp = Number(input.areaDisponivelColetoresM2) || 0;
  const alertaAreaInsuficiente =
    input.tipoAquecimento !== "bomba_calor" &&
    areaDisp > 0 &&
    areaDisp < areaRecomendadaColetoresM2;

  const avisoTecnicoCondicoes =
    "Nota Técnica Importante: O desempenho térmico e o tempo de aquecimento inicial dependem diretamente da radiação solar incidente, velocidade do vento, temperatura ambiente noturna e uso regular de capa térmica. Sistemas solares não garantem temperatura fixa em períodos chuvosos ou de inverno rigoroso sem sistema de apoio térmico complementar (bomba de calor/híbrido).";

  return {
    areaSuperficieM2: Number(areaSuperficieM2.toFixed(2)),
    volumeCalculadoM3: Number(volumeCalculadoM3.toFixed(2)),
    volumeLitros: Math.round(volumeLitros),
    energiaAquecimentoInicialKcal: Math.round(energiaAquecimentoInicialKcal),
    energiaAquecimentoInicialKwh: Number(
      energiaAquecimentoInicialKwh.toFixed(1),
    ),
    perdaDiariaEstimadaC: Number(perdaDiariaEstimadaC.toFixed(2)),
    demandaManutencaoDiariaKcal: Math.round(demandaManutencaoDiariaKcal),
    demandaManutencaoDiariaKwh: Number(demandaManutencaoDiariaKwh.toFixed(1)),
    fatorDimensionamento: Number(fatorDimensionamento.toFixed(2)),
    areaRecomendadaColetoresM2: Number(areaRecomendadaColetoresM2.toFixed(1)),
    quantidadeColetoresSugerida,
    quantidadeColetoresSelecionada,
    potenciaBombaCalorSugeridaKw,
    vazaoRecomendadaM3h,
    equipamentosAuxiliares,
    alertaAreaInsuficiente,
    avisoTecnicoCondicoes,
  };
}

// ============================================================================
// 4. MOTOR DE PRECIFICAÇÃO COMERCIAL (MARGEM VS MARKUP)
// ============================================================================

export interface QuoteItemDraft {
  id: string;
  product_id: string | null;
  description: string;
  category_slug: string | null;
  unit: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  sort_order: number;
}

export interface CommercialPricingInput {
  items: QuoteItemDraft[];
  laborCost: number;
  travelCost: number;
  freightCost: number;
  extraCost: number;
  taxPct: number;
  marginPct: number;
  pricingMode: "margin_on_sale" | "markup_on_cost";
  discount: number;
}

export interface CommercialPricingResult {
  custoEquipamentos: number;
  custoMateriaisAuxiliares: number;
  custoServicosCatalogo: number;
  custoItensTotal: number;
  precoVendaItensTabela: number;
  custoMaoDeObra: number;
  custoDeslocamento: number;
  custoFrete: number;
  custoDespesasExtras: number;
  custoDiretoTotal: number;
  subtotalAntesDesconto: number;
  descontoValor: number;
  valorFinal: number;
  tributosEstimadosValor: number;
  lucroBrutoEstimado: number;
  margemSobreVendaFinalPct: number;
  markupEfetivoSobreCustoPct: number;
}

const AUXILIARY_CATEGORY_SLUGS = new Set([
  "estruturas",
  "cabos",
  "protecoes",
  "tubulacoes",
  "conexoes",
  "acessorios",
]);

export function calculateCommercialPricing(
  input: CommercialPricingInput,
): CommercialPricingResult {
  let custoEquipamentos = 0;
  let custoMateriaisAuxiliares = 0;
  let custoServicosCatalogo = 0;
  let precoVendaItensTabela = 0;

  for (const item of input.items) {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const cost = Math.max(0, Number(item.unit_cost) || 0) * qty;
    const price = Math.max(0, Number(item.unit_price) || 0) * qty;
    precoVendaItensTabela += price;

    const slug = item.category_slug || "";
    if (slug === "servicos") {
      custoServicosCatalogo += cost;
    } else if (AUXILIARY_CATEGORY_SLUGS.has(slug)) {
      custoMateriaisAuxiliares += cost;
    } else {
      custoEquipamentos += cost;
    }
  }

  const custoItensTotal =
    custoEquipamentos + custoMateriaisAuxiliares + custoServicosCatalogo;
  const custoMaoDeObra = Math.max(0, Number(input.laborCost) || 0);
  const custoDeslocamento = Math.max(0, Number(input.travelCost) || 0);
  const custoFrete = Math.max(0, Number(input.freightCost) || 0);
  const custoDespesasExtras = Math.max(0, Number(input.extraCost) || 0);

  const custoOperacionalAdicional =
    custoMaoDeObra + custoDeslocamento + custoFrete + custoDespesasExtras;
  const custoDiretoTotal = custoItensTotal + custoOperacionalAdicional;

  const taxPct = Math.min(45, Math.max(0, Number(input.taxPct) || 0));
  const marginPct = Math.min(85, Math.max(0, Number(input.marginPct) || 0));
  const descontoValor = Math.max(0, Number(input.discount) || 0);

  // Cálculo do preço antes do desconto
  // Se os itens já têm preço de venda cadastrado maior que o custo e marginPct == 0, usa a tabela + custos extras
  let subtotalAntesDesconto = 0;
  if (custoDiretoTotal > 0) {
    if (input.pricingMode === "margin_on_sale") {
      // Preço = Custo / (1 - (Margem% + Tributos%)/100)
      const divisor = Math.max(0.1, 1 - (marginPct + taxPct) / 100);
      subtotalAntesDesconto = custoDiretoTotal / divisor;
    } else {
      // Markup sobre custo: Preço = Custo * (1 + Markup%/100) / (1 - Tributos%/100)
      const comMarkup = custoDiretoTotal * (1 + marginPct / 100);
      const divisorImposto = Math.max(0.2, 1 - taxPct / 100);
      subtotalAntesDesconto = comMarkup / divisorImposto;
    }
  } else if (precoVendaItensTabela > 0) {
    subtotalAntesDesconto = precoVendaItensTabela + custoOperacionalAdicional;
  }

  // Se o subtotal calculado ficar menor que a soma dos preços de venda já definidos nos itens (quando marginPct == 0), respeita o preço dos itens
  if (marginPct === 0 && precoVendaItensTabela > 0) {
    const divisorImposto = Math.max(0.2, 1 - taxPct / 100);
    subtotalAntesDesconto =
      (precoVendaItensTabela + custoOperacionalAdicional) / divisorImposto;
  }

  const valorFinal = Math.max(0, subtotalAntesDesconto - descontoValor);
  const tributosEstimadosValor = valorFinal * (taxPct / 100);
  const lucroBrutoEstimado =
    valorFinal - custoDiretoTotal - tributosEstimadosValor;

  const margemSobreVendaFinalPct =
    valorFinal > 0 ? (lucroBrutoEstimado / valorFinal) * 100 : 0;
  const markupEfetivoSobreCustoPct =
    custoDiretoTotal > 0
      ? ((valorFinal - custoDiretoTotal) / custoDiretoTotal) * 100
      : 0;

  return {
    custoEquipamentos: Number(custoEquipamentos.toFixed(2)),
    custoMateriaisAuxiliares: Number(custoMateriaisAuxiliares.toFixed(2)),
    custoServicosCatalogo: Number(custoServicosCatalogo.toFixed(2)),
    custoItensTotal: Number(custoItensTotal.toFixed(2)),
    precoVendaItensTabela: Number(precoVendaItensTabela.toFixed(2)),
    custoMaoDeObra: Number(custoMaoDeObra.toFixed(2)),
    custoDeslocamento: Number(custoDeslocamento.toFixed(2)),
    custoFrete: Number(custoFrete.toFixed(2)),
    custoDespesasExtras: Number(custoDespesasExtras.toFixed(2)),
    custoDiretoTotal: Number(custoDiretoTotal.toFixed(2)),
    subtotalAntesDesconto: Number(subtotalAntesDesconto.toFixed(2)),
    descontoValor: Number(descontoValor.toFixed(2)),
    valorFinal: Number(valorFinal.toFixed(2)),
    tributosEstimadosValor: Number(tributosEstimadosValor.toFixed(2)),
    lucroBrutoEstimado: Number(lucroBrutoEstimado.toFixed(2)),
    margemSobreVendaFinalPct: Number(margemSobreVendaFinalPct.toFixed(1)),
    markupEfetivoSobreCustoPct: Number(markupEfetivoSobreCustoPct.toFixed(1)),
  };
}
