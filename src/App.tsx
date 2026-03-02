import React, { useState, useMemo, useEffect } from "react";
import {
  Factory,
  AlertTriangle,
  Monitor,
  Layers,
  Ruler,
  List,
  Box,
  RotateCcw,
  Zap,
  ThumbsUp,
  TrendingDown,
  Scissors,
  Link2,
  BarChart3,
  Instagram,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  Truck,
  ClipboardList,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ScanLine,
  FileText,
  Download,
  Database,
  Info,
  Menu,
  X,
} from "lucide-react";
import { BILLET_TYPES, INITIAL_INPUTS, ALLOY_COLORS } from "./constants";
import {
  CalculationInputs,
  Ordine,
  ArticoloDB,
  DieHistoryEntry,
  FornoLog,
  AluminumAlloy,
} from "./types";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./supabaseClient";
import { generateReportHTML } from "./reportTemplate";

const MIN_BILLET_LEN = 400;
const MIN_TIRATA = 4500;
const MAX_TIRATA = 50000;
const MIN_BILLETTA = 450;
const MAX_BILLETTA = 1350;

const IndustrialInput: React.FC<{
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  highlight?: boolean;
  customColor?: string;
  helper?: string;
  placeholder?: string;
  optional?: boolean;
  compact?: boolean;
  tooltip?: string;
}> = ({
  label,
  name,
  value,
  onChange,
  highlight,
  customColor,
  helper,
  placeholder = "0",
  optional,
  compact,
  tooltip,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    value === 0 && optional ? "" : value.toString(),
  );

  useEffect(() => {
    setInputValue((prev) => {
      const parsed = parseFloat(prev);
      if (prev === "" && value === 0) return prev;
      if (!isNaN(parsed) && parsed === value) return prev;
      return value === 0 && optional ? "" : value.toString();
    });
  }, [value, optional]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Remove leading zeros for whole numbers typed by the user to prevent "032"
    if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
      val = val.replace(/^0+/, "");
      if (val === "") val = "0";
    }

    setInputValue(val);
    if (val === "") {
      onChange({ target: { name, value: "0" } } as any);
    } else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        onChange({ target: { name, value: val } } as any);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className={`font-black text-slate-500 flex items-center justify-between ${compact ? "text-[8px] mb-0.5" : "text-[9px] tracking-widest ml-1"}`}
      >
        <div className="flex items-center gap-1.5 uppercase group cursor-help relative">
          {label}
          {tooltip && (
            <>
              <Info className="w-3 h-3 text-slate-400 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-48 p-2 bg-slate-800 text-slate-200 text-xs rounded shadow-xl border border-slate-700 normal-case tracking-normal">
                {tooltip}
              </div>
            </>
          )}
        </div>
        {optional && (
          <span className="text-[7px] text-slate-600 bg-slate-800/50 px-1 py-0.5 rounded normal-case tracking-normal shrink-0 ml-2">
            Opz.
          </span>
        )}
      </label>
      <input
        type="number"
        step="any"
        name={name}
        value={inputValue}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        className={`w-full text-white mono font-black rounded-lg outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          compact
            ? "px-3 py-2 text-sm bg-slate-950/50 border"
            : "border-2 p-2.5 text-sm bg-slate-950"
        } ${
          optional && value === 0 && compact
            ? "border-dashed border-slate-700 text-slate-500"
            : customColor ||
              (highlight
                ? "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                : "border-slate-800 focus:border-emerald-500/50")
        }`}
      />
      {helper && (
        <span className="text-[8px] font-bold text-emerald-500/60 uppercase ml-1">
          {helper}
        </span>
      )}
    </div>
  );
};

const ResultCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  sub: string;
  icon: React.ReactNode;
  highlight?: boolean;
  color?: string;
}> = ({ label, value, unit, sub, icon, highlight, color }) => (
  <div
    className={`p-5 rounded-xl border transition-all duration-300 ${
      highlight
        ? "bg-emerald-500/[0.03] border-emerald-500/20 shadow-lg"
        : "bg-slate-800/20 border-slate-800 shadow-md"
    }`}
  >
    <div className="flex justify-between items-start mb-3">
      <div
        className={`p-2 rounded-lg ${highlight ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-700/30 text-slate-400"}`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
        {unit}
      </span>
    </div>
    <div className="space-y-0.5">
      <div
        className={`text-2xl font-black italic tracking-tighter ${color || (highlight ? "text-emerald-400" : "text-white")} mono`}
      >
        {value}
      </div>
      <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
        {label}
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-800">
      <p className="text-[8px] font-bold text-slate-500 uppercase italic leading-tight">
        {sub}
      </p>
    </div>
  </div>
);

const MetricRow: React.FC<{
  label: string;
  value: string;
  sub: string;
  color?: string;
}> = ({ label, value, sub, color }) => (
  <div className="space-y-0.5">
    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
      {label}
    </div>
    <div className={`text-lg font-black ${color || "text-white"} mono`}>
      {value}
    </div>
    <div className="text-[8px] font-bold text-slate-600 uppercase italic">
      {sub}
    </div>
  </div>
);

const DieHistoryModal: React.FC<{
  articolo: string;
  numeroBarra: string;
  history: DieHistoryEntry[];
  onClose: () => void;
  onSave: (
    billette: number,
    scarto: number | null,
    turno: 1 | 2 | 3 | null,
    note: string | null,
    operatore: string | null,
  ) => Promise<void>;
}> = ({ articolo, numeroBarra, history, onClose, onSave }) => {
  const [billette, setBillette] = useState<number>(0);
  const [scarto, setScarto] = useState<string>("");
  const [turno, setTurno] = useState<1 | 2 | 3 | null>(null);
  const [note, setNote] = useState<string>("");
  const [operatore, setOperatore] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (billette <= 0) return;
    setIsSaving(true);
    await onSave(
      billette,
      scarto ? parseFloat(scarto) : null,
      turno,
      note || null,
      operatore || null,
    );
    setIsSaving(false);
    setBillette(0);
    setScarto("");
    setTurno(null);
    setNote("");
  };

  const totalBillette = history.reduce(
    (sum, entry) => sum + entry.billetteEstruse,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800/50 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1">
                Storico Matrice
              </h3>
              <p className="text-[10px] font-bold text-slate-400">
                Art. {articolo}{" "}
                <span className="text-indigo-400">/ Barra {numeroBarra}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="bg-indigo-500/10 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">
                Vita Totale Matrice
              </span>
              <span className="text-2xl font-black text-white mono">
                {totalBillette}{" "}
                <span className="text-sm text-slate-500">billette passate</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Aggiungi Sessione
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
                <label className="text-[8px] font-black uppercase text-slate-500 px-1 mb-1 block">
                  Billette Estruse
                </label>
                <input
                  type="number"
                  value={billette === 0 ? "" : billette}
                  onChange={(e) => setBillette(parseInt(e.target.value) || 0)}
                  placeholder="Es. 80"
                  className="w-full bg-transparent text-sm font-black text-white mono outline-none px-1"
                />
              </div>
              <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
                <label className="text-[8px] font-black uppercase text-slate-500 px-1 mb-1 block">
                  Scarto Media Reale (mm)
                </label>
                <input
                  type="number"
                  value={scarto}
                  onChange={(e) => setScarto(e.target.value)}
                  placeholder="Es. 800"
                  className="w-full bg-transparent text-sm font-black text-amber-400 mono outline-none px-1"
                />
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
              <label className="text-[8px] font-black uppercase text-slate-500 px-1 mb-1 block">
                Turno Produzione
              </label>
              <div className="flex gap-2">
                {[
                  { val: 1, label: "1° Turno", time: "06-14" },
                  { val: 2, label: "2° Turno", time: "14-22" },
                  { val: 3, label: "3° Turno", time: "22-06" },
                ].map((t) => (
                  <button
                    key={t.val}
                    onClick={() => setTurno(t.val as 1 | 2 | 3)}
                    className={`flex-1 py-2 px-1 rounded-md text-[10px] font-bold transition-colors ${turno === t.val ? "bg-indigo-500 text-white shadow-md" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
                  >
                    <span className="block font-black uppercase">
                      {t.label}
                    </span>
                    <span className="text-[8px] opacity-70 font-normal">
                      {t.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50 col-span-2 sm:col-span-1">
                <label className="text-[8px] font-black uppercase text-slate-500 px-1 mb-1 block">
                  Operatore
                </label>
                <input
                  type="text"
                  value={operatore}
                  onChange={(e) => setOperatore(e.target.value)}
                  placeholder="Nome"
                  className="w-full bg-transparent text-sm font-black text-white outline-none px-1"
                />
              </div>
              <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50 col-span-2 sm:col-span-1">
                <label className="text-[8px] font-black uppercase text-slate-500 px-1 mb-1 block">
                  Note / Problemi
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Es. Chiude dx"
                  className="w-full bg-transparent text-sm font-bold text-slate-300 outline-none px-1 resize-none h-16"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={billette <= 0 || isSaving}
              className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 text-white disabled:text-slate-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2"
            >
              {isSaving ? (
                "Salvataggio..."
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Registra Sessione
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/50">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Storico Lavorazioni
            </h4>
            {history.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-600 text-center py-6 italic">
                Nessuna sessione registrata.
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="bg-slate-950/30 rounded-lg p-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between border border-slate-800/30 gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                        +{h.billetteEstruse} Bill.
                      </span>
                      {h.scartoReale && (
                        <span className="text-[9px] font-bold text-amber-500/80">
                          Scarto: ~{h.scartoReale}mm
                        </span>
                      )}
                      {h.turno && (
                        <span className="text-[9px] font-bold text-slate-300 bg-slate-800/50 px-1.5 py-0.5 rounded shadow-sm border border-slate-700/50">
                          {h.turno}° Turno
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end w-full sm:w-auto overflow-hidden">
                      <span className="text-[9px] font-bold text-slate-400">
                        {new Date(h.dataCreazione).toLocaleDateString("it-IT")}{" "}
                        {h.operatore ? ` — ${h.operatore}` : ""}
                      </span>
                      {h.note && (
                        <span
                          className="text-[10px] text-slate-300 italic truncate w-full sm:max-w-[200px]"
                          title={h.note}
                        >
                          "{h.note}"
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    ...INITIAL_INPUTS,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedCut, setSelectedCut] = useState<number>(0);
  const [logNelForno, setLogNelForno] = useState<(FornoLog | null)[]>(
    Array(5).fill(null),
  );
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [logCaricatore, setLogCaricatore] = useState<(FornoLog | null)[]>(
    Array(12).fill(null),
  );
  const [editingSlotCaricatore, setEditingSlotCaricatore] = useState<
    number | null
  >(null);
  const [currentView, setCurrentView] = useState<
    "calcoli" | "gestione-log" | "ordini" | "archivio" | "report"
  >("calcoli");

  // Report filters
  const [reportFilterDate, setReportFilterDate] = useState<string>("");
  const [reportFilterMonth, setReportFilterMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [reportFilterYear, setReportFilterYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [reportFilterTurno, setReportFilterTurno] = useState<0 | 1 | 2 | 3>(0); // 0 = tutti
  const [reportFilterMode, setReportFilterMode] = useState<"day" | "month">(
    "month",
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [expandedOrdine, setExpandedOrdine] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeFeedback, setBarcodeFeedback] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [dbArticoli, setDbArticoli] = useState<ArticoloDB[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState("");
  const [dbLoading, setDbLoading] = useState(true);

  const [dieHistory, setDieHistory] = useState<DieHistoryEntry[]>([]);
  const [activeDieModal, setActiveDieModal] = useState<{
    articolo: string;
    numeroBarra: string;
  } | null>(null);
  const [activeOrdineId, setActiveOrdineId] = useState<string | null>(null);
  const [completedOrders, setCompletedOrders] = useState<
    Array<{
      id: string;
      articolo: string;
      numeroBarra?: string;
      lega: string;
      billette: number;
      logsDecimali: number;
      logName: string;
      cut: number;
      pesoLordo: number;
      pesoNetto: number;
      completedAt: string;
    }>
  >([]);

  const fetchArticoli = async () => {
    if (!supabase) return;
    try {
      setDbLoading(true);
      const { data, error } = await supabase.from("articoli").select("*");
      if (error) {
        console.error("Error fetching articoli from Supabase:", error);
      } else if (data) {
        // Map snake_case from DB to camelCase for the frontend ArticoloDB interface
        const mappedData: ArticoloDB[] = data.map((item) => ({
          id: item.id,
          articolo: item.articolo,
          lega: item.lega,
          tirataRiferimento: item.tirata_riferimento,
          taglioRiferimento: item.taglio_riferimento,
          fondello: item.fondello,
          lunghezzaBarra: item.lunghezza_barra,
          numeroLuci: item.numero_luci,
          pesoMTL: item.peso_mtl,
          scartoTesta: item.scarto_testa,
          scartoCoda: item.scarto_coda,
          billettoneId: item.billettone_id,
          abilitaGiunta: item.abilita_giunta,
          numeroBarra: item.numero_barra,
          dataCreazione: new Date(item.created_at).getTime(),
        }));
        setDbArticoli(mappedData);
      }
    } finally {
      setDbLoading(false);
    }
  };

  const fetchDieHistory = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("die_history")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setDieHistory(
        data.map((item) => ({
          id: item.id,
          articolo: item.articolo,
          numeroBarra: item.numero_barra,
          billetteEstruse: item.billette_estruse,
          scartoReale: item.scarto_reale,
          turno: item.turno,
          operatore: item.operatore,
          note: item.note,
          dataCreazione: new Date(item.created_at).getTime(),
        })),
      );
    }
  };

  useEffect(() => {
    fetchArticoli();
    fetchDieHistory();
  }, []);

  const processBarcodeString = (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    // Parse potential / modifiers for die numbers (e.g. 14328/3)
    let searchArticolo = trimmedCode;
    let fallbackBarra = "";
    if (trimmedCode.includes("/")) {
      const parts = trimmedCode.split("/");
      searchArticolo = parts[0];
      fallbackBarra = parts[1];
    }

    // Check if it's an article ID in the DB first
    const dbMatch = dbArticoli.find(
      (a) => a.articolo.toLowerCase() === searchArticolo.toLowerCase(),
    );

    if (dbMatch) {
      const newOrd: Ordine = {
        id: Date.now().toString(),
        articolo: dbMatch.articolo,
        lega: dbMatch.lega,
        tirataRiferimento: dbMatch.tirataRiferimento,
        taglioRiferimento: dbMatch.taglioRiferimento,
        fondello: dbMatch.fondello,
        lunghezzaBarra: dbMatch.lunghezzaBarra,
        numeroBarre: 0, // Requesting quantity manually usually
        numeroBarra: fallbackBarra || dbMatch.numeroBarra || "", // Try to use the scanner modifier first
        numeroLuci: dbMatch.numeroLuci,
        pesoMTL: dbMatch.pesoMTL,
        scartoTesta: dbMatch.scartoTesta,
        scartoCoda: dbMatch.scartoCoda,
        billettoneId: dbMatch.billettoneId,
        taglioManuale: 0,
        abilitaGiunta: dbMatch.abilitaGiunta,
      };
      setOrdini((prev) => [newOrd, ...prev]);
      setExpandedOrdine(newOrd.id);

      setBarcodeFeedback("success");
      setTimeout(() => setBarcodeFeedback("idle"), 2500);
      setBarcodeInput("");
      return;
    }

    // Fallback: Expected comma-separated: ARTICOLO, LEGA, TIRATA RIF, TAGLIO RIF, FONDELLO, LUNGH. BARRA, N BARRE, NUMERO LUCI, PESO MTL, SCARTO TESTA, SCARTO CODA
    const parts = trimmedCode.split(",").map((s) => s.trim());

    if (parts.length >= 11) {
      // For paper barcode full strings, we might have attached the die number in the first element too
      let parsedArt = parts[0] || "";
      let parsedDie = fallbackBarra;
      if (parsedArt.includes("/")) {
        const sub = parsedArt.split("/");
        parsedArt = sub[0];
        parsedDie = sub[1];
      }

      const newOrd: Ordine = {
        id: Date.now().toString(),
        articolo: parsedArt,
        lega: parts[1] || "",
        numeroBarra: parsedDie,
        tirataRiferimento: parseFloat(parts[2]) || 0,
        taglioRiferimento: parseFloat(parts[3]) || 0,
        fondello: parseFloat(parts[4]) || 0,
        lunghezzaBarra: parseFloat(parts[5]) || 0,
        numeroBarre: parseFloat(parts[6]) || 0,
        numeroLuci: parseFloat(parts[7]) || 1,
        pesoMTL: parseFloat(parts[8]) || 0,
        scartoTesta: parseFloat(parts[9]) || 0,
        scartoCoda: parseFloat(parts[10]) || 0,
        billettoneId: BILLET_TYPES[0].id,
        taglioManuale: 0,
        abilitaGiunta: false,
      };
      setOrdini((prev) => [newOrd, ...prev]);
      setExpandedOrdine(newOrd.id);

      setBarcodeFeedback("success");
      setTimeout(() => setBarcodeFeedback("idle"), 2500);
      setBarcodeInput("");
    } else {
      setBarcodeFeedback("error");
      setTimeout(() => setBarcodeFeedback("idle"), 2500);
    }
  };

  const handleSaveDieHistory = async (
    articolo: string,
    numeroBarra: string,
    billette: number,
    scarto: number | null,
    turno: 1 | 2 | 3 | null,
    note: string | null,
    operatore: string | null,
  ) => {
    const payload = {
      articolo: articolo || "Sconosciuto",
      numero_barra: numeroBarra || "Non Definita",
      billette_estruse: billette || 0,
      scarto_reale: scarto ?? null,
      turno: turno,
      note: note ? note.trim() : null,
      operatore: operatore ? operatore.trim() : null,
    };

    if (!supabase) return;
    const { error } = await supabase.from("die_history").insert(payload);
    if (error) {
      console.error("Error saving die history:", error);
      alert("Errore nel salvataggio dello storico matrice.");
    } else {
      fetchDieHistory();
    }
  };

  const handleSaveToDB = async (ord: Ordine) => {
    if (!ord.articolo) return;

    const dbPayload = {
      articolo: ord.articolo,
      lega: ord.lega,
      tirata_riferimento: ord.tirataRiferimento,
      taglio_riferimento: ord.taglioRiferimento,
      fondello: ord.fondello,
      lunghezza_barra: ord.lunghezzaBarra,
      numero_luci: ord.numeroLuci,
      peso_mtl: ord.pesoMTL,
      scarto_testa: ord.scartoTesta,
      scarto_coda: ord.scartoCoda,
      billettone_id: ord.billettoneId,
      abilita_giunta: ord.abilitaGiunta,
      numero_barra: ord.numeroBarra || null,
    };

    // Assuming 'articolo' is a unique constraint, supabase upsert handles insert or update.
    if (!supabase) return;
    const { error } = await supabase
      .from("articoli")
      .upsert(dbPayload, { onConflict: "articolo" });

    if (error) {
      console.error("Error saving to Supabase:", error);
      alert("Errore durante il salvataggio nel database cloud.");
    } else {
      // Refresh local list
      fetchArticoli();
    }
  };

  const handleDeleteFromDB = async (articolo: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("articoli")
      .delete()
      .eq("articolo", articolo);
    if (error) {
      console.error("Error deleting from Supabase:", error);
      alert("Errore durante l'eliminazione dal database cloud.");
    } else {
      fetchArticoli();
    }
  };

  // Helper: compute logs needed for a single order
  const computeOrdineResults = (ord: Ordine) => {
    // 1. Calculate Ratio
    let ratio = 1;
    const tRif = ord.taglioRiferimento;
    const tiRif = ord.tirataRiferimento;
    if (tRif > 0 && tiRif > 0) {
      ratio = tiRif / Math.max(1, tRif - ord.fondello);
    } else if (ord.pesoMTL > 0 && ord.numeroLuci > 0) {
      // Use volumetric formula for Ø206 (approx 89988 g/m) -> 89.988 kg/m * 1000
      ratio = 89988 / (ord.pesoMTL * ord.numeroLuci);
    }

    // 2. Determine Cut and Log
    let cut = ord.taglioManuale || ord.taglioRiferimento;
    let logId = ord.billettoneId;
    let isAutoOptimized = false;
    let isStandardMatched = false;

    if (!cut || cut <= 0) {
      isAutoOptimized = true;
      const maxUtile = MAX_BILLETTA - ord.fondello;
      const maxTirata = maxUtile * ratio;
      const maxUtileNetto = maxTirata - ord.scartoTesta - ord.scartoCoda;

      const maxK =
        maxUtileNetto > 0 && ord.lunghezzaBarra > 0
          ? Math.floor(maxUtileNetto / ord.lunghezzaBarra)
          : 0;

      if (ord.abilitaGiunta) {
        cut = MAX_BILLETTA;
      } else if (maxK > 0) {
        const optimalUtileNetto = maxK * ord.lunghezzaBarra;
        const optimalTirata =
          optimalUtileNetto + ord.scartoTesta + ord.scartoCoda;
        const optimalUtile = optimalTirata / ratio;
        cut = Math.ceil(optimalUtile + ord.fondello);

        if (cut < MIN_BILLETTA) cut = MIN_BILLETTA;
        if (cut > MAX_BILLETTA) cut = MAX_BILLETTA;
      } else {
        cut = MAX_BILLETTA;
      }

      // Auto-select optimal log for this cut
      let bestLog = BILLET_TYPES[0];
      let minScarto = 99999;
      for (const bt of BILLET_TYPES) {
        const pieces = Math.floor(bt.length / cut);
        if (pieces > 0) {
          const scarto = bt.length - pieces * cut;
          if (scarto < minScarto) {
            minScarto = scarto;
            bestLog = bt;
          }
        }
      }
      logId = bestLog.id;

      const matchingOpt = BILLET_TYPES.find(
        (b) => b.id === logId,
      )?.options.find((o) => Math.abs(o.length - cut) <= 10);
      if (matchingOpt) {
        cut = matchingOpt.length;
        isStandardMatched = true;
      }
    } else {
      const selectedLogTypes = BILLET_TYPES.find((b) => b.id === logId);
      if (selectedLogTypes) {
        for (const opt of selectedLogTypes.options) {
          if (Math.abs(cut - opt.length) <= 10) {
            cut = opt.length;
            isStandardMatched = true;
            break;
          }
        }
      }
    }

    const log = BILLET_TYPES.find((b) => b.id === logId);
    const logLen = log?.length || 0;
    const utile = Math.max(1, cut - ord.fondello);
    const tirata = utile * ratio;
    const utileNetto = Math.max(0, tirata - ord.scartoTesta - ord.scartoCoda);

    const bpbBase =
      utileNetto > 0 && ord.lunghezzaBarra > 0
        ? Math.floor(utileNetto / ord.lunghezzaBarra) * ord.numeroLuci
        : 0;

    let bpb = bpbBase;
    let giuntaExtra = 0;
    if (inputs.abilitaGiunta && bpbBase > 0 && ord.lunghezzaBarra > 0) {
      const scartoSingolo =
        utileNetto -
        Math.floor(utileNetto / ord.lunghezzaBarra) * ord.lunghezzaBarra;
      const giuntaLen = scartoSingolo * 2;
      giuntaExtra = Math.floor(giuntaLen / ord.lunghezzaBarra) * ord.numeroLuci;
    }

    const barreConSfrido = Math.floor(ord.numeroBarre * 1.1);
    const bpbEffettivo = bpb + (giuntaExtra > 0 ? giuntaExtra / 2 : 0);
    const billette =
      bpbEffettivo > 0 ? Math.ceil(barreConSfrido / bpbEffettivo) : 0;

    const option = log?.options.find((o) => o.length === cut);
    const pezziPerLog = option
      ? option.pieces
      : cut > 0 && logLen >= cut
        ? Math.floor(logLen / cut)
        : 0;
    const logsDecimali = pezziPerLog > 0 ? billette / pezziPerLog : 0;

    // Recommendation: evaluate all log types for this order using the same logic as Calcoli
    const logRecommendations = BILLET_TYPES.flatMap((logOpt) =>
      logOpt.options.map((opt) => {
        const optCut = opt.length;
        const optUtile = Math.max(1, optCut - ord.fondello);
        const optTirata = optUtile * ratio;
        const optUtileNetto = Math.max(
          0,
          optTirata - ord.scartoTesta - ord.scartoCoda,
        );
        const optBpb =
          optUtileNetto > 0 && ord.lunghezzaBarra > 0
            ? Math.floor(optUtileNetto / ord.lunghezzaBarra) * ord.numeroLuci
            : 0;
        const optBillette =
          optBpb > 0 ? Math.ceil(barreConSfrido / optBpb) : Infinity;
        const optBillPerLog = opt.pieces;
        const optLogs =
          optBillPerLog > 0 ? optBillette / optBillPerLog : Infinity;
        const optScarto = logOpt.length - opt.pieces * optCut;
        const inRange =
          optCut >= MIN_BILLETTA &&
          optCut <= MAX_BILLETTA &&
          optTirata >= MIN_TIRATA &&
          optTirata <= MAX_TIRATA;

        let finalBpb = optBpb;
        if (inputs.abilitaGiunta) {
          const scNum =
            optUtileNetto -
            Math.floor(optUtileNetto / ord.lunghezzaBarra) * ord.lunghezzaBarra;
          const geNum =
            Math.floor((scNum * 2) / ord.lunghezzaBarra) * ord.numeroLuci;
          finalBpb = optBpb + geNum / 2;
        }

        return {
          logId: logOpt.id,
          logName: logOpt.name,
          logLen: logOpt.length,
          cut: optCut,
          pieces: opt.pieces,
          tirata: optTirata,
          bpb: finalBpb,
          billette: optBillette,
          logsNeeded: optLogs,
          scarto: optScarto,
          inRange,
        };
      }),
    )
      .filter((r) => r.bpb > 0 && r.inRange)
      .sort((a, b) => a.logsNeeded - b.logsNeeded);

    const bestRec = logRecommendations[0] || null;

    let scartoResiduoLog = 0;
    if (cut > 0 && logLen >= cut) {
      const pezziInteriPerLog = Math.floor(logLen / cut);
      if (pezziInteriPerLog > 0) {
        scartoResiduoLog = logLen - pezziInteriPerLog * cut;
      }
    }

    return {
      tirata,
      bpb: bpbBase,
      bpbEffettivo,
      giuntaExtra,
      barreConSfrido,
      billette,
      logsDecimali,
      logLen,
      logName: log?.name || "—",
      cut,
      ratio,
      scarto: scartoResiduoLog,
      isAutoOptimized,
      isStandardMatched,
      logId,
      recommendation: bestRec,
    };
  };

  const ordiniResults = useMemo(
    () => ordini.map((o) => ({ ...o, results: computeOrdineResults(o) })),
    [ordini],
  );
  const totalLogsOrdini = useMemo(
    () => ordiniResults.reduce((s, o) => s + o.results.logsDecimali, 0),
    [ordiniResults],
  );

  const selectedLog = useMemo(
    () => BILLET_TYPES.find((b) => b.id === inputs.billettoneId),
    [inputs.billettoneId],
  );

  useEffect(() => {
    if (!inputs.modalitaManuale && selectedLog) {
      setSelectedCut((prev) => {
        if (selectedLog.options.some((o) => o.length === prev)) return prev;
        return selectedLog.options[0]?.length || 0;
      });
    }
  }, [inputs.billettoneId, inputs.modalitaManuale, selectedLog]);

  const results = useMemo(() => {
    const {
      tirataRiferimento,
      taglioRiferimento,
      fondello,
      lunghezzaBarra,
      numeroBarre,
      numeroLuci,
      pesoMTL,
      scartoTesta,
      scartoCoda,
      modalitaManuale,
      taglioManuale,
      abilitaGiunta,
      billetteEstruse,
    } = inputs;

    const utileRiferimento = Math.max(1, taglioRiferimento - fondello);
    let ratioAllungamento = 1;
    if (tirataRiferimento > 0 && taglioRiferimento > 0) {
      ratioAllungamento = tirataRiferimento / utileRiferimento;
    } else if (pesoMTL > 0 && numeroLuci > 0) {
      // Ø206: sezione billetta ≈ 333.29 cm² → densità alluminio 2.7 g/cm³ → ~89988 g/m
      ratioAllungamento = 89988 / (pesoMTL * numeroLuci);
    }
    const cut = modalitaManuale
      ? taglioManuale
      : selectedCut || selectedLog?.options[0]?.length || 0;
    const utileAttuale = Math.max(1, cut - fondello);
    const tirataProiettata = utileAttuale * ratioAllungamento;

    const barreConSfrido = Math.floor(numeroBarre * 1.1);

    const utileNettoProfilo = Math.max(
      0,
      tirataProiettata - scartoTesta - scartoCoda,
    );
    const bpbEffettivo =
      utileNettoProfilo > 0 && lunghezzaBarra > 0
        ? Math.floor(utileNettoProfilo / lunghezzaBarra) * numeroLuci
        : 0;

    const logLen = selectedLog?.length || 0;
    let pezziInteriPerLog = 0;
    let scartoResiduoLog = 0;
    let billettePerLogEffettive = 0;

    if (abilitaGiunta) {
      billettePerLogEffettive = logLen / (cut || 1);
      pezziInteriPerLog = Math.floor(billettePerLogEffettive);
      scartoResiduoLog = logLen - pezziInteriPerLog * cut;
    } else {
      if (!modalitaManuale) {
        const option = selectedLog?.options.find(
          (o) => o.length === selectedCut,
        );
        if (option) {
          pezziInteriPerLog = option.pieces;
          scartoResiduoLog = 0;
        } else {
          pezziInteriPerLog =
            cut > 0 && logLen >= cut ? Math.floor(logLen / cut) : 0;
          scartoResiduoLog =
            logLen > 0 && pezziInteriPerLog > 0
              ? logLen - pezziInteriPerLog * cut
              : 0;
        }
      } else {
        pezziInteriPerLog =
          cut > 0 && logLen >= cut ? Math.floor(logLen / cut) : 0;
        scartoResiduoLog =
          logLen > 0 && pezziInteriPerLog > 0
            ? logLen - pezziInteriPerLog * cut
            : 0;
      }
      billettePerLogEffettive = pezziInteriPerLog;
    }

    const billetteTotaliNecessarie =
      bpbEffettivo > 0 ? Math.ceil(barreConSfrido / bpbEffettivo) : 0;
    const logsDecimali =
      billettePerLogEffettive > 0
        ? billetteTotaliNecessarie / billettePerLogEffettive
        : 0;
    const logsInteri = Math.floor(logsDecimali);
    const metriRimanenti = (logsDecimali - logsInteri) * logLen;

    const utileCorta = Math.max(0, scartoResiduoLog - fondello);
    const tirataCorta = utileCorta * ratioAllungamento;
    const bpbCorta =
      tirataCorta > scartoTesta + scartoCoda + lunghezzaBarra
        ? Math.floor(
            (tirataCorta - scartoTesta - scartoCoda) / lunghezzaBarra,
          ) * numeroLuci
        : 0;
    const isCortaRecuperabile =
      !abilitaGiunta &&
      scartoResiduoLog >= MIN_BILLET_LEN &&
      bpbCorta > 0 &&
      bpbCorta < bpbEffettivo;

    // Compensato: total linear meters needed
    const totalMetriLineari = billetteTotaliNecessarie * cut;

    // Non-compensato: count recoverable short billets (one per log used)
    const totalLogsUsed = logsDecimali > 0 ? Math.ceil(logsDecimali) : 0;
    const numCorte = isCortaRecuperabile ? logsInteri : 0;

    const billetAdvisor = BILLET_TYPES.map((log) => {
      let waste = 0;
      waste = log.length % (cut || 1);
      const effectiveWaste =
        !abilitaGiunta && waste >= MIN_BILLET_LEN ? waste * 0.1 : waste;
      return { id: log.id, name: log.name, waste, effectiveWaste };
    }).sort((a, b) => a.effectiveWaste - b.effectiveWaste)[0];

    // --- Smart Log Recommendation (optimized mode) ---
    const logRecommendations = BILLET_TYPES.flatMap((log) =>
      log.options.map((opt) => {
        const optCut = opt.length;
        const optUtile = Math.max(1, optCut - fondello);
        const optTirata = optUtile * ratioAllungamento;
        const optUtileNetto = Math.max(0, optTirata - scartoTesta - scartoCoda);
        const optBpb =
          optUtileNetto > 0 && lunghezzaBarra > 0
            ? Math.floor(optUtileNetto / lunghezzaBarra) * numeroLuci
            : 0;
        const optBillette =
          optBpb > 0 ? Math.ceil(barreConSfrido / optBpb) : Infinity;
        const optBillPerLog = opt.pieces;
        const optLogs =
          optBillPerLog > 0 ? optBillette / optBillPerLog : Infinity;
        const optPesoBill = (optCut / 1000) * (pesoMTL / 1000);
        const inRange =
          optCut >= MIN_BILLETTA &&
          optCut <= MAX_BILLETTA &&
          optTirata >= MIN_TIRATA &&
          optTirata <= MAX_TIRATA;

        return {
          logId: log.id,
          logName: log.name,
          logLen: log.length,
          cut: optCut,
          pieces: opt.pieces,
          tirata: optTirata,
          bpb: optBpb,
          billette: optBillette,
          logs: optLogs,
          pesoBilletta: optPesoBill,
          inRange,
          isCurrentLog: log.id === inputs.billettoneId,
          isCurrentCut: log.id === inputs.billettoneId && optCut === cut,
        };
      }),
    )
      .filter((r) => r.bpb > 0 && r.inRange)
      .sort((a, b) => a.logs - b.logs);

    const bestRecommendation = logRecommendations[0] || null;

    const pesoBarra = (lunghezzaBarra / 1000) * (pesoMTL / 1000);
    const pesoOrdine = numeroBarre * pesoBarra;
    const pesoProduzione = barreConSfrido * pesoBarra;

    // --- Tracking Billette Estruse ---
    const billetteRimanenti = Math.max(
      0,
      billetteTotaliNecessarie - billetteEstruse,
    );
    const barreEstruseTotali = billetteEstruse * bpbEffettivo;
    const barreRimanenti = Math.max(0, barreConSfrido - barreEstruseTotali);
    const progressPercent =
      billetteTotaliNecessarie > 0
        ? Math.min(100, (billetteEstruse / billetteTotaliNecessarie) * 100)
        : 0;
    const logsConsumati =
      billettePerLogEffettive > 0
        ? billetteEstruse / billettePerLogEffettive
        : 0;
    const logsRimanenti = Math.max(0, logsDecimali - logsConsumati);
    const logsRimanentiInteri = Math.floor(logsRimanenti);
    const metriRimanentiTracking =
      (logsRimanenti - logsRimanentiInteri) * logLen;
    const isCompletato =
      billetteEstruse >= billetteTotaliNecessarie &&
      billetteTotaliNecessarie > 0;

    const warnings: string[] = [];
    const errors: string[] = [];
    if (cut <= 0) errors.push("Taglio nullo");
    if (bpbEffettivo <= 0) errors.push("Tirata proiettata insufficiente");
    if (cut > 0 && cut < MIN_BILLETTA)
      warnings.push(`Billetta ${cut}mm sotto il minimo (${MIN_BILLETTA}mm)`);
    if (cut > MAX_BILLETTA)
      warnings.push(`Billetta ${cut}mm sopra il massimo (${MAX_BILLETTA}mm)`);
    if (tirataProiettata > 0 && tirataProiettata < MIN_TIRATA)
      warnings.push(
        `Tirata ${tirataProiettata.toFixed(0)}mm sotto il minimo (${MIN_TIRATA}mm)`,
      );
    if (tirataProiettata > MAX_TIRATA)
      warnings.push(
        `Tirata ${tirataProiettata.toFixed(0)}mm sopra il massimo (${MAX_TIRATA}mm)`,
      );

    return {
      ratioAllungamento,
      tirataProiettata,
      utileNettoProfilo,
      bpbEffettivo,
      billetteTotaliNecessarie,
      logsInteri,
      logsDecimali,
      metriRimanenti,
      pezziInteriPerLog,
      scartoResiduoLog,
      isCortaRecuperabile,
      bpbCorta,
      numCorte,
      totalMetriLineari,
      cutUtilizzato: cut,
      barreConSfrido,
      pesoOrdine,
      pesoProduzione,
      billetAdvisor,
      logRecommendations,
      bestRecommendation,
      billetteRimanenti,
      barreEstruseTotali,
      barreRimanenti,
      progressPercent,
      logsConsumati,
      logsRimanenti,
      logsRimanentiInteri,
      metriRimanentiTracking,
      isCompletato,
      warnings,
      isValid: errors.length === 0,
      errors,
    };
  }, [selectedCut, inputs, selectedLog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = value === "" ? 0 : parseFloat(value);
    setInputs((prev) => ({ ...prev, [name]: isNaN(val) ? 0 : val }));
  };

  const toggleManualMode = () =>
    setInputs((prev) => ({ ...prev, modalitaManuale: !prev.modalitaManuale }));
  const toggleGiunta = () =>
    setInputs((prev) => ({ ...prev, abilitaGiunta: !prev.abilitaGiunta }));

  const handleReset = () => {
    setInputs({ ...INITIAL_INPUTS });
    setLogNelForno(Array(5).fill(null));
    setEditingSlot(null);
    setLogCaricatore(Array(12).fill(null));
    setEditingSlotCaricatore(null);
    const initialLog = BILLET_TYPES.find(
      (b) => b.id === INITIAL_INPUTS.billettoneId,
    );
    if (initialLog) {
      setSelectedCut(initialLog.options[0]?.length || 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30">
      <header className="bg-[#0f172a] border-b border-emerald-500/30 p-3 sm:p-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 sm:gap-4 shadow-xl z-10">
        <button
          onClick={handleReset}
          className="flex items-center gap-4 group transition-all"
        >
          <div className="bg-emerald-500 p-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:bg-emerald-400">
            <Monitor className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-left">
            <div className="flex items-baseline gap-3">
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none group-hover:text-emerald-400">
                EXTRUCALC Ø206
              </h1>
              <span className="text-[7px] font-black text-emerald-500/40 uppercase tracking-[0.2em] hidden sm:block">
                Developed by Robert Musin
              </span>
            </div>
            <p className="text-[9px] font-bold text-emerald-500 tracking-[0.3em] uppercase opacity-70 mt-1 items-center gap-1 hidden sm:flex">
              <RotateCcw className="w-2 h-2" /> Reset Calcoli
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setCurrentView("calcoli")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              currentView === "calcoli"
                ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "bg-slate-950/50 border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/5"
            }`}
          >
            <Factory
              className={`w-4 h-4 ${currentView === "calcoli" ? "text-emerald-400" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${currentView === "calcoli" ? "text-emerald-400" : "text-slate-400"}`}
            >
              Home
            </span>
          </button>
          <button
            onClick={() =>
              setCurrentView((v) =>
                v === "gestione-log" ? "calcoli" : "gestione-log",
              )
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              currentView === "gestione-log"
                ? "bg-orange-500/20 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                : "bg-slate-950/50 border-slate-800 hover:border-orange-500/30 hover:bg-orange-500/5"
            }`}
          >
            <Flame
              className={`w-4 h-4 ${currentView === "gestione-log" ? "text-orange-400" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${currentView === "gestione-log" ? "text-orange-400" : "text-slate-400"}`}
            >
              Log
            </span>
            {(logNelForno.some((v) => v > 0) ||
              logCaricatore.some((v) => v > 0)) && (
              <span className="text-[9px] font-black text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded-full">
                {logNelForno.filter((v) => v > 0).length +
                  logCaricatore.filter((v) => v > 0).length}
              </span>
            )}
          </button>
          <button
            onClick={() =>
              setCurrentView((v) => (v === "ordini" ? "calcoli" : "ordini"))
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              currentView === "ordini"
                ? "bg-violet-500/20 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                : "bg-slate-950/50 border-slate-800 hover:border-violet-500/30 hover:bg-violet-500/5"
            }`}
          >
            <ClipboardList
              className={`w-4 h-4 ${currentView === "ordini" ? "text-violet-400" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${currentView === "ordini" ? "text-violet-400" : "text-slate-400"}`}
            >
              Ordini
            </span>
            {ordini.length > 0 && (
              <span className="text-[9px] font-black text-violet-400 bg-violet-500/20 px-1.5 py-0.5 rounded-full">
                {ordini.length}
              </span>
            )}
          </button>
          <button
            onClick={() =>
              setCurrentView((v) => (v === "archivio" ? "calcoli" : "archivio"))
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              currentView === "archivio"
                ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                : "bg-slate-950/50 border-slate-800 hover:border-blue-500/30 hover:bg-blue-500/5"
            }`}
          >
            <Box
              className={`w-4 h-4 ${currentView === "archivio" ? "text-blue-400" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${currentView === "archivio" ? "text-blue-400" : "text-slate-400"}`}
            >
              Archivio DB
            </span>
            {dbArticoli.length > 0 && (
              <span className="text-[9px] font-black text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                {dbArticoli.length}
              </span>
            )}
          </button>
          <button
            onClick={() =>
              setCurrentView((v) => (v === "report" ? "calcoli" : "report"))
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              currentView === "report"
                ? "bg-rose-500/20 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                : "bg-slate-950/50 border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5"
            }`}
          >
            <FileText
              className={`w-4 h-4 ${currentView === "report" ? "text-rose-400" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${currentView === "report" ? "text-rose-400" : "text-slate-400"}`}
            >
              Report
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {currentView === "calcoli" && (
          <aside
            className={`
              w-4/5 sm:w-[340px] lg:w-[340px] 
              bg-[#0f172a] border-r border-slate-800 
              p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-6 
              shadow-[10px_0_30px_rgba(0,0,0,0.5)] lg:shadow-inner custom-scrollbar 
              fixed inset-y-0 left-0 z-50 h-full
              lg:relative lg:max-h-none lg:translate-x-0
              transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Close Button on Mobile Inside Sidebar */}
            <div className="flex justify-between items-center lg:hidden border-b border-slate-800 pb-2 mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                Parametri
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const activeOrd = ordini.find((o) => o.id === activeOrdineId);
              const activeIdx = ordini.findIndex(
                (o) => o.id === activeOrdineId,
              );
              const hasNext = activeIdx >= 0 && activeIdx < ordini.length - 1;
              const loadOrder = (ord: (typeof ordini)[0]) => {
                const r = computeOrdineResults(ord);
                setInputs((prev) => ({
                  ...prev,
                  tirataRiferimento:
                    ord.tirataRiferimento || prev.tirataRiferimento,
                  taglioRiferimento:
                    ord.taglioRiferimento || prev.taglioRiferimento,
                  fondello: ord.fondello,
                  lunghezzaBarra: ord.lunghezzaBarra,
                  numeroBarre: ord.numeroBarre,
                  numeroLuci: ord.numeroLuci,
                  pesoMTL: ord.pesoMTL,
                  scartoTesta: ord.scartoTesta,
                  scartoCoda: ord.scartoCoda,
                  billettoneId: r.logId,
                  taglioManuale: r.cut,
                  modalitaManuale: !r.isStandardMatched,
                }));
                if (r.isStandardMatched) setSelectedCut(r.cut);
                setActiveOrdineId(ord.id);
              };
              const archiveAndAdvance = (nextOrd?: (typeof ordini)[0]) => {
                if (activeOrd) {
                  const r = computeOrdineResults(activeOrd);
                  setCompletedOrders((prev) => [
                    {
                      id: activeOrd.id,
                      articolo: activeOrd.articolo,
                      numeroBarra: activeOrd.numeroBarra,
                      lega: activeOrd.lega,
                      billette: r.billette,
                      logsDecimali: r.logsDecimali,
                      logName: r.logName,
                      cut: r.cut,
                      // Ø206: ~90 kg/m di alluminio per la sezione della billetta
                      pesoLordo: Math.round((r.cut / 1000) * 90 * r.billette),
                      pesoNetto: Math.round(
                        activeOrd.numeroBarre *
                          (activeOrd.lunghezzaBarra / 1000) *
                          (activeOrd.pesoMTL / 1000),
                      ),
                      completedAt: new Date().toLocaleString("it-IT"),
                    },
                    ...prev,
                  ]);
                  setOrdini((prev) =>
                    prev.filter((o) => o.id !== activeOrd.id),
                  );
                }
                if (nextOrd) {
                  loadOrder(nextOrd);
                } else {
                  setActiveOrdineId(null);
                }
              };
              return activeOrd ? (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Activity className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] font-black text-violet-400/70 uppercase tracking-wider block">
                        In Estrusione
                      </span>
                      <span className="text-sm font-black text-white mono truncate block">
                        {activeOrd.articolo || "Senza nome"}
                        {activeOrd.numeroBarra
                          ? ` / ${activeOrd.numeroBarra}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasNext ? (
                      <button
                        onClick={() => archiveAndAdvance(ordini[activeIdx + 1])}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 text-[9px] font-black uppercase tracking-wider transition-colors"
                      >
                        Prossimo <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveAndAdvance()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase tracking-wider transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completa
                      </button>
                    )}
                  </div>
                </div>
              ) : null;
            })()}

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Zap className="w-3 h-3 text-emerald-500" />
                <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Calibrazione Ratio
                </h2>
              </div>
              <IndustrialInput
                label="Tirata Ottenuta (mm)"
                name="tirataRiferimento"
                value={inputs.tirataRiferimento}
                onChange={handleInputChange}
                highlight
                placeholder="es. 4800"
                tooltip="La lunghezza in millimetri della barra estrusa totale ottenuta dal banco in un ciclo precedente. Serve per calcolare il rapporto di allungamento reale."
              />

              <IndustrialInput
                label="Fondello (mm)"
                name="fondello"
                value={inputs.fondello}
                onChange={handleInputChange}
                placeholder="es. 17"
                tooltip="Spessore in millimetri della porzione di billetta non estrusa (fondello) che viene scartata ad ogni ciclo."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Layers className="w-3 h-3 text-blue-500" />
                <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Dati Commessa
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <IndustrialInput
                  label="L. Barra (mm)"
                  name="lunghezzaBarra"
                  value={inputs.lunghezzaBarra}
                  onChange={handleInputChange}
                  placeholder="es. 3000"
                />
                <IndustrialInput
                  label="Peso MTL (g/m)"
                  name="pesoMTL"
                  value={inputs.pesoMTL}
                  onChange={handleInputChange}
                  placeholder="es. 24368"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <IndustrialInput
                  label="Barre Ordine"
                  name="numeroBarre"
                  value={inputs.numeroBarre}
                  onChange={handleInputChange}
                  helper={`+10% Sfrido: ${Math.floor(inputs.numeroBarre * 1.1)} PZ`}
                  placeholder="es. 68"
                />
                <IndustrialInput
                  label="Num. Luci"
                  name="numeroLuci"
                  value={inputs.numeroLuci}
                  onChange={handleInputChange}
                  placeholder="es. 1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Ruler className="w-3 h-3 text-red-500" />
                <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Scarti Processo
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <IndustrialInput
                  label="Sfrido Testa"
                  name="scartoTesta"
                  value={inputs.scartoTesta}
                  onChange={handleInputChange}
                  placeholder="es. 600"
                  tooltip="Millimetri di scarto iniziali tagliati dalla testa della tirata."
                />
                <IndustrialInput
                  label="Sfrido Coda"
                  name="scartoCoda"
                  value={inputs.scartoCoda}
                  onChange={handleInputChange}
                  placeholder="es. 700"
                  tooltip="Millimetri di scarto finali tagliati dalla coda della tirata, compresi i segni dell'estrattore."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Activity className="w-3 h-3 text-cyan-500" />
                <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Tracking Produzione
                </h2>
              </div>
              <IndustrialInput
                label="Billette Estruse"
                name="billetteEstruse"
                value={inputs.billetteEstruse}
                onChange={handleInputChange}
                customColor={
                  results.isValid && inputs.billetteEstruse > 0
                    ? results.isCompletato
                      ? "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                    : undefined
                }
                helper={
                  results.isValid
                    ? `${results.billetteRimanenti} billette rimanenti`
                    : undefined
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Factory className="w-3 h-3 text-amber-500" />
                <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Configurazione Forno
                </h2>
              </div>

              <div className="space-y-3">
                <select
                  name="billettoneId"
                  value={inputs.billettoneId}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, billettoneId: e.target.value }))
                  }
                  className="w-full bg-slate-950 text-white border-2 border-slate-800 p-2.5 text-sm font-black rounded-lg focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {BILLET_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.length}mm)
                    </option>
                  ))}
                </select>

                <div
                  onClick={toggleGiunta}
                  className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Link2
                      className={`w-3 h-3 ${inputs.abilitaGiunta ? "text-blue-400" : "text-slate-500"}`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase ${inputs.abilitaGiunta ? "text-blue-400" : "text-slate-400"}`}
                    >
                      Abilita Compensato
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${inputs.abilitaGiunta ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-slate-700"}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${inputs.abilitaGiunta ? "left-6" : "left-1"}`}
                    ></div>
                  </div>
                </div>

                <div
                  onClick={toggleManualMode}
                  className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors group"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">
                    Modalità Manuale
                  </span>
                  <div
                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${inputs.modalitaManuale ? "bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.4)]" : "bg-slate-700"}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${inputs.modalitaManuale ? "left-6" : "left-1"}`}
                    ></div>
                  </div>
                </div>

                {inputs.modalitaManuale && (
                  <div className="animate-in slide-in-from-top-2 space-y-2">
                    <IndustrialInput
                      label="Taglio Attivo (mm)"
                      name="taglioManuale"
                      value={inputs.taglioManuale}
                      onChange={handleInputChange}
                      customColor="border-amber-500/50 text-amber-400"
                      placeholder="es. 894"
                      optional
                      tooltip="Forza la pressa a scavalcare l'ottimizzazione e tagliare la billetta esattamente a questa misura in mm."
                    />
                    {inputs.taglioManuale > 0 && results.isValid && (
                      <div className="flex justify-end pr-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400/90 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shadow-sm">
                          Tirata Stimata:{" "}
                          {(results.tirataProiettata / 1000).toFixed(1)}m
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        <section className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-[#020617] custom-scrollbar">
          {currentView === "calcoli" && !results.isValid ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-75 p-6 space-y-3">
              <AlertTriangle
                className={`w-16 h-16 ${results.errors.length > 0 && inputs.modalitaManuale && inputs.taglioManuale > 0 ? "text-rose-500 animate-pulse" : "text-amber-500"} mb-2`}
              />
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-300">
                {results.errors.length > 0 &&
                inputs.modalitaManuale &&
                inputs.taglioManuale > 0
                  ? "Billetta Troppo Corta"
                  : "Dati Insufficienti"}
              </h2>
              {results.errors.length > 0 &&
              inputs.modalitaManuale &&
              inputs.taglioManuale > 0 ? (
                <p className="text-rose-400/90 max-w-md text-sm font-medium">
                  {results.errors[0] === "Tirata proiettata insufficiente"
                    ? "La lunghezza della billetta inserita non è sufficiente per ottenere nemmeno una barra con questo profilo considerando gli scarti."
                    : results.errors[0]}
                </p>
              ) : (
                <p className="text-slate-500 max-w-md text-sm">
                  Compila i campi richiesti nel pannello di sinistra per
                  visualizzare i risultati del calcolo e ottimizzare il ciclo
                  produttivo.
                </p>
              )}
            </div>
          ) : currentView === "calcoli" ? (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResultCard
                  label="Billette Totali"
                  value={
                    results.numCorte > 0
                      ? `${results.billetteTotaliNecessarie} + ${results.numCorte} corte`
                      : results.billetteTotaliNecessarie.toString()
                  }
                  unit="PZ"
                  sub={
                    inputs.abilitaGiunta
                      ? `${results.bpbEffettivo} pz/bill · ${(results.totalMetriLineari / 1000).toFixed(1)}m lineari`
                      : results.numCorte > 0
                        ? `${results.bpbEffettivo} pz/bill · ${results.bpbCorta} pz/corta`
                        : `Produzione barre: ${results.bpbEffettivo} pz/billetta`
                  }
                  icon={<Layers className="w-5 h-5" />}
                  highlight
                />
                <ResultCard
                  label={
                    results.bestRecommendation
                      ? "Log Raccomandato"
                      : "Advisor Log"
                  }
                  value={
                    results.bestRecommendation
                      ? `${results.bestRecommendation.logName}`
                      : results.billetAdvisor.name
                  }
                  unit="LOG"
                  sub={
                    results.bestRecommendation
                      ? `Taglio ${results.bestRecommendation.cut}mm · ${results.bestRecommendation.bpb} barre/bill · ${Math.ceil(results.bestRecommendation.logs)} logs`
                      : `Sfrido log: ${results.billetAdvisor.waste.toFixed(0)} mm`
                  }
                  icon={<ThumbsUp className="w-5 h-5" />}
                  highlight={
                    results.bestRecommendation?.isCurrentLog ||
                    results.billetAdvisor.id === inputs.billettoneId
                  }
                  color={
                    results.bestRecommendation?.isCurrentCut
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                />
                <ResultCard
                  label="Carico Log"
                  value={
                    results.metriRimanenti > 0
                      ? `${results.logsInteri} LOG + ${results.metriRimanenti.toFixed(0)}mm`
                      : `${results.logsInteri} LOG`
                  }
                  unit="LOGS"
                  sub={
                    inputs.abilitaGiunta
                      ? `${(results.totalMetriLineari / 1000).toFixed(1)}m lineari · ${results.logsDecimali.toFixed(2)} logs`
                      : `Totale: ${results.logsDecimali.toFixed(2)} logs`
                  }
                  icon={<Factory className="w-5 h-5" />}
                />
                <ResultCard
                  label="Peso Totale"
                  value={results.pesoProduzione.toFixed(1)}
                  unit="kg"
                  sub={`Include sfrido 10%: ${results.barreConSfrido} pz`}
                  icon={<BarChart3 className="w-5 h-5 text-amber-500" />}
                />
              </div>

              {results.warnings.length > 0 && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  {results.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase">
                        {w}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {inputs.billetteEstruse > 0 && (
                <div
                  className={`border rounded-xl p-4 space-y-3 animate-in slide-in-from-bottom-2 transition-all duration-500 ${
                    results.isCompletato
                      ? "bg-emerald-500/[0.06] border-emerald-500/30"
                      : "bg-cyan-500/[0.04] border-cyan-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          results.isCompletato
                            ? "bg-emerald-500 shadow-sm shadow-emerald-500/20"
                            : "bg-cyan-500 shadow-sm shadow-cyan-500/20"
                        }`}
                      >
                        {results.isCompletato ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                        ) : (
                          <Activity className="w-3.5 h-3.5 text-slate-950" />
                        )}
                      </div>
                      <div>
                        <h4
                          className={`text-[9px] font-black uppercase tracking-widest ${
                            results.isCompletato
                              ? "text-emerald-400"
                              : "text-cyan-400"
                          }`}
                        >
                          {results.isCompletato
                            ? "Produzione Completata"
                            : "Avanzamento Produzione"}
                        </h4>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">
                          {inputs.billetteEstruse} /{" "}
                          {results.billetteTotaliNecessarie} billette
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-lg font-black mono ${
                        results.isCompletato
                          ? "text-emerald-400"
                          : "text-cyan-400"
                      }`}
                    >
                      {results.progressPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        results.isCompletato
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      }`}
                      style={{ width: `${results.progressPercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                      <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                        Billette Rimaste
                      </span>
                      <span
                        className={`text-sm font-black mono ${
                          results.billetteRimanenti === 0
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {results.billetteRimanenti}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                      <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                        Barre Prodotte
                      </span>
                      <span className="text-sm font-black text-cyan-400 mono">
                        {results.barreEstruseTotali}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                      <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                        Barre Rimaste
                      </span>
                      <span
                        className={`text-sm font-black mono ${
                          results.barreRimanenti === 0
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {results.barreRimanenti}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                      <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                        Logs Rimasti
                      </span>
                      <span
                        className={`text-sm font-black mono ${
                          results.logsRimanenti <= 0
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {results.logsRimanenti <= 0
                          ? "0"
                          : results.metriRimanentiTracking > 0
                            ? `${results.logsRimanentiInteri} LOG + ${results.metriRimanentiTracking.toFixed(0)}mm`
                            : `${results.logsRimanentiInteri} LOG`}
                      </span>
                    </div>
                  </div>

                  {results.isCompletato &&
                    inputs.billetteEstruse >
                      results.billetteTotaliNecessarie && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[9px] font-bold text-amber-300">
                          Estruse{" "}
                          {inputs.billetteEstruse -
                            results.billetteTotaliNecessarie}{" "}
                          billette in eccesso
                        </span>
                      </div>
                    )}
                </div>
              )}

              {!inputs.modalitaManuale && !inputs.abilitaGiunta && (
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <List className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tagli Ottimizzati — {selectedLog?.name}
                      </h3>
                    </div>
                    {results.bestRecommendation &&
                      !results.bestRecommendation.isCurrentLog && (
                        <button
                          onClick={() =>
                            setInputs((p) => ({
                              ...p,
                              billettoneId: results.bestRecommendation!.logId,
                            }))
                          }
                          className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
                        >
                          Usa {results.bestRecommendation.logName} ↗
                        </button>
                      )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {selectedLog?.options.map((opt) => {
                      const isSelected = selectedCut === opt.length;
                      const rec = results.logRecommendations.find(
                        (r) => r.isCurrentLog && r.cut === opt.length,
                      );
                      const isBest =
                        results.bestRecommendation?.isCurrentLog &&
                        results.bestRecommendation?.cut === opt.length;
                      return (
                        <button
                          key={opt.length}
                          onClick={() => setSelectedCut(opt.length)}
                          className={`group p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 relative ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10"
                              : isBest
                                ? "border-amber-500/50 bg-amber-500/5"
                                : "border-slate-800 bg-slate-950/50"
                          }`}
                        >
                          {isBest && !isSelected && (
                            <span className="absolute -top-2 text-[7px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">
                              Best
                            </span>
                          )}
                          <span
                            className={`text-xl font-black mono ${isSelected ? "text-white" : isBest ? "text-amber-400" : "text-slate-500"}`}
                          >
                            {opt.length}
                          </span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">
                            {opt.pieces} PZ
                          </span>
                          {rec && (
                            <span className="text-[8px] font-bold text-slate-600 mono">
                              {rec.bpb} barre
                            </span>
                          )}
                          {rec && (
                            <span
                              className={`text-[9.5px] font-black mono mt-1 px-1.5 py-0.5 rounded-sm ${isSelected ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-cyan-500/10 text-cyan-500/80 border border-cyan-500/20"}`}
                            >
                              TIRATA: {(rec.tirata / 1000).toFixed(1)}m
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {results.bestRecommendation && (
                    <div
                      className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${
                        results.bestRecommendation.isCurrentCut
                          ? "bg-emerald-500/[0.06] border-emerald-500/30"
                          : "bg-amber-500/[0.06] border-amber-500/30"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          results.bestRecommendation.isCurrentCut
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      />
                      <div className="space-y-1">
                        <span
                          className={`text-[9px] font-black uppercase ${
                            results.bestRecommendation.isCurrentCut
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {results.bestRecommendation.isCurrentCut
                            ? "Stai usando il taglio ottimale!"
                            : `Raccomandato: ${results.bestRecommendation.logName} × ${results.bestRecommendation.cut}mm`}
                        </span>
                        <p className="text-[8px] font-bold text-slate-500 leading-relaxed">
                          Tirata{" "}
                          {(results.bestRecommendation.tirata / 1000).toFixed(
                            1,
                          )}
                          m · {results.bestRecommendation.bpb} barre/bill ·{" "}
                          {Math.ceil(results.bestRecommendation.logs)} logs ·{" "}
                          {results.bestRecommendation.pesoBilletta.toFixed(1)}{" "}
                          kg/bill
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative">
                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                      <Box className="w-4 h-4 text-emerald-500" /> Geometria Log{" "}
                      {selectedLog?.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic">
                      Taglio: {results.cutUtilizzato}mm |{" "}
                      {inputs.abilitaGiunta
                        ? "Modalità Compensato"
                        : "Modalità Standard"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">
                      {inputs.abilitaGiunta
                        ? "Avanzo x Compensato"
                        : "Stato Fondo"}
                    </span>
                    <span
                      className={`text-2xl font-black mono ${results.scartoResiduoLog === 0 ? "text-emerald-500" : inputs.abilitaGiunta ? "text-blue-400" : results.isCortaRecuperabile ? "text-emerald-400" : "text-red-500"}`}
                    >
                      {results.scartoResiduoLog.toFixed(0)}{" "}
                      <span className="text-xs">mm</span>
                    </span>
                  </div>
                </div>

                <div className="relative pt-4 z-10">
                  <div className="w-full h-24 bg-slate-950 rounded-2xl flex border-4 border-slate-900 shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] overflow-hidden p-1.5 gap-1.5">
                    {Array.from({ length: results.pezziInteriPerLog }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="h-full flex flex-col items-center justify-center relative transition-all duration-700"
                          style={{
                            width: `${(results.cutUtilizzato / (selectedLog?.length || 1)) * 100}%`,
                            background:
                              "linear-gradient(180deg, #334155 0%, #0f172a 100%)",
                          }}
                        >
                          <div className="absolute top-2 text-[8px] font-black text-slate-700">
                            {i + 1}
                          </div>
                          <span className="text-[11px] font-black text-emerald-500/60 mono">
                            {results.cutUtilizzato}
                          </span>
                          <div className="absolute bottom-0 w-full h-1 bg-emerald-500/30"></div>
                        </div>
                      ),
                    )}

                    {results.scartoResiduoLog > 0 && (
                      <div
                        className={`flex-1 h-full flex items-center justify-center border-l relative overflow-hidden transition-all duration-500 ${inputs.abilitaGiunta ? "bg-blue-950/40 border-blue-900/40" : results.isCortaRecuperabile ? "bg-emerald-950/40 border-emerald-900/40" : "bg-red-950/30 border-red-900/40"}`}
                      >
                        <div
                          className="absolute inset-0 opacity-10"
                          style={
                            !inputs.abilitaGiunta &&
                            !results.isCortaRecuperabile
                              ? {
                                  backgroundImage:
                                    "repeating-linear-gradient(45deg, #000, #000 10px, #ff0000 10px, #ff0000 20px)",
                                }
                              : {}
                          }
                        ></div>
                        <div className="flex flex-col items-center z-10 text-center px-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${inputs.abilitaGiunta ? "text-blue-400" : results.isCortaRecuperabile ? "text-emerald-400" : "text-red-600"}`}
                          >
                            {inputs.abilitaGiunta
                              ? "INIZIO COMPENSATO"
                              : results.isCortaRecuperabile
                                ? "CORTA"
                                : "SCARTO"}
                          </span>
                          <span
                            className={`text-[10px] font-bold mono ${inputs.abilitaGiunta ? "text-blue-300" : results.isCortaRecuperabile ? "text-emerald-300" : "text-red-500"}`}
                          >
                            {results.scartoResiduoLog.toFixed(0)}mm
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        Analisi Resa
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/50">
                      <MetricRow
                        label="Utile Netto"
                        value={`${results.utileNettoProfilo.toFixed(0)} mm`}
                        sub="Profilo pianificato"
                        color="text-emerald-400"
                      />
                      <MetricRow
                        label="Resa Standard"
                        value={`${results.bpbEffettivo} PZ`}
                        sub="Barre per billetta"
                        color="text-amber-500"
                      />
                      <MetricRow
                        label="Billette Necessarie"
                        value={`${results.billetteTotaliNecessarie} PZ`}
                        sub="Cicli pressa totali"
                        color="text-blue-400"
                      />
                      <MetricRow
                        label="Carico Ordine"
                        value={`${results.logsInteri} LOG`}
                        sub="Totale logs ordine"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-6">
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-800">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Efficienza Recupero Forno
                        </span>
                        <span className="text-sm font-black text-emerald-500 mono">
                          {inputs.abilitaGiunta
                            ? "99.5"
                            : results.scartoResiduoLog === 0
                              ? "100.0"
                              : (
                                  ((results.pezziInteriPerLog *
                                    results.cutUtilizzato +
                                    (results.isCortaRecuperabile
                                      ? results.scartoResiduoLog
                                      : 0)) /
                                    (selectedLog?.length || 1)) *
                                  100
                                ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          style={{
                            width: inputs.abilitaGiunta
                              ? "99.5%"
                              : results.scartoResiduoLog === 0
                                ? "100%"
                                : `${((results.pezziInteriPerLog * results.cutUtilizzato + (results.isCortaRecuperabile ? results.scartoResiduoLog : 0)) / (selectedLog?.length || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">
                          Peso Ordine
                        </span>
                        <span className="text-sm font-black text-white mono">
                          {results.pesoOrdine.toFixed(1)} kg
                        </span>
                      </div>
                      <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">
                          Scarto Stimato
                        </span>
                        <span className="text-sm font-black text-red-400 mono">
                          {(
                            results.pesoProduzione - results.pesoOrdine
                          ).toFixed(1)}{" "}
                          kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {results.isCortaRecuperabile && (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 flex items-start gap-5 animate-in slide-in-from-bottom-2">
                  <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                    <Scissors className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Recupero Fondo Log
                    </h4>
                    <p className="text-[11px] text-emerald-300/80 mt-1 leading-relaxed">
                      L'avanzo di <b>{results.scartoResiduoLog.toFixed(0)}mm</b>{" "}
                      permette una billetta corta da{" "}
                      <b>{results.bpbCorta} barre</b>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : currentView === "gestione-log" ? (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 p-6 lg:p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Gestione Log
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView("calcoli")}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Torna ai Calcoli
                </button>
              </div>

              {(() => {
                const logCaricati = logNelForno.filter(
                  (v) => v !== null,
                ).length;
                const totalMmForno = logNelForno.reduce(
                  (s, v) => s + (v?.length || 0),
                  0,
                );
                const totalMmCaricatoreAll = logCaricatore.reduce(
                  (s, v) => s + (v?.length || 0),
                  0,
                );
                const logLen = selectedLog?.length || 1;
                const totalMmNeeded = results.logsDecimali * logLen;
                const totalMmCaricati = totalMmForno + totalMmCaricatoreAll;
                const mmRimanenti = Math.max(
                  0,
                  totalMmNeeded - totalMmCaricati,
                );
                const mmSurplus = Math.max(0, totalMmCaricati - totalMmNeeded);
                const logsMancInteri = Math.floor(mmRimanenti / logLen);
                const mmMancFrazione = mmRimanenti - logsMancInteri * logLen;
                const tuttiCaricati = logCaricati > 0 && mmRimanenti <= 0;

                return (
                  <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Log nel Forno
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase">
                          {logCaricati} / 5 caricati
                        </span>
                        {logCaricati > 0 && (
                          <button
                            onClick={() => {
                              setLogNelForno([0, 0, 0, 0, 0]);
                              setEditingSlot(null);
                            }}
                            className="flex items-center gap-1 text-[8px] font-black uppercase text-red-400/60 hover:text-red-400 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {logNelForno.map((val, i) => (
                        <div key={i} className="flex-1">
                          {editingSlot === i ? (
                            <div className="h-20 rounded-xl border-2 border-orange-500/50 bg-slate-950 flex flex-col items-center justify-center p-2">
                              <input
                                type="number"
                                autoFocus
                                min={0}
                                max={8000}
                                placeholder="mm"
                                defaultValue={val !== null ? val.length : ""}
                                onBlur={(e) => {
                                  if (e.currentTarget.dataset.navigating)
                                    return;
                                  const v = Math.min(
                                    8000,
                                    Math.max(0, parseInt(e.target.value) || 0),
                                  );
                                  setLogNelForno((prev) => {
                                    const n = [...prev];
                                    n[i] =
                                      v > 0
                                        ? {
                                            length: v,
                                            lega: val?.lega || "6060",
                                          }
                                        : null;
                                    return n;
                                  });
                                  setEditingSlot(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Tab" || e.key === "Enter") {
                                    e.preventDefault();
                                    const v = Math.min(
                                      8000,
                                      Math.max(
                                        0,
                                        parseInt(
                                          (e.target as HTMLInputElement).value,
                                        ) || 0,
                                      ),
                                    );
                                    setLogNelForno((prev) => {
                                      const n = [...prev];
                                      n[i] =
                                        v > 0
                                          ? {
                                              length: v,
                                              lega: val?.lega || "6060",
                                            }
                                          : null;
                                      return n;
                                    });
                                    const next = e.shiftKey ? i - 1 : i + 1;
                                    if (next >= 0 && next < 5) {
                                      (
                                        e.currentTarget as HTMLInputElement
                                      ).dataset.navigating = "1";
                                      setEditingSlot(next);
                                    } else {
                                      setEditingSlot(null);
                                    }
                                  } else if (e.key === "Escape") {
                                    (
                                      e.currentTarget as HTMLInputElement
                                    ).dataset.navigating = "1";
                                    setEditingSlot(null);
                                  }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-transparent text-center text-lg font-black text-orange-400 mono outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="text-[7px] font-black text-orange-500/60 uppercase">
                                Tab ➜ prossimo
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingSlot(i)}
                              className={`w-full h-20 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-0.5 relative ${
                                val !== null
                                  ? `${ALLOY_COLORS[val.lega].border} bg-gradient-to-b ${ALLOY_COLORS[val.lega].bg} to-transparent shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                                  : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                              }`}
                            >
                              {val !== null && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLogNelForno((prev) => {
                                      const n = [...prev];
                                      n[i] = null;
                                      return n;
                                    });
                                  }}
                                  className="absolute top-1 right-1.5 text-[9px] font-black text-slate-500 hover:text-red-400 cursor-pointer transition-colors z-10"
                                >
                                  ✕
                                </span>
                              )}
                              {val !== null ? (
                                <>
                                  <span
                                    className={`text-lg font-black mono ${ALLOY_COLORS[val.lega].text}`}
                                  >
                                    {val.length}
                                  </span>
                                  <span
                                    className={`text-[7px] font-black uppercase ${ALLOY_COLORS[val.lega].text} opacity-70`}
                                  >
                                    mm
                                  </span>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLogNelForno((prev) => {
                                        const n = [...prev];
                                        if (n[i] !== null) {
                                          const alloys: AluminumAlloy[] = [
                                            "6082",
                                            "6060",
                                            "3103",
                                            "1050",
                                            "6005",
                                            "6063",
                                            "6061",
                                          ];
                                          const cIdx = alloys.indexOf(
                                            n[i]!.lega,
                                          );
                                          n[i] = {
                                            ...n[i]!,
                                            lega: alloys[
                                              (cIdx + 1) % alloys.length
                                            ],
                                          };
                                        }
                                        return n;
                                      });
                                    }}
                                    className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer hover:brightness-125 transition-all ${ALLOY_COLORS[val.lega].bg} ${ALLOY_COLORS[val.lega].text} border ${ALLOY_COLORS[val.lega].border}`}
                                    title="Clicca per cambiare Lega"
                                  >
                                    {val.lega}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Factory className="w-5 h-5 text-slate-700" />
                                  <span className="text-[8px] font-black uppercase text-slate-700">
                                    Vuoto
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {logCaricati > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Metri nel Forno
                          </span>
                          <span className="text-lg font-black text-orange-400 mono">
                            {(totalMmForno / 1000).toFixed(1)}m
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Carico Necessario
                          </span>
                          <span className="text-lg font-black text-white mono">
                            {results.metriRimanenti > 0
                              ? `${results.logsInteri} LOG + ${results.metriRimanenti.toFixed(0)}mm`
                              : `${results.logsInteri} LOG`}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Logs Mancanti
                          </span>
                          <span
                            className={`text-lg font-black mono ${tuttiCaricati ? "text-emerald-400" : "text-amber-400"}`}
                          >
                            {tuttiCaricati
                              ? mmSurplus > 0
                                ? `+${mmSurplus.toFixed(0)}mm`
                                : "0"
                              : mmMancFrazione > 0
                                ? `${logsMancInteri} LOG + ${mmMancFrazione.toFixed(0)}mm`
                                : `${logsMancInteri} LOG`}
                          </span>
                        </div>
                      </div>
                    )}

                    {tuttiCaricati && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-[9px] font-bold text-emerald-300 uppercase">
                          Tutti i log sono caricati!
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const logCaricatiC = logCaricatore.filter(
                  (v) => v !== null,
                ).length;
                const totalMmCaricatore = logCaricatore.reduce(
                  (s, v) => s + (v?.length || 0),
                  0,
                );

                return (
                  <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-blue-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Log Caricatore
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase">
                          {logCaricatiC} / 12 caricati
                        </span>
                        {logCaricatiC > 0 && (
                          <button
                            onClick={() => {
                              setLogCaricatore(Array(12).fill(0));
                              setEditingSlotCaricatore(null);
                            }}
                            className="flex items-center gap-1 text-[8px] font-black uppercase text-red-400/60 hover:text-red-400 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {logCaricatore.map((val, i) => (
                        <div key={i}>
                          {editingSlotCaricatore === i ? (
                            <div className="h-16 rounded-lg border-2 border-blue-500/50 bg-slate-950 flex flex-col items-center justify-center p-1.5">
                              <input
                                type="number"
                                autoFocus
                                min={0}
                                max={8000}
                                placeholder="mm"
                                defaultValue={val !== null ? val.length : ""}
                                onBlur={(e) => {
                                  if (e.currentTarget.dataset.navigating)
                                    return;
                                  const v = Math.min(
                                    8000,
                                    Math.max(0, parseInt(e.target.value) || 0),
                                  );
                                  setLogCaricatore((prev) => {
                                    const n = [...prev];
                                    n[i] =
                                      v > 0
                                        ? {
                                            length: v,
                                            lega: val?.lega || "6060",
                                          }
                                        : null;
                                    return n;
                                  });
                                  setEditingSlotCaricatore(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Tab" || e.key === "Enter") {
                                    e.preventDefault();
                                    const v = Math.min(
                                      8000,
                                      Math.max(
                                        0,
                                        parseInt(
                                          (e.target as HTMLInputElement).value,
                                        ) || 0,
                                      ),
                                    );
                                    setLogCaricatore((prev) => {
                                      const n = [...prev];
                                      n[i] =
                                        v > 0
                                          ? {
                                              length: v,
                                              lega: val?.lega || "6060",
                                            }
                                          : null;
                                      return n;
                                    });
                                    const next = e.shiftKey ? i - 1 : i + 1;
                                    if (next >= 0 && next < 12) {
                                      (
                                        e.currentTarget as HTMLInputElement
                                      ).dataset.navigating = "1";
                                      setEditingSlotCaricatore(next);
                                    } else {
                                      setEditingSlotCaricatore(null);
                                    }
                                  } else if (e.key === "Escape") {
                                    (
                                      e.currentTarget as HTMLInputElement
                                    ).dataset.navigating = "1";
                                    setEditingSlotCaricatore(null);
                                  }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-transparent text-center text-sm font-black text-blue-400 mono outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="text-[6px] font-black text-blue-500/60 uppercase">
                                Tab ➜
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingSlotCaricatore(i)}
                              className={`w-full h-16 rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-0.5 relative ${
                                val !== null
                                  ? `${ALLOY_COLORS[val.lega].border} bg-gradient-to-b ${ALLOY_COLORS[val.lega].bg} to-transparent shadow-[0_0_10px_rgba(0,0,0,0.15)]`
                                  : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                              }`}
                            >
                              {val !== null && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLogCaricatore((prev) => {
                                      const n = [...prev];
                                      n[i] = null;
                                      return n;
                                    });
                                  }}
                                  className="absolute top-0.5 right-1 text-[8px] font-black text-slate-500 hover:text-red-400 cursor-pointer transition-colors z-10"
                                >
                                  ✕
                                </span>
                              )}
                              {val !== null ? (
                                <>
                                  <span
                                    className={`text-sm font-black mono ${ALLOY_COLORS[val.lega].text}`}
                                  >
                                    {val.length}
                                  </span>
                                  <span
                                    className={`text-[6px] font-black uppercase ${ALLOY_COLORS[val.lega].text} opacity-70`}
                                  >
                                    mm
                                  </span>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLogCaricatore((prev) => {
                                        const n = [...prev];
                                        if (n[i] !== null) {
                                          const alloys: AluminumAlloy[] = [
                                            "6082",
                                            "6060",
                                            "3103",
                                            "1050",
                                            "6005",
                                            "6063",
                                            "6061",
                                          ];
                                          const cIdx = alloys.indexOf(
                                            n[i]!.lega,
                                          );
                                          n[i] = {
                                            ...n[i]!,
                                            lega: alloys[
                                              (cIdx + 1) % alloys.length
                                            ],
                                          };
                                        }
                                        return n;
                                      });
                                    }}
                                    className={`mt-1 px-1 py-px rounded text-[8px] leading-tight font-black uppercase cursor-pointer hover:brightness-125 transition-all ${ALLOY_COLORS[val.lega].bg} ${ALLOY_COLORS[val.lega].text} border ${ALLOY_COLORS[val.lega].border}`}
                                    title="Clicca per cambiare Lega"
                                  >
                                    {val.lega}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[7px] font-black uppercase text-slate-700">
                                  Vuoto
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {logCaricatiC > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Log Caricatore
                          </span>
                          <span className="text-lg font-black text-blue-400 mono">
                            {logCaricatiC}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Metri Caricatore
                          </span>
                          <span className="text-lg font-black text-blue-400 mono">
                            {(totalMmCaricatore / 1000).toFixed(1)}m
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : currentView === "ordini" ? (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 p-6 lg:p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-violet-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Gestione Ordini
                  </h2>
                  {ordini.length > 0 && (
                    <span className="text-[9px] font-black text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full">
                      {ordini.length} ordini
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newOrd: Ordine = {
                        id: Date.now().toString(),
                        articolo: "",
                        numeroBarra: "", // New field
                        lega: "",
                        tirataRiferimento: 4800,
                        taglioRiferimento: 894,
                        fondello: 17,
                        lunghezzaBarra: 3000,
                        numeroBarre: 0,
                        numeroLuci: 1,
                        pesoMTL: 24.368,
                        scartoTesta: 600,
                        scartoCoda: 700,
                        billettoneId: "8000",
                        taglioManuale: 894,
                        abilitaGiunta: false,
                      };
                      setOrdini((prev) => [...prev, newOrd]);
                      setExpandedOrdine(newOrd.id);
                    }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-violet-400 bg-violet-500/10 border border-violet-500/30 px-4 py-2 rounded-lg hover:bg-violet-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Aggiungi Ordine
                  </button>
                  <button
                    onClick={() => setCurrentView("calcoli")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Calcoli
                  </button>
                </div>
              </div>

              <div
                className={`flex items-center gap-4 bg-slate-900/50 border rounded-xl p-4 transition-all duration-300 ${barcodeFeedback === "success" ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : barcodeFeedback === "error" ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-slate-800 focus-within:border-violet-500/50"}`}
              >
                <div
                  className={`p-2 rounded-lg ${barcodeFeedback === "success" ? "bg-emerald-500/20 text-emerald-400" : barcodeFeedback === "error" ? "bg-red-500/20 text-red-400" : "bg-violet-500/20 text-violet-400"}`}
                >
                  <ScanLine className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Scanner Ordine cartaceo
                  </span>
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        processBarcodeString(barcodeInput);
                      }
                    }}
                    placeholder="Scansiona qui o incolla la stringa dell'ordine..."
                    className="w-full bg-transparent text-sm font-black mono text-white outline-none placeholder:text-slate-600"
                  />
                </div>
                {barcodeFeedback === "success" && (
                  <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded">
                    Inserito ✓
                  </span>
                )}
                {barcodeFeedback === "error" && (
                  <span className="text-[10px] font-black text-red-400 uppercase bg-red-500/10 px-2 py-1 rounded">
                    Errore formato ✗
                  </span>
                )}
              </div>

              {ordini.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                  <ClipboardList className="w-12 h-12 text-violet-500/50 mb-4" />
                  <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    Nessun ordine inserito
                  </p>
                  <p className="text-[9px] text-slate-600 mt-1">
                    Clicca "Aggiungi Ordine" per iniziare
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordiniResults.map((ord) => {
                    const isExpanded = expandedOrdine === ord.id;
                    const r = ord.results;
                    return (
                      <div
                        key={ord.id}
                        className={`bg-slate-900/30 border rounded-xl transition-all duration-300 overflow-hidden ${
                          isExpanded
                            ? "border-violet-500/40"
                            : "border-slate-800"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                          onClick={() =>
                            setExpandedOrdine(isExpanded ? null : ord.id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-violet-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            )}
                            <div>
                              <span className="text-sm font-black text-white mono flex items-center gap-2">
                                {ord.articolo || "Nuovo Articolo"}
                                {ord.numeroBarra && (
                                  <span className="text-slate-500">
                                    /{ord.numeroBarra}
                                  </span>
                                )}
                                {ord.numeroBarra && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDieModal({
                                        articolo: ord.articolo,
                                        numeroBarra: ord.numeroBarra!,
                                      });
                                    }}
                                    className="flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 transition-colors"
                                    title="Storico Matrice"
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </span>
                              {ord.lega && (
                                <span className="text-[11px] font-bold text-amber-400/70 ml-2">
                                  {ord.lega}
                                </span>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold text-slate-500">
                                  {r.bpb} barre/bill
                                  {r.giuntaExtra > 0
                                    ? ` (+${r.giuntaExtra} comp.)`
                                    : ""}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                  {r.billette} billette
                                </span>
                                <span className="text-[10px] font-bold text-violet-400">
                                  {Math.ceil(r.logsDecimali)} logs ({r.logName})
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                  {ord.numeroBarre} barre (+10% ={" "}
                                  {Math.floor(ord.numeroBarre * 1.1)})
                                </span>
                                {ord.abilitaGiunta && (
                                  <span className="text-[10px] font-bold text-cyan-400">
                                    COMP.
                                  </span>
                                )}
                                {r.isAutoOptimized && (
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    AUTO-CUT: {r.cut}mm
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInputs((prev) => ({
                                  ...prev,
                                  tirataRiferimento:
                                    ord.tirataRiferimento ||
                                    prev.tirataRiferimento,
                                  taglioRiferimento:
                                    ord.taglioRiferimento ||
                                    prev.taglioRiferimento,
                                  fondello: ord.fondello,
                                  lunghezzaBarra: ord.lunghezzaBarra,
                                  numeroBarre: ord.numeroBarre,
                                  numeroLuci: ord.numeroLuci,
                                  pesoMTL: ord.pesoMTL,
                                  scartoTesta: ord.scartoTesta,
                                  scartoCoda: ord.scartoCoda,
                                  billettoneId: r.logId,
                                  taglioManuale: r.cut,
                                  modalitaManuale: !r.isStandardMatched, // do not active manual if standard matched
                                }));
                                if (r.isStandardMatched) {
                                  setSelectedCut(r.cut);
                                }
                                setActiveOrdineId(ord.id);
                                setCurrentView("calcoli");
                              }}
                              className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors text-[9px] font-black uppercase tracking-wider"
                            >
                              Inizia
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrdini((prev) =>
                                  prev.filter((o) => o.id !== ord.id),
                                );
                                if (expandedOrdine === ord.id)
                                  setExpandedOrdine(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4 border-t border-slate-800/50 pt-4 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                  N° Articolo
                                </label>
                                <input
                                  value={ord.articolo}
                                  onChange={(e) =>
                                    setOrdini((prev) =>
                                      prev.map((o) =>
                                        o.id === ord.id
                                          ? { ...o, articolo: e.target.value }
                                          : o,
                                      ),
                                    )
                                  }
                                  placeholder="Es. A-12345"
                                  className="w-full bg-slate-950/50 border border-violet-500/30 rounded-lg px-3 py-2 text-sm font-black text-violet-300 mono outline-none focus:border-violet-500"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                  Lega
                                </label>
                                <input
                                  value={ord.lega}
                                  onChange={(e) =>
                                    setOrdini((prev) =>
                                      prev.map((o) =>
                                        o.id === ord.id
                                          ? { ...o, lega: e.target.value }
                                          : o,
                                      ),
                                    )
                                  }
                                  placeholder="Es. 6060"
                                  className="w-full bg-slate-950/50 border border-amber-500/30 rounded-lg px-3 py-2 text-sm font-black text-amber-300 mono outline-none focus:border-amber-500"
                                />
                              </div>
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 block">
                                  N° Barra
                                </label>
                                <input
                                  type="text"
                                  value={ord.numeroBarra || ""}
                                  placeholder="es. 3A"
                                  onChange={(e) =>
                                    setOrdini((prev) =>
                                      prev.map((o) =>
                                        o.id === ord.id
                                          ? {
                                              ...o,
                                              numeroBarra:
                                                e.target.value.toUpperCase(),
                                            }
                                          : o,
                                      ),
                                    )
                                  }
                                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm font-black text-white mono outline-none focus:border-violet-500/50 transition-colors uppercase"
                                />
                              </div>
                              {[
                                {
                                  label: "Tirata Rif. (mm)",
                                  key: "tirataRiferimento",
                                  optional: true,
                                },
                                {
                                  label: "Taglio Rif. (mm)",
                                  key: "taglioRiferimento",
                                  optional: true,
                                },
                                { label: "Fondello (mm)", key: "fondello" },
                                {
                                  label: "Lungh. Barra (mm)",
                                  key: "lunghezzaBarra",
                                },
                                {
                                  label: `N° Barre ${ord.numeroBarre > 0 ? `(+10% = ${Math.floor(ord.numeroBarre * 1.1)})` : ""}`,
                                  key: "numeroBarre",
                                },
                                { label: "N° Luci", key: "numeroLuci" },
                                { label: "Peso MTL (g/m)", key: "pesoMTL" },
                                {
                                  label: "Scarto Testa (mm)",
                                  key: "scartoTesta",
                                },
                                {
                                  label: "Scarto Coda (mm)",
                                  key: "scartoCoda",
                                },
                              ].map(({ label, key, optional }) => (
                                <IndustrialInput
                                  key={key}
                                  label={label}
                                  name={key}
                                  value={(ord as any)[key]}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOrdini((prev) =>
                                      prev.map((o) =>
                                        o.id === ord.id
                                          ? {
                                              ...o,
                                              [key]: parseFloat(val) || 0,
                                            }
                                          : o,
                                      ),
                                    );
                                  }}
                                  optional={optional}
                                  compact
                                />
                              ))}
                              <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                  Log
                                </label>
                                <select
                                  value={ord.billettoneId}
                                  onChange={(e) =>
                                    setOrdini((prev) =>
                                      prev.map((o) =>
                                        o.id === ord.id
                                          ? {
                                              ...o,
                                              billettoneId: e.target.value,
                                            }
                                          : o,
                                      ),
                                    )
                                  }
                                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm font-black text-white mono outline-none focus:border-violet-500/50"
                                >
                                  {BILLET_TYPES.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-end sm:col-span-3 lg:col-span-1">
                                <button
                                  onClick={() => handleSaveToDB(ord)}
                                  disabled={!ord.articolo}
                                  className="w-full rounded-lg px-3 py-2 text-sm font-black uppercase transition-all border bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <Box className="w-4 h-4" /> Salva in DB
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50 text-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-0.5">
                                  Tirata
                                </span>
                                <span className="text-base font-black text-white mono">
                                  {(r.tirata / 1000).toFixed(1)}m
                                </span>
                              </div>
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50 text-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-0.5">
                                  Barre/Bill
                                </span>
                                <span className="text-base font-black text-emerald-400 mono">
                                  {r.bpb}
                                  {r.giuntaExtra > 0
                                    ? ` +${r.giuntaExtra}`
                                    : ""}
                                </span>
                              </div>
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50 text-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-0.5">
                                  Billette
                                </span>
                                <span className="text-base font-black text-white mono">
                                  {r.billette}
                                </span>
                              </div>
                              <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/30 text-center">
                                <span className="text-[9px] font-black text-violet-400 uppercase block mb-0.5">
                                  Logs
                                </span>
                                <span className="text-base font-black text-violet-400 mono">
                                  {r.logsDecimali.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {r.recommendation &&
                              (r.recommendation.logId !== r.logId ||
                                r.recommendation.cut !== r.cut) && (
                                <div className="bg-emerald-500/[0.06] border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                                  <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
                                      Raccomandazione
                                    </span>
                                    <p className="text-[10px] text-emerald-300/80">
                                      Usa <b>{r.recommendation.logName}</b> con
                                      taglio <b>{r.recommendation.cut}mm</b> (
                                      {r.recommendation.pieces} bpb) →{" "}
                                      <b>
                                        {Math.ceil(r.recommendation.logsNeeded)}{" "}
                                        logs
                                      </b>{" "}
                                      (scarto {r.recommendation.scarto}mm)
                                    </p>
                                    <button
                                      onClick={() =>
                                        setOrdini((prev) =>
                                          prev.map((o) =>
                                            o.id === ord.id
                                              ? {
                                                  ...o,
                                                  billettoneId:
                                                    r.recommendation!.logId,
                                                  taglioManuale:
                                                    r.recommendation!.cut,
                                                }
                                              : o,
                                          ),
                                        )
                                      }
                                      className="mt-2 text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                    >
                                      Applica Raccomandazione
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {ordini.length > 0 && (
                <div className="bg-violet-500/[0.06] border border-violet-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 text-violet-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-400">
                      Riepilogo Ordini
                    </h3>
                  </div>
                  {(() => {
                    const totalMmForno = logNelForno.reduce(
                      (s, v) => s + (v?.length || 0),
                      0,
                    );
                    const totalMmCaricatoreAll = logCaricatore.reduce(
                      (s, v) => s + (v?.length || 0),
                      0,
                    );
                    const totalMmDisponibili =
                      totalMmForno + totalMmCaricatoreAll;
                    // Use average log length across orders for conversion
                    const avgLogLen =
                      ordiniResults.length > 0
                        ? ordiniResults.reduce(
                            (s, o) => s + o.results.logLen,
                            0,
                          ) / ordiniResults.length
                        : 8000;
                    const totalMmNeeded = totalLogsOrdini * avgLogLen;
                    const mmMancanti = Math.max(
                      0,
                      totalMmNeeded - totalMmDisponibili,
                    );
                    const logsMancInteri = Math.floor(mmMancanti / avgLogLen);
                    const mmFrazione = mmMancanti - logsMancInteri * avgLogLen;
                    const tuttiCaricati =
                      totalMmDisponibili >= totalMmNeeded && ordini.length > 0;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Logs Totali
                          </span>
                          <span className="text-lg font-black text-violet-400 mono">
                            {totalLogsOrdini.toFixed(2)}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Forno + Caricatore
                          </span>
                          <span className="text-lg font-black text-orange-400 mono">
                            {(totalMmDisponibili / 1000).toFixed(1)}m
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Logs Mancanti
                          </span>
                          <span
                            className={`text-lg font-black mono ${tuttiCaricati ? "text-emerald-400" : "text-amber-400"}`}
                          >
                            {tuttiCaricati
                              ? "0"
                              : mmFrazione > 0
                                ? `${logsMancInteri} LOG + ${mmFrazione.toFixed(0)}mm`
                                : `${logsMancInteri} LOG`}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
                          <span className="text-[7px] font-black text-slate-500 uppercase block mb-0.5">
                            Billette Totali
                          </span>
                          <span className="text-lg font-black text-white mono">
                            {(() => {
                              const bTot = ordiniResults.reduce(
                                (s, o) => s + o.results.billette,
                                0,
                              );
                              const cTot = ordiniResults.reduce((s, o) => {
                                const r = o.results;
                                const remainderLen =
                                  r.logLen > 0 && r.cut > 0
                                    ? r.logLen -
                                      Math.floor(r.logLen / r.cut) * r.cut
                                    : 0;
                                const uCorta = Math.max(
                                  0,
                                  remainderLen - (o.fondello || 0),
                                );
                                const tirCorta = uCorta * r.ratio;
                                const bpbCortaVal =
                                  tirCorta >
                                  o.scartoTesta +
                                    o.scartoCoda +
                                    o.lunghezzaBarra
                                    ? Math.floor(
                                        (tirCorta -
                                          o.scartoTesta -
                                          o.scartoCoda) /
                                          o.lunghezzaBarra,
                                      ) * o.numeroLuci
                                    : 0;
                                // Corta solo se produce MENO barre della billetta standard
                                const isCorta =
                                  !inputs.abilitaGiunta &&
                                  remainderLen >= MIN_BILLET_LEN &&
                                  bpbCortaVal > 0 &&
                                  bpbCortaVal < r.bpb;
                                return (
                                  s + (isCorta ? Math.floor(r.logsDecimali) : 0)
                                );
                              }, 0);
                              return cTot > 0
                                ? `${bTot} / ${cTot} Corte`
                                : bTot.toString();
                            })()}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const totalMmForno = logNelForno.reduce(
                      (s, v) => s + (v?.length || 0),
                      0,
                    );
                    const totalMmCaricatoreAll = logCaricatore.reduce(
                      (s, v) => s + (v?.length || 0),
                      0,
                    );
                    const avgLogLen =
                      ordiniResults.length > 0
                        ? ordiniResults.reduce(
                            (s, o) => s + o.results.logLen,
                            0,
                          ) / ordiniResults.length
                        : 8000;
                    const totalMmNeeded = totalLogsOrdini * avgLogLen;
                    if (
                      totalMmForno + totalMmCaricatoreAll >= totalMmNeeded &&
                      ordini.length > 0
                    ) {
                      return (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[9px] font-bold text-emerald-300 uppercase">
                            Tutti i log per gli ordini sono coperti!
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          ) : currentView === "archivio" ? (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 p-6 lg:p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 text-blue-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Archivio Database
                  </h2>
                  {dbArticoli.length > 0 && (
                    <span className="text-[9px] font-black text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                      {dbArticoli.length} articoli
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cerca art. (es. A-1234)"
                      value={dbSearchQuery}
                      onChange={(e) => setDbSearchQuery(e.target.value)}
                      className="bg-slate-900/50 border border-slate-700/50 rounded-lg pl-8 pr-3 py-2 text-[10px] font-black text-white mono outline-none focus:border-blue-500/50 placeholder:text-slate-600 transition-colors w-48"
                    />
                    <ScanLine className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    onClick={() => setCurrentView("calcoli")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Torna ai Calcoli
                  </button>
                </div>
              </div>

              {dbArticoli.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                  <Box className="w-12 h-12 text-blue-500/50 mb-4" />
                  <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    Database Vuoto
                  </p>
                  <p className="text-[9px] text-slate-600 mt-1">
                    Salva un ordine dalla sezione "Gestione Ordini" per
                    aggiungerlo qui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dbArticoli
                    .filter((art) =>
                      art.articolo
                        .toLowerCase()
                        .includes(dbSearchQuery.toLowerCase()),
                    )
                    .map((art) => (
                      <div
                        key={art.id}
                        className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-black text-white mono flex items-center gap-2">
                              {art.articolo}
                              {art.numeroBarra && (
                                <span className="text-slate-500">
                                  /{art.numeroBarra}
                                </span>
                              )}
                              {art.numeroBarra && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDieModal({
                                      articolo: art.articolo,
                                      numeroBarra: art.numeroBarra!,
                                    });
                                  }}
                                  className="flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 transition-colors"
                                  title="Storico Matrice"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </span>
                            <span className="text-[9px] font-bold text-amber-400/70 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                              {art.lega}
                            </span>
                            {art.abilitaGiunta && (
                              <span className="text-[8px] font-bold text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                                COMPENSATO
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                            <span className="text-[9px] font-bold text-slate-500">
                              Tirata Rif:{" "}
                              <b className="text-emerald-400/80">
                                {art.tirataRiferimento}mm
                              </b>
                            </span>
                            <span className="text-[9px] font-bold text-slate-500">
                              Taglio Rif:{" "}
                              <b className="text-amber-400/80">
                                {art.taglioRiferimento}mm
                              </b>
                            </span>
                            <span className="text-[9px] font-bold text-slate-500">
                              L. Barra: <b>{art.lunghezzaBarra}mm</b>
                            </span>
                            <span className="text-[9px] font-bold text-slate-500">
                              Peso: <b>{art.pesoMTL} kg/m</b>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="text-[8px] font-bold text-slate-600 uppercase">
                              Fondello: {art.fondello}mm
                            </span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase">
                              Scarti: {art.scartoTesta} / {art.scartoCoda}
                            </span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase">
                              Log:{" "}
                              {BILLET_TYPES.find(
                                (b) => b.id === art.billettoneId,
                              )?.name || art.billettoneId}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newOrd: Ordine = {
                                id: Date.now().toString(),
                                articolo: art.articolo,
                                lega: art.lega,
                                numeroBarra: art.numeroBarra,
                                tirataRiferimento: art.tirataRiferimento,
                                taglioRiferimento: art.taglioRiferimento,
                                fondello: art.fondello,
                                lunghezzaBarra: art.lunghezzaBarra,
                                numeroBarre: 0,
                                numeroLuci: art.numeroLuci,
                                pesoMTL: art.pesoMTL,
                                scartoTesta: art.scartoTesta,
                                scartoCoda: art.scartoCoda,
                                billettoneId: art.billettoneId,
                                taglioManuale: 0,
                                abilitaGiunta: art.abilitaGiunta,
                              };
                              setOrdini((prev) => [newOrd, ...prev]);
                              setCurrentView("ordini");
                            }}
                            className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
                          >
                            Crea Ordine +
                          </button>
                          <button
                            onClick={() => handleDeleteFromDB(art.articolo)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : currentView === "report" ? (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 p-6 lg:p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-rose-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Report Produzione PDF
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView("calcoli")}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Torna ai Calcoli
                </button>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Filtri Report
                </h3>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setReportFilterMode("day")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${reportFilterMode === "day" ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    Per Giorno
                  </button>
                  <button
                    onClick={() => setReportFilterMode("month")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${reportFilterMode === "month" ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    Per Mese
                  </button>
                </div>

                {reportFilterMode === "day" ? (
                  <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                    <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block">
                      Data Specifica
                    </label>
                    <input
                      type="date"
                      value={reportFilterDate}
                      onChange={(e) => setReportFilterDate(e.target.value)}
                      className="w-full bg-transparent text-sm font-black text-white mono outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                      <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block">
                        Mese
                      </label>
                      <select
                        value={reportFilterMonth}
                        onChange={(e) =>
                          setReportFilterMonth(parseInt(e.target.value))
                        }
                        className="w-full bg-transparent text-sm font-black text-white mono outline-none"
                      >
                        {[
                          "Gennaio",
                          "Febbraio",
                          "Marzo",
                          "Aprile",
                          "Maggio",
                          "Giugno",
                          "Luglio",
                          "Agosto",
                          "Settembre",
                          "Ottobre",
                          "Novembre",
                          "Dicembre",
                        ].map((m, i) => (
                          <option
                            key={i}
                            value={i + 1}
                            className="bg-slate-900"
                          >
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                      <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block">
                        Anno
                      </label>
                      <input
                        type="number"
                        value={reportFilterYear}
                        onChange={(e) =>
                          setReportFilterYear(parseInt(e.target.value) || 2026)
                        }
                        className="w-full bg-transparent text-sm font-black text-white mono outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                  <label className="text-[8px] font-black uppercase text-slate-500 mb-2 block">
                    Turno
                  </label>
                  <div className="flex gap-2">
                    {[
                      { val: 0, label: "Tutti", time: "" },
                      { val: 1, label: "1°", time: "06-14" },
                      { val: 2, label: "2°", time: "14-22" },
                      { val: 3, label: "3°", time: "22-06" },
                    ].map((t) => (
                      <button
                        key={t.val}
                        onClick={() =>
                          setReportFilterTurno(t.val as 0 | 1 | 2 | 3)
                        }
                        className={`flex-1 py-2 px-1 rounded-md text-[10px] font-bold transition-colors ${reportFilterTurno === t.val ? "bg-rose-500 text-white shadow-md" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
                      >
                        <span className="block font-black uppercase">
                          {t.label}
                        </span>
                        {t.time && (
                          <span className="text-[8px] opacity-70 font-normal">
                            {t.time}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const filtered = dieHistory.filter((h) => {
                  const d = new Date(h.dataCreazione);
                  if (reportFilterMode === "day" && reportFilterDate) {
                    const [y, m, dd] = reportFilterDate.split("-").map(Number);
                    if (
                      d.getFullYear() !== y ||
                      d.getMonth() + 1 !== m ||
                      d.getDate() !== dd
                    )
                      return false;
                  } else if (reportFilterMode === "month") {
                    if (
                      d.getFullYear() !== reportFilterYear ||
                      d.getMonth() + 1 !== reportFilterMonth
                    )
                      return false;
                  }
                  if (reportFilterTurno !== 0 && h.turno !== reportFilterTurno)
                    return false;
                  return true;
                });
                const totalB = filtered.reduce(
                  (s, e) => s + e.billetteEstruse,
                  0,
                );
                const uniqueArt = [...new Set(filtered.map((e) => e.articolo))];
                const avgS =
                  filtered.filter((e) => e.scartoReale != null).length > 0
                    ? (
                        filtered
                          .filter((e) => e.scartoReale != null)
                          .reduce((s, e) => s + (e.scartoReale || 0), 0) /
                        filtered.filter((e) => e.scartoReale != null).length
                      ).toFixed(0)
                    : "—";

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                          Billette Totali
                        </span>
                        <span className="text-2xl font-black text-emerald-400 mono">
                          {totalB}
                        </span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                          Sessioni
                        </span>
                        <span className="text-2xl font-black text-indigo-400 mono">
                          {filtered.length}
                        </span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                          Scarto Medio
                        </span>
                        <span className="text-2xl font-black text-amber-400 mono">
                          {avgS}
                          <span className="text-sm text-slate-500 ml-1">
                            mm
                          </span>
                        </span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                          Articoli
                        </span>
                        <span className="text-2xl font-black text-cyan-400 mono">
                          {uniqueArt.length}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        setIsGeneratingPdf(true);
                        try {
                          let filterLabel = "";
                          if (reportFilterMode === "day" && reportFilterDate) {
                            const [y, m, d] = reportFilterDate.split("-");
                            filterLabel = `${d}/${m}/${y}`;
                          } else {
                            const months = [
                              "Gennaio",
                              "Febbraio",
                              "Marzo",
                              "Aprile",
                              "Maggio",
                              "Giugno",
                              "Luglio",
                              "Agosto",
                              "Settembre",
                              "Ottobre",
                              "Novembre",
                              "Dicembre",
                            ];
                            filterLabel = `${months[reportFilterMonth - 1]} ${reportFilterYear}`;
                          }
                          if (reportFilterTurno > 0)
                            filterLabel += ` — ${reportFilterTurno}° Turno`;

                          const htmlString = generateReportHTML({
                            entries: filtered,
                            completedOrders,
                            filterLabel,
                            generatedAt: new Date().toLocaleString("it-IT"),
                          });

                          const instructions = JSON.stringify({
                            inputs: [{ type: "html", htmlString }],
                          });

                          const formData = new FormData();
                          formData.append(
                            "Instructions",
                            new Blob([instructions], {
                              type: "application/json",
                            }),
                            "instructions.json",
                          );

                          const apiKey = import.meta.env.VITE_DPDF_API_KEY;

                          // Use proxy to avoid CORS issues, since dpdf.io blocks localhost origins
                          // In production, vercel.json rewrites this route to api.dpdf.io
                          const res = await fetch("/api/dpdf/v1.0/pdf", {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${apiKey}`,
                            },
                            body: formData,
                          });

                          if (!res.ok) {
                            console.error("dpdf.io error status:", res.status);
                            alert(
                              `Errore dal server PDF: ${res.status} ${res.statusText}`,
                            );
                            return;
                          }

                          const blob = await res.blob();
                          console.log(
                            "PDF Blob received:",
                            blob.size,
                            blob.type,
                          );

                          if (blob.size === 0) {
                            throw new Error(
                              "Received empty PDF file from the server.",
                            );
                          }

                          // Force the correct MIME type just in case dpdf or proxy overrides it
                          const pdfBlob = new Blob([blob], {
                            type: "application/pdf",
                          });
                          const url = URL.createObjectURL(pdfBlob);
                          const a = document.createElement("a");
                          a.style.display = "none";
                          a.href = url;
                          a.download = `Report_EXTRUCALC_${filterLabel.replace(/ /g, "_").replace(/—/g, "-")}.pdf`;
                          document.body.appendChild(a);
                          a.click();

                          // Small delay to ensure browser registers the click before cleanup
                          await new Promise((r) => setTimeout(r, 100));
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error("Errore generazione PDF:", err);
                          alert("Errore nella generazione del PDF.");
                        } finally {
                          setIsGeneratingPdf(false);
                        }
                      }}
                      disabled={filtered.length === 0 || isGeneratingPdf}
                      className="w-full flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 text-white disabled:text-slate-500 font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <span className="animate-spin">⏳</span> Generazione
                          PDF in corso...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" /> Scarica Report PDF (
                          {filtered.length} sessioni)
                        </>
                      )}
                    </button>

                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden mt-6">
                      <div className="p-3 border-b border-slate-800/50 flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-500" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                          Dettaglio Sessioni
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {filtered.map((session, i) => {
                          const sessionDate = new Date(session.dataCreazione);
                          const timeString = sessionDate.toLocaleTimeString(
                            "it-IT",
                            { hour: "2-digit", minute: "2-digit" },
                          );
                          const dateString = sessionDate.toLocaleDateString(
                            "it-IT",
                            { day: "2-digit", month: "2-digit" },
                          );
                          return (
                            <div
                              key={session.id}
                              className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? "bg-slate-950/30" : ""}`}
                            >
                              <div className="flex items-center gap-3">
                                <Activity className="w-3.5 h-3.5 text-cyan-500/60" />
                                <div>
                                  <span className="text-xs font-black text-white mono">
                                    {session.articolo}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] text-slate-400 font-bold">
                                      {session.billetteEstruse} bill.
                                    </span>
                                    <span className="text-[9px] text-slate-500">
                                      · Turno {session.turno || "?"}
                                    </span>
                                    {session.operatore && (
                                      <span className="text-[9px] text-slate-500">
                                        · {session.operatore}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-bold">
                                  {timeString}
                                </span>
                                <span className="text-[8px] text-slate-600 block">
                                  {dateString}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {filtered.length === 0 && (
                          <div className="p-4 text-center text-slate-600 text-[10px] font-black uppercase tracking-wider">
                            Nessuna sessione trovata
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}

              {completedOrders.length > 0 && (
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden mt-6">
                  <div className="p-3 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        Storico Ordini Completati ({completedOrders.length})
                      </span>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {completedOrders.map((co, i) => (
                      <div
                        key={co.id}
                        className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? "bg-slate-950/30" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
                          <div>
                            <span className="text-xs font-black text-white mono">
                              {co.articolo}
                              {co.numeroBarra ? ` / ${co.numeroBarra}` : ""}
                            </span>
                            {co.lega && (
                              <span className="text-[10px] text-amber-400/70 ml-2">
                                {co.lega}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-500">
                                {co.billette} bill.
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {co.logsDecimali.toFixed(1)} logs ({co.logName})
                              </span>
                              <span className="text-[9px] text-slate-500">
                                cut {co.cut}mm
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-600 shrink-0">
                          {co.completedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
        <AnimatePresence>
          {activeDieModal && (
            <DieHistoryModal
              articolo={activeDieModal.articolo}
              numeroBarra={activeDieModal.numeroBarra}
              history={dieHistory.filter(
                (h) =>
                  h.articolo === activeDieModal.articolo &&
                  h.numeroBarra === activeDieModal.numeroBarra,
              )}
              onClose={() => setActiveDieModal(null)}
              onSave={async (billette, scarto, turno, note, operatore) => {
                await handleSaveDieHistory(
                  activeDieModal.articolo,
                  activeDieModal.numeroBarra,
                  billette,
                  scarto,
                  turno,
                  note,
                  operatore,
                );
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-[#0f172a] border-t border-slate-800 p-4 px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            © {new Date().getFullYear()} EXTRUCALC
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <span>Ø206 EXTRUSION ENGINE</span>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-emerald-400 transition-colors">
            Contatto Instagram
          </span>
        </a>
      </footer>
    </div>
  );
};

export default App;
