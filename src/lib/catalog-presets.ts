export interface PresetProductItem {
  code: string;
  category_slug: string;
  manufacturer: string;
  model: string;
  description: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  supplier: string;
  specs: Record<string, string | number>;
}

export const INITIAL_SOLAR_CATALOG_PRESETS: PresetProductItem[] = [
  {
    code: "MOD-550-N",
    category_slug: "modulos",
    manufacturer: "Canadian Solar",
    model: "HiKu6 CS6W-550MS",
    description: "Módulo Fotovoltaico Monocristalino Half-Cell 550W",
    unit: "un",
    cost_price: 520,
    sale_price: 690,
    supplier: "Distribuidora Solar BR",
    specs: { potencia_w: 550, eficiencia_pct: 21.3, area_m2: 2.58, garantia_anos: 15 },
  },
  {
    code: "MOD-585-TOP",
    category_slug: "modulos",
    manufacturer: "Jinko Solar",
    model: "Tiger Neo N-Type 585W",
    description: "Módulo Fotovoltaico N-Type TOPCon Bifacial 585W",
    unit: "un",
    cost_price: 560,
    sale_price: 750,
    supplier: "Distribuidora Solar BR",
    specs: { potencia_w: 585, eficiencia_pct: 22.6, area_m2: 2.58, garantia_anos: 15 },
  },
  {
    code: "INV-5K-MONO",
    category_slug: "inversores",
    manufacturer: "Growatt",
    model: "MIN 5000TL-X",
    description: "Inversor On-Grid Monofásico 5kW 220V 2 MPPT Wi-Fi",
    unit: "un",
    cost_price: 2450,
    sale_price: 3390,
    supplier: "Aldo Solar",
    specs: { potencia_kw: 5, mppt: 2, tensao: "220V Monofásico", garantia_anos: 10 },
  },
  {
    code: "INV-8K-MONO",
    category_slug: "inversores",
    manufacturer: "Sungrow",
    model: "SG8.0RS",
    description: "Inversor On-Grid 8kW 220V 3 MPPT com AFCI Integrado",
    unit: "un",
    cost_price: 3890,
    sale_price: 5290,
    supplier: "Aldo Solar",
    specs: { potencia_kw: 8, mppt: 3, tensao: "220V", garantia_anos: 10 },
  },
  {
    code: "INV-15K-TRI",
    category_slug: "inversores",
    manufacturer: "WEG",
    model: "SIW500H ST015",
    description: "Inversor Trifásico 15kW 380V Alta Eficiência",
    unit: "un",
    cost_price: 5900,
    sale_price: 7990,
    supplier: "WEG Solar",
    specs: { potencia_kw: 15, mppt: 2, tensao: "380V Trifásico", garantia_anos: 10 },
  },
  {
    code: "MIC-2000-4T",
    category_slug: "microinversores",
    manufacturer: "Hoymiles",
    model: "HMS-2000-4T",
    description: "Microinversor Quádruplo 2000W 4 MPPT Independentes",
    unit: "un",
    cost_price: 1380,
    sale_price: 1890,
    supplier: "Genyx",
    specs: { potencia_kw: 2, mppt: 4, garantia_anos: 12 },
  },
  {
    code: "EST-CER-4M",
    category_slug: "estruturas",
    manufacturer: "Romagnole",
    model: "Kit Telhado Cerâmico 4 Módulos",
    description: "Estrutura em Alumínio Anodizado e Inox p/ 4 Módulos (Telha Colonial)",
    unit: "kit",
    cost_price: 380,
    sale_price: 540,
    supplier: "Romagnole",
    specs: { capacidade_modulos: 4, material: "Alumínio 6063-T5 / Inox 304" },
  },
  {
    code: "CAB-SOL-6MM",
    category_slug: "cabos",
    manufacturer: "Cobrecom",
    model: "Cabo Solar 6mm² 1.8kV CC + Par MC4",
    description: "Kit Cabo Fotovoltaico 6mm² Preto/Vermelho c/ Conectores MC4",
    unit: "kit",
    cost_price: 340,
    sale_price: 490,
    supplier: "Elétrica Solar",
    specs: { secao_mm2: 6, tensao_max: "1800V DC" },
  },
  {
    code: "PROT-STR-BOX",
    category_slug: "protecoes",
    manufacturer: "Clamper",
    model: "String Box CC/CA Pro",
    description: "Quadro de Proteção CA/CC com DPS Clamper e Disjuntor Termomagnético",
    unit: "un",
    cost_price: 420,
    sale_price: 620,
    supplier: "Clamper",
    specs: { classe_dps: "Classe II", protecao: "IP65" },
  },
  {
    code: "BOI-400-INOX",
    category_slug: "boilers",
    manufacturer: "Bosch / Heliotek",
    model: "Reservatório Térmico 400L Inox 316L",
    description: "Boiler Solar 400 Litros Aço Inox 316L com Apoio Elétrico",
    unit: "un",
    cost_price: 3150,
    sale_price: 4390,
    supplier: "Heliotek",
    specs: { volume_l: 400, material: "Inox 316L", isolamento: "Poliuretano Expandido" },
  },
  {
    code: "BOI-600-AP",
    category_slug: "boilers",
    manufacturer: "Soletrol",
    model: "Boiler 600L Alta Pressão Inox",
    description: "Reservatório Térmico 600 Litros Alta Pressão Inox 316L",
    unit: "un",
    cost_price: 4890,
    sale_price: 6750,
    supplier: "Soletrol",
    specs: { volume_l: 600, pressao_mca: 40, material: "Inox 316L" },
  },
  {
    code: "COL-AGUA-2M",
    category_slug: "coletores_agua",
    manufacturer: "Heliotek",
    model: "MC1000 2,0m²",
    description: "Coletor Solar Placa Plana Vidro Temperado 2,0m² Aletas em Alumínio/Cobre",
    unit: "un",
    cost_price: 890,
    sale_price: 1290,
    supplier: "Heliotek",
    specs: { area_m2: 2.0, classificacao_inmetro: "A" },
  },
  {
    code: "COL-PISC-33",
    category_slug: "coletores_piscina",
    manufacturer: "Sodramar / Girassol",
    model: "Placa Espiral Polipropileno 3,3m²",
    description: "Coletor Solar para Piscina em Polipropileno Virgem UV 3,3m²",
    unit: "un",
    cost_price: 390,
    sale_price: 580,
    supplier: "Sodramar",
    specs: { area_m2: 3.3, vazao_lh: 450 },
  },
  {
    code: "BOM-CDT-KIT",
    category_slug: "bombas",
    manufacturer: "Full Gauge + Syllent",
    model: "Kit Bomba Silenciosa + CDT Microsol",
    description: "Motobomba de Circulação Água Quente + Controlador Diferencial Digital",
    unit: "kit",
    cost_price: 1150,
    sale_price: 1650,
    supplier: "Full Gauge",
    specs: { potencia_cv: 0.5, sensores: 2 },
  },
  {
    code: "SRV-ENG-INST",
    category_slug: "servicos",
    manufacturer: "GT Solar Engenharia",
    model: "Projeto, Homologação e Instalação",
    description: "Serviço Completo de Engenharia, ART, Homologação na Concessionária e Instalação",
    unit: "sv",
    cost_price: 1800,
    sale_price: 2800,
    supplier: "Equipe Própria GT Solar",
    specs: { inclui_art: "Sim", garantia_instalacao_meses: 12 },
  },
];

export function generateSampleProductsCsv(): string {
  const header =
    "codigo;categoria_slug;fabricante;modelo;descricao;unidade;preco_custo;preco_venda;fornecedor";
  const rows = [
    "MOD-550-CS;modulos;Canadian Solar;CS6W-550MS;Módulo Fotovoltaico 550W Monocristalino;un;520.00;690.00;Distribuidora Solar",
    "INV-5K-GW;inversores;Growatt;MIN 5000TL-X;Inversor Solar Monofásico 5kW 2 MPPT;un;2450.00;3390.00;Aldo Solar",
    "BOI-400-HT;boilers;Heliotek;Inox 400L;Reservatório Térmico Boiler 400L Inox;un;3150.00;4390.00;Heliotek",
    "COL-PISC-33;coletores_piscina;Sodramar;Placa 3.3m2;Coletor Solar para Piscina 3,3m²;un;390.00;580.00;Sodramar",
  ];
  return [header, ...rows].join("\n");
}

export interface ParsedCsvProduct {
  code: string;
  category_slug: string;
  manufacturer: string;
  model: string;
  description: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  supplier: string;
}

export function parseProductsCsv(csvText: string): ParsedCsvProduct[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return [];

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const result: ParsedCsvProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 5) continue;

    const [
      code = "",
      category_slug = "modulos",
      manufacturer = "",
      model = "",
      description = "",
      unit = "un",
      costRaw = "0",
      saleRaw = "0",
      supplier = "",
    ] = cols;

    if (!description && !model) continue;

    const cost_price =
      Number(costRaw.replace(/\./g, "").replace(",", ".")) ||
      Number(costRaw) ||
      0;
    const sale_price =
      Number(saleRaw.replace(/\./g, "").replace(",", ".")) ||
      Number(saleRaw) ||
      0;

    result.push({
      code: code || `PRD-${100 + i}`,
      category_slug: category_slug || "modulos",
      manufacturer,
      model,
      description: description || `${manufacturer} ${model}`.trim(),
      unit: unit || "un",
      cost_price,
      sale_price,
      supplier,
    });
  }

  return result;
}
