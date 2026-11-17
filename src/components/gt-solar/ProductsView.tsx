import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useGTSolar, type ProductRow } from "@/lib/gt-solar-store";
import { formatBRL, formatNumber } from "@/lib/calculators";
import {
  generateSampleProductsCsv,
  parseProductsCsv,
} from "@/lib/catalog-presets";
import { toast } from "sonner";
import {
  PackagePlus,
  Upload,
  Download,
  Sparkles,
  Search,
  Edit3,
  Trash2,
  Percent,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function ProductsView() {
  const {
    products,
    categories,
    isAdmin,
    saveProduct,
    deleteProduct,
    updateCategoryMargin,
    seedInitialCatalog,
  } = useGTSolar();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showMarginsPanel, setShowMarginsPanel] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [unit, setUnit] = useState("un");
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [supplier, setSupplier] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState(true);

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[number]>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const slugToCategoryId = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.slug, c.id);
    return map;
  }, [categories]);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setCategoryId(categories[0]?.id || "");
    setManufacturer("");
    setModel("");
    setDescription("");
    setSpecsText("");
    setUnit("un");
    setCostPrice(0);
    setSalePrice(0);
    setSupplier("");
    setImageUrl("");
    setActive(true);
    setShowForm(false);
  };

  const handleEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setCode(p.code || "");
    setCategoryId(p.category_id || categories[0]?.id || "");
    setManufacturer(p.manufacturer || "");
    setModel(p.model || "");
    setDescription(p.description);
    setSpecsText(
      p.specs && typeof p.specs === "object"
        ? Object.entries(p.specs as Record<string, any>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : "",
    );
    setUnit(p.unit || "un");
    setCostPrice(Number(p.cost_price || 0));
    setSalePrice(Number(p.sale_price || 0));
    setSupplier(p.supplier || "");
    setImageUrl(p.image_url || "");
    setActive(p.active);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Informe a descrição do produto.");
      return;
    }

    const specsObj: Record<string, string> = {};
    if (specsText.trim()) {
      for (const pair of specsText.split(",")) {
        const [k, ...rest] = pair.split(":");
        if (k && rest.length > 0) {
          specsObj[k.trim()] = rest.join(":").trim();
        } else if (k?.trim()) {
          specsObj.detalhe = k.trim();
        }
      }
    }

    const saved = await saveProduct({
      ...(editingId ? { id: editingId } : {}),
      code: code.trim() || null,
      category_id: categoryId || null,
      manufacturer: manufacturer.trim() || null,
      model: model.trim() || null,
      description: description.trim(),
      specs: specsObj,
      unit: unit.trim() || "un",
      cost_price: Number(costPrice) || 0,
      sale_price: Number(salePrice) || 0,
      supplier: supplier.trim() || null,
      image_url: imageUrl.trim() || null,
      active,
    });
    if (saved) resetForm();
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = generateSampleProductsCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-produtos-gt-solar.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseProductsCsv(text);
      if (parsed.length === 0) {
        toast.error(
          "Nenhum produto válido encontrado na planilha CSV. Verifique o cabeçalho.",
        );
        return;
      }

      let importedCount = 0;
      for (const item of parsed) {
        const catId =
          slugToCategoryId.get(item.category_slug) ??
          categories[0]?.id ??
          null;
        const ok = await saveProduct({
          code: item.code,
          category_id: catId,
          manufacturer: item.manufacturer || null,
          model: item.model || null,
          description: item.description,
          unit: item.unit || "un",
          cost_price: item.cost_price,
          sale_price: item.sale_price,
          supplier: item.supplier || null,
          specs: {},
          active: true,
        });
        if (ok) importedCount++;
      }
      toast.success(`${importedCount} produto(s) importado(s) via CSV!`);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao ler arquivo CSV.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category_id !== categoryFilter)
        return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const match =
          p.description.toLowerCase().includes(term) ||
          (p.code || "").toLowerCase().includes(term) ||
          (p.manufacturer || "").toLowerCase().includes(term) ||
          (p.model || "").toLowerCase().includes(term) ||
          (p.supplier || "").toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [products, categoryFilter, search]);

  const currentMarginOnSale =
    salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 0;
  const currentMarkupOnCost =
    costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Catálogo de Produtos, Equipamentos e Serviços
          </h2>
          <p className="text-xs text-slate-500">
            Módulos fotovoltaicos, inversores, boilers, coletores solares,
            bombas, estruturas e mão de obra.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Modelo CSV
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-orange-600" />
              Importar CSV
            </button>
            <button
              type="button"
              onClick={() => setShowMarginsPanel((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5 text-orange-600" />
              Margens por Categoria
            </button>
            {products.length === 0 && (
              <button
                type="button"
                onClick={seedInitialCatalog}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Carregar Kit Inicial Solar
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (showForm) resetForm();
                else {
                  setCategoryId(categories[0]?.id || "");
                  setShowForm(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              {showForm ? "Fechar Cadastro" : "Novo Produto"}
            </button>
          </div>
        )}
      </div>

      {/* Painel de Configuração de Margens por Categoria */}
      {isAdmin && showMarginsPanel && (
        <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Configuração de Margens Padrão por Categoria (%)
              </h3>
              <p className="text-xs text-slate-500">
                Ao alterar a margem de uma categoria, ela fica salva para
                precificação automática de novos itens.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {cat.name}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={80}
                    defaultValue={cat.default_margin}
                    onBlur={(e) =>
                      updateCategoryMargin(cat.id, Number(e.target.value))
                    }
                    className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-right"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Cadastro / Edição de Produto */}
      {isAdmin && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? "Editar Produto" : "Cadastrar Novo Produto ou Serviço"}
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código Interno / SKU
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: MOD-550-CS"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fabricante / Marca
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Ex: Canadian Solar, WEG, Heliotek"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: HiKu6 550W"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição Comercial Completa *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição exibida na proposta..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="un, kit, m, sv"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nome do distribuidor"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço de Custo (R$)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço de Venda Sugerido (R$)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-orange-600"
              />
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 flex flex-col justify-center text-xs">
              <span className="text-slate-500">Margem s/ Venda | Markup:</span>
              <strong className="text-slate-900">
                {formatNumber(currentMarginOnSale, 1)}% |{" "}
                {formatNumber(currentMarkupOnCost, 1)}%
              </strong>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="prod-active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label
                htmlFor="prod-active"
                className="text-xs font-semibold text-slate-700"
              >
                Produto Ativo para Vendedores
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Especificações Técnicas (chave: valor separados por vírgula)
              </label>
              <input
                type="text"
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                placeholder="potencia_w: 550, eficiencia: 21.3%, garantia: 15 anos"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL da Imagem do Produto (opcional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
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
              {editingId ? "Salvar Produto" : "Adicionar ao Catálogo"}
            </button>
          </div>
        </form>
      )}

      {/* Filtros de Busca e Categoria */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código, fabricante, modelo, descrição ou fornecedor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
        >
          <option value="all">Todas as 14 Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Nenhum produto encontrado nesta seleção.
            </p>
            {isAdmin && products.length === 0 && (
              <button
                type="button"
                onClick={seedInitialCatalog}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Importar Kit Inicial de Produtos GT Solar (15 itens)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">
                    Produto / Fabricante
                  </th>
                  <th className="py-3 px-4 font-semibold">Categoria</th>
                  <th className="py-3 px-4 font-semibold text-center">Un.</th>
                  {isAdmin && (
                    <th className="py-3 px-4 font-semibold text-right">
                      Preço Custo
                    </th>
                  )}
                  <th className="py-3 px-4 font-semibold text-right">
                    Preço Venda
                  </th>
                  {isAdmin && (
                    <th className="py-3 px-4 font-semibold text-right">
                      Margem
                    </th>
                  )}
                  <th className="py-3 px-4 font-semibold text-center">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="py-3 px-4 font-semibold text-right">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((p) => {
                  const cat = p.category_id
                    ? categoryMap.get(p.category_id)
                    : null;
                  const cost = Number(p.cost_price || 0);
                  const sale = Number(p.sale_price || 0);
                  const marginPct =
                    sale > 0 ? ((sale - cost) / sale) * 100 : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">
                        {p.code || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {p.description}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {[p.manufacturer, p.model, p.supplier]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {cat?.name || "Geral"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center uppercase">
                        {p.unit}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right text-slate-600">
                          {formatBRL(cost)}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatBRL(sale)}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {formatNumber(marginPct, 1)}%
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        {p.active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <XCircle className="w-3.5 h-3.5" />
                            Inativo
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(p)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
