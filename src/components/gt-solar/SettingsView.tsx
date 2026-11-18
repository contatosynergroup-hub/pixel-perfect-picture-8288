import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useGTSolar } from "@/lib/gt-solar-store";
import { UsersManagementView } from "./UsersManagementView";
import { toast } from "sonner";
import {
  Building2,
  Sliders,
  Users,
  Upload,
  Save,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

export function SettingsView() {
  const {
    companySettings,
    pvParams,
    boilerParams,
    poolParams,
    allProfiles,
    isAdmin,
    saveCompanySettings,
    saveSizingParameters,
  } = useGTSolar();

  const [subTab, setSubTab] = useState<"empresa" | "parametros" | "usuarios">(
    "empresa",
  );
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Estado dos dados da empresa
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("GT Solar");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [warranties, setWarranties] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [generalConditions, setGeneralConditions] = useState("");
  const [defaultValidityDays, setDefaultValidityDays] = useState<number>(15);

  // Estado dos parâmetros técnicos
  const [localPv, setLocalPv] = useState(pvParams);
  const [localBoiler, setLocalBoiler] = useState(boilerParams);
  const [localPool, setLocalPool] = useState(poolParams);

  useEffect(() => {
    if (companySettings) {
      setLegalName(companySettings.legal_name || "");
      setTradeName(companySettings.trade_name || "GT Solar");
      setCnpj(companySettings.cnpj || "");
      setAddress(companySettings.address || "");
      setPhone(companySettings.phone || "");
      setWhatsapp(companySettings.whatsapp || "");
      setEmail(companySettings.email || "");
      setWebsite(companySettings.website || "");
      setLogoUrl(companySettings.logo_url || "");
      setBankInfo(companySettings.bank_info || "");
      setPaymentTerms(companySettings.payment_terms || "");
      setWarranties(companySettings.warranties || "");
      setProposalText(companySettings.proposal_text || "");
      setGeneralConditions(companySettings.general_conditions || "");
      setDefaultValidityDays(companySettings.default_validity_days ?? 15);
    }
  }, [companySettings]);

  useEffect(() => {
    setLocalPv(pvParams);
  }, [pvParams]);
  useEffect(() => {
    setLocalBoiler(boilerParams);
  }, [boilerParams]);
  useEffect(() => {
    setLocalPool(poolParams);
  }, [poolParams]);

  const handleLogoFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Escolha uma imagem de logotipo com até 1,5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoUrl(reader.result);
        toast.success(
          "Logotipo oficial carregado! Clique em Salvar Configurações para aplicar.",
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Apenas administradores podem alterar os dados da empresa.");
      return;
    }
    await saveCompanySettings({
      legal_name: legalName.trim() || null,
      trade_name: tradeName.trim() || "GT Solar",
      cnpj: cnpj.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      logo_url: logoUrl.trim() || null,
      bank_info: bankInfo.trim() || null,
      payment_terms: paymentTerms.trim() || null,
      warranties: warranties.trim() || null,
      proposal_text: proposalText.trim() || null,
      general_conditions: generalConditions.trim() || null,
      default_validity_days: Number(defaultValidityDays) || 15,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Configurações da Empresa, Engenharia e Usuários
          </h2>
          <p className="text-xs text-slate-500">
            Configure o logotipo oficial, dados institucionais da GT Solar,
            parâmetros de cálculo e permissões da equipe.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubTab("empresa")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === "empresa"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-orange-600" />
            Dados da Empresa
          </button>
          <button
            type="button"
            onClick={() => setSubTab("parametros")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === "parametros"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-orange-600" />
            Parâmetros Técnicos
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setSubTab("usuarios")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === "usuarios"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-orange-600" />
              Usuários ({allProfiles.length})
            </button>
          )}
        </div>
      </div>

      {/* ABA 1: DADOS DA EMPRESA E LOGOTIPO OFICIAL */}
      {subTab === "empresa" && (
        <form
          onSubmit={handleSaveCompany}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6"
        >
          {/* Área de Upload do Logotipo Oficial */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="h-20 px-4 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logotipo Oficial GT Solar"
                    className="max-h-16 w-auto max-w-[200px] object-contain"
                  />
                </div>
              ) : (
                <div className="h-20 px-5 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center gap-3 text-xs text-slate-500">
                  <ImageIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-bold text-slate-800">
                      Espaço para Logotipo Oficial GT Solar
                    </div>
                    <div>Envie o arquivo PNG/SVG/JPG oficial da empresa</div>
                  </div>
                </div>
              )}
              <div className="text-xs text-slate-600 max-w-md">
                <strong className="text-slate-900 block">
                  Logotipo Oficial nas Propostas e Cabeçalho
                </strong>
                O sistema preserva fielmente a imagem enviada sem modificá-la.
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] hover:bg-[#173b5e] text-white text-xs font-semibold cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-orange-400" />
                  Enviar Logotipo Oficial
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remover logotipo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="GT Solar Energia e Aquecimento Ltda"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone Comercial
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Oficial
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                disabled={!isAdmin}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.gtsolar.com.br"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validade Padrão dos Orçamentos (dias)
              </label>
              <input
                type="number"
                min={1}
                disabled={!isAdmin}
                value={defaultValidityDays}
                onChange={(e) => setDefaultValidityDays(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço Comercial Completo
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dados Bancários / Chave PIX para Propostas
              </label>
              <textarea
                rows={2}
                disabled={!isAdmin}
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                placeholder="Banco, Agência, Conta Corrente e Chave PIX..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condições de Pagamento Padrão
              </label>
              <textarea
                rows={2}
                disabled={!isAdmin}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="À vista com desconto, parcelamento no cartão ou financiamento solar..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Texto Padrão de Apresentação da Proposta
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                placeholder="Texto institucional que aparece no topo das propostas em PDF..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Termos de Garantia Padrão
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={warranties}
                onChange={(e) => setWarranties(e.target.value)}
                placeholder="Garantia dos módulos, inversores, boilers, coletores e mão de obra..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condições Gerais de Fornecimento
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={generalConditions}
                onChange={(e) => setGeneralConditions(e.target.value)}
                placeholder="Cláusulas gerais exibidas no rodapé da proposta..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Salvar Configurações da Empresa
              </button>
            </div>
          )}
        </form>
      )}

      {/* ABA 2: PARÂMETROS TÉCNICOS DE DIMENSIONAMENTO */}
      {subTab === "parametros" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fotovoltaico */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[11px] font-bold uppercase text-orange-600">
                Modalidade A
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Energia Solar Fotovoltaica
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perdas Globais Padrão (%)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={localPv.perdas_pct}
                  onChange={(e) =>
                    setLocalPv({
                      ...localPv,
                      perdas_pct: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Área Média por Módulo (m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isAdmin}
                  value={localPv.area_por_modulo_m2}
                  onChange={(e) =>
                    setLocalPv({
                      ...localPv,
                      area_por_modulo_m2: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Custo Disponibilidade Padrão (kWh)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={localPv.custo_disponibilidade_kwh}
                  onChange={(e) =>
                    setLocalPv({
                      ...localPv,
                      custo_disponibilidade_kwh: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Meta de Compensação Padrão (%)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={localPv.compensacao_pct}
                  onChange={(e) =>
                    setLocalPv({
                      ...localPv,
                      compensacao_pct: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  saveSizingParameters("fotovoltaico", localPv as any)
                }
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Parâmetros Fotovoltaicos
              </button>
            )}
          </div>

          {/* Boiler */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[11px] font-bold uppercase text-sky-600">
                Modalidade B
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Aquecimento de Água — Boiler
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consumo Médio por Pessoa (L/dia)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={localBoiler.litros_por_pessoa}
                  onChange={(e) =>
                    setLocalBoiler({
                      ...localBoiler,
                      litros_por_pessoa: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Eficiência Térmica do Coletor (%)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={localBoiler.eficiencia_coletor_pct}
                  onChange={(e) =>
                    setLocalBoiler({
                      ...localBoiler,
                      eficiencia_coletor_pct: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Irradiação Padrão (kWh/m²/dia)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isAdmin}
                  value={localBoiler.irradiacao_kwh_m2_dia}
                  onChange={(e) =>
                    setLocalBoiler({
                      ...localBoiler,
                      irradiacao_kwh_m2_dia: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Área Unitária do Coletor (m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isAdmin}
                  value={localBoiler.area_coletor_m2}
                  onChange={(e) =>
                    setLocalBoiler({
                      ...localBoiler,
                      area_coletor_m2: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  saveSizingParameters("boiler", localBoiler as any)
                }
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Parâmetros de Boiler
              </button>
            )}
          </div>

          {/* Piscina */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[11px] font-bold uppercase text-teal-600">
                Modalidade C
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Aquecimento de Piscinas
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perda Térmica Diária s/ Capa (°C/dia)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isAdmin}
                  value={localPool.perda_diaria_c_aberta}
                  onChange={(e) =>
                    setLocalPool({
                      ...localPool,
                      perda_diaria_c_aberta: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perda Térmica Diária c/ Capa (°C/dia)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isAdmin}
                  value={localPool.perda_diaria_c_capa}
                  onChange={(e) =>
                    setLocalPool({
                      ...localPool,
                      perda_diaria_c_capa: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Razão Base Área Coletor / Piscina
                </label>
                <input
                  type="number"
                  step="0.05"
                  disabled={!isAdmin}
                  value={localPool.razao_area_coletor}
                  onChange={(e) =>
                    setLocalPool({
                      ...localPool,
                      razao_area_coletor: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Área Unitária Coletor Piscina (m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isAdmin}
                  value={localPool.area_coletor_m2}
                  onChange={(e) =>
                    setLocalPool({
                      ...localPool,
                      area_coletor_m2: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  saveSizingParameters("piscina", localPool as any)
                }
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Parâmetros de Piscinas
              </button>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: GESTÃO DE USUÁRIOS E PERMISSÕES */}
      {subTab === "usuarios" && isAdmin && <UsersManagementView />}
    </div>
  );
}
