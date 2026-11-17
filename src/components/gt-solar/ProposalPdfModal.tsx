import {
  formatBRL,
  formatDateBR,
  formatNumber,
  QUOTE_MODALITY_META,
  type BoilerResult,
  type PhotovoltaicResult,
  type PoolResult,
  type QuoteItemDraft,
  type QuoteModality,
} from "@/lib/calculators";
import type { ClientRow, CompanySettingsRow } from "@/lib/gt-solar-store";
import { Printer, Share2, X, Building2 } from "lucide-react";

export interface ProposalPdfData {
  number: string;
  revision: number;
  createdAt: string;
  validUntil: string | null;
  modality: QuoteModality;
  title: string | null;
  sellerName: string;
  sellerPhone?: string | null;
  client: ClientRow | null;
  company: CompanySettingsRow | null;
  sizingInput: Record<string, any>;
  sizingResult: Record<string, any>;
  items: QuoteItemDraft[];
  subtotalBeforeDiscount: number;
  discount: number;
  totalValue: number;
  paymentTerms: string | null;
  executionDays: number | null;
  notes: string | null;
}

interface ProposalPdfModalProps {
  proposal: ProposalPdfData;
  onClose: () => void;
}

export function ProposalPdfModal({ proposal, onClose }: ProposalPdfModalProps) {
  const modMeta = QUOTE_MODALITY_META[proposal.modality];
  const comp = proposal.company;
  const cli = proposal.client;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const clientPhoneRaw = (cli?.whatsapp || cli?.phone || "").replace(
      /\D/g,
      "",
    );
    const phoneWithCountry =
      clientPhoneRaw.length >= 10
        ? clientPhoneRaw.startsWith("55")
          ? clientPhoneRaw
          : `55${clientPhoneRaw}`
        : "";

    const lines = [
      `*${comp?.trade_name || "GT Solar"} — Proposta Comercial ${proposal.number}*`,
      `Olá${cli?.name ? `, *${cli.name}*` : ""}! Segue o resumo da sua proposta:`,
      ``,
      `• *Modalidade:* ${modMeta.label}`,
      ...(proposal.modality === "fotovoltaico" &&
      proposal.sizingResult?.potenciaInstaladaKwp
        ? [
            `• *Potência Instalada:* ${formatNumber(proposal.sizingResult.potenciaInstaladaKwp, 2)} kWp (${proposal.sizingResult.quantidadeModulos} módulos)`,
            `• *Geração Média Estimada:* ${formatNumber(proposal.sizingResult.geracaoMensalEstimadaKwh, 0)} kWh/mês`,
            `• *Economia Anual Estimada:* ${formatBRL(proposal.sizingResult.economiaAnualEstimadaR$)}`,
          ]
        : []),
      ...(proposal.modality === "boiler" &&
      proposal.sizingResult?.volumeSelecionadoBoilerL
        ? [
            `• *Reservatório Térmico (Boiler):* ${proposal.sizingResult.volumeSelecionadoBoilerL} Litros`,
            `• *Coletores Solares:* ${proposal.sizingResult.quantidadeColetoresSelecionada} un (${formatNumber(proposal.sizingResult.areaColetorEstimadaM2, 1)} m²)`,
          ]
        : []),
      ...(proposal.modality === "piscina" &&
      proposal.sizingResult?.volumeCalculadoM3
        ? [
            `• *Volume da Piscina:* ${formatNumber(proposal.sizingResult.volumeCalculadoM3, 1)} m³`,
            `• *Coletores Dimensionados:* ${proposal.sizingResult.quantidadeColetoresSelecionada} un (${formatNumber(proposal.sizingResult.areaRecomendadaColetoresM2, 1)} m²)`,
          ]
        : []),
      `• *Investimento Total:* ${formatBRL(proposal.totalValue)}`,
      `• *Condições de Pagamento:* ${proposal.paymentTerms || comp?.payment_terms || "A combinar"}`,
      `• *Validade da Proposta:* ${formatDateBR(proposal.validUntil)}`,
      ``,
      `Consultor Comercial: ${proposal.sellerName}`,
    ];

    const text = encodeURIComponent(lines.join("\n"));
    const url = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const pvRes =
    proposal.modality === "fotovoltaico"
      ? (proposal.sizingResult as unknown as PhotovoltaicResult)
      : null;
  const boilerRes =
    proposal.modality === "boiler"
      ? (proposal.sizingResult as unknown as BoilerResult)
      : null;
  const poolRes =
    proposal.modality === "piscina"
      ? (proposal.sizingResult as unknown as PoolResult)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 print:shadow-none print:border-none print:rounded-none print:max-w-none">
        {/* Barra de ferramentas superior (oculta na impressão) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Visualização da Proposta Oficial
            </span>
            <h3 className="text-base font-bold">
              {proposal.number}{" "}
              {proposal.revision > 0 ? `(Revisão ${proposal.revision})` : ""} —{" "}
              {cli?.name || "Cliente"}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar WhatsApp
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Gerar PDF / Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Fechar visualização"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo da Proposta Comercial */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 text-sm">
          {/* Cabeçalho Institucional GT Solar */}
          <div className="border-b-4 border-orange-500 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {comp?.logo_url ? (
                <img
                  src={comp.logo_url}
                  alt={comp.trade_name || "GT Solar"}
                  className="h-16 w-auto max-w-[200px] object-contain"
                />
              ) : (
                <div className="h-16 px-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Building2 className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>Logotipo Oficial {comp?.trade_name || "GT Solar"}</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-extrabold text-[#0F2942] tracking-tight">
                  {comp?.trade_name || "GT Solar"}
                </h1>
                {comp?.legal_name && (
                  <p className="text-xs text-slate-500">{comp.legal_name}</p>
                )}
                <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                  {comp?.cnpj && <div>CNPJ: {comp.cnpj}</div>}
                  {(comp?.phone || comp?.whatsapp) && (
                    <div>
                      Tel/WhatsApp: {comp?.whatsapp || comp?.phone}
                      {comp?.email ? ` • ${comp.email}` : ""}
                    </div>
                  )}
                  {comp?.address && <div>{comp.address}</div>}
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[230px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Proposta Técnica & Comercial
              </div>
              <div className="text-xl font-black text-[#0F2942] mt-0.5">
                Nº {proposal.number}
                {proposal.revision > 0 ? ` • Rev. ${proposal.revision}` : ""}
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                <div>
                  <strong>Emissão:</strong> {formatDateBR(proposal.createdAt)}
                </div>
                <div>
                  <strong>Validade:</strong> {formatDateBR(proposal.validUntil)}
                </div>
                <div>
                  <strong>Vendedor:</strong> {proposal.sellerName}
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Cliente e Modalidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-break-inside-avoid">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F2942] mb-2">
                Dados do Cliente
              </div>
              {cli ? (
                <div className="text-xs space-y-1 text-slate-700">
                  <div>
                    <strong>Nome / Razão Social:</strong> {cli.name}
                  </div>
                  {cli.document && (
                    <div>
                      <strong>CPF / CNPJ:</strong> {cli.document}
                    </div>
                  )}
                  {(cli.phone || cli.whatsapp) && (
                    <div>
                      <strong>Telefone / WhatsApp:</strong>{" "}
                      {cli.whatsapp || cli.phone}
                    </div>
                  )}
                  {cli.email && (
                    <div>
                      <strong>E-mail:</strong> {cli.email}
                    </div>
                  )}
                  {(cli.address || cli.city) && (
                    <div>
                      <strong>Localização:</strong>{" "}
                      {[cli.address, cli.city, cli.state, cli.cep]
                        .filter(Boolean)
                        .join(" — ")}
                    </div>
                  )}
                  <div>
                    <strong>Perfil do Imóvel:</strong>{" "}
                    <span className="capitalize">{cli.client_type}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Cliente não especificado no rascunho.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-orange-200 p-4 bg-orange-50/40">
              <div className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-2">
                Modalidade e Escopo da Solução
              </div>
              <div className="text-base font-bold text-[#0F2942]">
                {modMeta.label}
              </div>
              {proposal.title && (
                <div className="text-xs font-medium text-slate-700 mt-1">
                  {proposal.title}
                </div>
              )}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {comp?.proposal_text ||
                  "A GT Solar apresenta abaixo o estudo técnico personalizado e a proposta comercial para fornecimento de equipamentos de alta performance e engenharia especializada."}
              </p>
            </div>
          </div>

          {/* Resumo Técnico por Modalidade */}
          {pvRes && pvRes.potenciaInstaladaKwp > 0 && (
            <div className="rounded-xl border border-slate-200 p-5 print-break-inside-avoid">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] mb-3 border-b border-slate-200 pb-2">
                Dimensionamento Técnico — Sistema Solar Fotovoltaico e Geração
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Potência Instalada</div>
                  <div className="text-base font-bold text-orange-600 mt-0.5">
                    {formatNumber(pvRes.potenciaInstaladaKwp, 2)} kWp
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Módulos / Inversor</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {pvRes.quantidadeModulos}x{" "}
                    {proposal.sizingInput?.potenciaModuloW || 550}W • Inv.{" "}
                    {pvRes.potenciaInversorSelecionadaKw} kW
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Geração Mensal / Anual</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {formatNumber(pvRes.geracaoMensalEstimadaKwh, 0)} kWh/mês (
                    {formatNumber(pvRes.geracaoAnualEstimadaKwh, 0)} kWh/ano)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Área Necessária</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    ~{formatNumber(pvRes.areaAproximadaM2, 1)} m² (
                    {proposal.sizingInput?.tipoTelhado || "Telhado"})
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-700">Economia Mensal Est.</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">
                    {formatBRL(pvRes.economiaMensalEstimadaR$)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-700">Economia Anual Est.</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">
                    {formatBRL(pvRes.economiaAnualEstimadaR$)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-700">Acumulado 25 Anos</div>
                  <div className="text-sm font-bold text-emerald-800 mt-0.5">
                    {formatBRL(pvRes.economia25AnosEstimadaR$)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                  <div className="text-sky-700">Payback Simples Est.</div>
                  <div className="text-base font-bold text-sky-900 mt-0.5">
                    {pvRes.paybackSimplesAnos > 0
                      ? `${formatNumber(pvRes.paybackSimplesAnos, 1)} anos (${pvRes.paybackSimplesMeses} meses)`
                      : "Conforme investimento"}
                  </div>
                </div>
              </div>
              {pvRes.observacaoRegulatoria && (
                <p className="mt-2.5 text-[11px] text-slate-500">
                  {pvRes.observacaoRegulatoria}
                </p>
              )}
            </div>
          )}

          {boilerRes && boilerRes.volumeSelecionadoBoilerL > 0 && (
            <div className="rounded-xl border border-slate-200 p-5 print-break-inside-avoid">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] mb-3 border-b border-slate-200 pb-2">
                Dimensionamento Técnico — Aquecimento Solar de Água (Boiler)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Capacidade do Boiler</div>
                  <div className="text-base font-bold text-sky-700 mt-0.5">
                    {boilerRes.volumeSelecionadoBoilerL} Litros
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Demanda Diária Est.</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {boilerRes.demandaDiariaLitros} L/dia (
                    {proposal.sizingInput?.moradores || 4} usuários)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Coletores Solares</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {boilerRes.quantidadeColetoresSelecionada} un (
                    {formatNumber(boilerRes.areaColetorEstimadaM2, 1)} m²)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Energia Térmica Diária</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {formatNumber(boilerRes.energiaTermicaDiariaKwh, 1)} kWh/dia
                  </div>
                </div>
              </div>
            </div>
          )}

          {poolRes && poolRes.volumeCalculadoM3 > 0 && (
            <div className="rounded-xl border border-slate-200 p-5 print-break-inside-avoid">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] mb-3 border-b border-slate-200 pb-2">
                Dimensionamento Técnico — Sistema de Aquecimento de Piscina
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Volume / Área da Piscina</div>
                  <div className="text-sm font-bold text-teal-700 mt-0.5">
                    {formatNumber(poolRes.volumeCalculadoM3, 1)} m³ (
                    {formatNumber(poolRes.areaSuperficieM2, 1)} m²)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Coletores Dimensionados</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {poolRes.quantidadeColetoresSelecionada} placas (
                    {formatNumber(poolRes.areaRecomendadaColetoresM2, 1)} m²)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Reposição Térmica Diária</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {formatNumber(poolRes.demandaManutencaoDiariaKwh, 1)}{" "}
                    kWh/dia
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Ambiente / Capa Térmica</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 capitalize">
                    {proposal.sizingInput?.ambiente || "Aberta"} •{" "}
                    {proposal.sizingInput?.usoCapaTermica
                      ? "Com Capa"
                      : "Sem Capa"}
                  </div>
                </div>
              </div>
              {poolRes.avisoTecnicoCondicoes && (
                <p className="mt-2.5 text-[11px] text-slate-500">
                  {poolRes.avisoTecnicoCondicoes}
                </p>
              )}
            </div>
          )}

          {/* Relação de Equipamentos e Serviços */}
          <div className="rounded-xl border border-slate-200 overflow-hidden print-break-inside-avoid">
            <div className="bg-[#0F2942] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
              Relação de Equipamentos, Materiais e Serviços Inclusos
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4 font-semibold">#</th>
                  <th className="py-2.5 px-4 font-semibold">
                    Descrição do Equipamento / Serviço
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center">
                    Unid.
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right">Qtd.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proposal.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 px-4 text-center text-slate-500"
                    >
                      Sistema completo fornecido em regime Turnkey conforme
                      especificação técnica acima.
                    </td>
                  </tr>
                ) : (
                  proposal.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 px-4 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-600 uppercase">
                        {item.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        {formatNumber(item.quantity, 2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quadro de Investimento e Condições Comerciais */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 print-break-inside-avoid">
            <div className="md:col-span-7 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-[#0F2942]">
                Condições Comerciais e Prazo de Execução
              </div>
              <div>
                <strong>Condições de Pagamento:</strong>{" "}
                {proposal.paymentTerms ||
                  comp?.payment_terms ||
                  "À vista com desconto especial ou financiamento bancário em até 60x."}
              </div>
              <div>
                <strong>Prazo Estimado de Execução/Entrega:</strong>{" "}
                {proposal.executionDays
                  ? `${proposal.executionDays} dias corridos após assinatura`
                  : "15 a 30 dias após aprovação do projeto."}
              </div>
              {comp?.bank_info && (
                <div>
                  <strong>Dados Bancários / PIX:</strong> {comp.bank_info}
                </div>
              )}
              {proposal.notes && (
                <div className="pt-1 border-t border-slate-200">
                  <strong>Observações Comerciais:</strong> {proposal.notes}
                </div>
              )}
            </div>

            <div className="md:col-span-5 rounded-xl bg-[#0F2942] text-white p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-orange-400 font-bold">
                  Investimento Total da Solução
                </div>
                {proposal.discount > 0 && (
                  <div className="mt-2 text-xs text-slate-300 flex justify-between">
                    <span>Valor de Tabela:</span>
                    <span className="line-through">
                      {formatBRL(proposal.subtotalBeforeDiscount)}
                    </span>
                  </div>
                )}
                {proposal.discount > 0 && (
                  <div className="text-xs text-emerald-400 flex justify-between">
                    <span>Desconto Comercial Aplicado:</span>
                    <span>- {formatBRL(proposal.discount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-white/15">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formatBRL(proposal.totalValue)}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Proposta válida até {formatDateBR(proposal.validUntil)}
                </div>
              </div>
            </div>
          </div>

          {/* Garantias e Condições Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs print-break-inside-avoid">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="font-bold uppercase tracking-wider text-[#0F2942] mb-1.5">
                Garantias Inclusas
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {comp?.warranties ||
                  "• Módulos Fotovoltaicos: 12 a 15 anos contra defeitos de fabricação e 25 anos de performance linear (mín. 80%).\n• Inversores / Boilers / Coletores: Conforme certificado oficial do fabricante.\n• Mão de obra de instalação GT Solar: 12 meses de garantia integral."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="font-bold uppercase tracking-wider text-[#0F2942] mb-1.5">
                Condições Gerais de Fornecimento
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {comp?.general_conditions ||
                  "• O dimensionamento energético/térmico é estimado com base nas médias históricas de radiação solar da região.\n• Eventuais adequações civis ou estruturais no padrão de entrada não listadas nesta proposta são de responsabilidade do contratante."}
              </p>
            </div>
          </div>

          {/* Termo de Aceite do Cliente */}
          <div className="pt-6 border-t-2 border-slate-200 print-break-inside-avoid">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0F2942] mb-2">
              Termo de Aceite da Proposta Comercial Nº {proposal.number}
            </div>
            <p className="text-xs text-slate-600">
              Autorizo a execução e fornecimento da solução descrita nesta
              proposta comercial, de acordo com os valores, prazos e condições
              de pagamento estabelecidos acima.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-center">
              <div>
                <div className="border-t border-slate-400 pt-2 font-bold text-slate-900">
                  {cli?.name || "Assinatura do Cliente / Contratante"}
                </div>
                <div className="text-slate-500">
                  {cli?.document ? `CPF/CNPJ: ${cli.document}` : "Contratante"}
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-2 font-bold text-slate-900">
                  {comp?.trade_name || "GT Solar"} — {proposal.sellerName}
                </div>
                <div className="text-slate-500">
                  Data do Aceite: ____ / ____ / ________
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
