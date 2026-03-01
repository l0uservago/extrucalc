
import React, { useState, useMemo, useEffect } from 'react';
import { Factory, AlertTriangle, Monitor, Layers, Ruler, List, Box, RotateCcw, Zap, ThumbsUp, TrendingDown, Scissors, Link2, BarChart3, Instagram } from 'lucide-react';
import { BILLET_TYPES, INITIAL_INPUTS } from './constants';
import { CalculationInputs, BilletType } from './types';

// Costante industriale per Ø206: lunghezza minima meccanica per caricare una billetta in pressa
const MIN_BILLET_LEN = 400; 

// Industrial UI sub-components
const IndustrialInput: React.FC<{
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  highlight?: boolean;
  customColor?: string;
  helper?: string;
}> = ({ label, name, value, onChange, highlight, customColor, helper }) => {
  const [inputValue, setInputValue] = useState<string>(value === 0 ? '' : value.toString());

  useEffect(() => {
    setInputValue(value === 0 ? '' : value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '') {
      onChange({ target: { name, value: '0' } } as any);
    } else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        onChange({ target: { name, value: val } } as any);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input
        type="number"
        step="any"
        name={name}
        value={inputValue}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        placeholder="0"
        className={`w-full bg-slate-950 text-white border-2 p-2.5 text-sm font-black rounded-lg outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 ${
          customColor || (highlight ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'border-slate-800 focus:border-emerald-500/50')
        }`}
      />
      {helper && <span className="text-[8px] font-bold text-emerald-500/60 uppercase ml-1">{helper}</span>}
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
  <div className={`p-5 rounded-xl border transition-all duration-300 ${
    highlight 
      ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-lg' 
      : 'bg-slate-800/20 border-slate-800 shadow-md'
  }`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700/30 text-slate-400'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{unit}</span>
    </div>
    <div className="space-y-0.5">
      <div className={`text-2xl font-black italic tracking-tighter ${color || (highlight ? 'text-emerald-400' : 'text-white')} mono`}>
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
    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
    <div className={`text-lg font-black ${color || 'text-white'} mono`}>{value}</div>
    <div className="text-[8px] font-bold text-slate-600 uppercase italic">{sub}</div>
  </div>
);

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({ ...INITIAL_INPUTS });
  const [selectedCut, setSelectedCut] = useState<number>(0);

  const selectedLog = useMemo(() => BILLET_TYPES.find(b => b.id === inputs.billettoneId), [inputs.billettoneId]);

  useEffect(() => {
    if (!inputs.modalitaManuale && selectedLog) {
      setSelectedCut(selectedLog.options[0]?.length || 0);
    }
  }, [inputs.billettoneId, inputs.modalitaManuale, selectedLog]);

  const results = useMemo(() => {
    const { 
      tirataRiferimento, fondello, 
      lunghezzaBarra, numeroBarre, numeroLuci, pesoMTL,
      scartoTesta, scartoCoda, modalitaManuale, taglioManuale, abilitaGiunta, billetteEstruse 
    } = inputs;
    
    const cut = modalitaManuale ? taglioManuale : (selectedCut || (selectedLog?.options[0]?.length || 0));
    const utileRiferimento = Math.max(1, cut - fondello);
    const ratioAllungamento = tirataRiferimento / utileRiferimento;
    const utileAttuale = Math.max(1, cut - fondello);
    const tirataProiettata = utileAttuale * ratioAllungamento;
    
    const barreConSfrido = Math.floor(numeroBarre * 1.1);
    
    const utileNettoProfilo = Math.max(0, tirataProiettata - scartoTesta - scartoCoda);
    const bpbEffettivo = (utileNettoProfilo > 0 && lunghezzaBarra > 0) 
      ? Math.floor(utileNettoProfilo / lunghezzaBarra) * numeroLuci 
      : 0;
    
    // --- GESTIONE LOG, BILLETTA CORTA E GIUNTA ---
    const logLen = selectedLog?.length || 0;
    let pezziInteriPerLog = 0;
    let scartoResiduoLog = 0;
    let billettePerLogEffettive = 0;

    if (abilitaGiunta) {
      billettePerLogEffettive = logLen / (cut || 1);
      pezziInteriPerLog = Math.floor(billettePerLogEffettive);
      scartoResiduoLog = logLen - (pezziInteriPerLog * cut);
    } else {
      if (!modalitaManuale) {
        const option = selectedLog?.options.find(o => o.length === selectedCut);
        if (option) {
          pezziInteriPerLog = option.pieces;
          scartoResiduoLog = 0;
        } else {
          pezziInteriPerLog = (cut > 0 && logLen >= cut) ? Math.floor(logLen / cut) : 0;
          scartoResiduoLog = logLen > 0 && pezziInteriPerLog > 0 ? logLen - (pezziInteriPerLog * cut) : 0;
        }
      } else {
        pezziInteriPerLog = (cut > 0 && logLen >= cut) ? Math.floor(logLen / cut) : 0;
        scartoResiduoLog = logLen > 0 && pezziInteriPerLog > 0 ? logLen - (pezziInteriPerLog * cut) : 0;
      }
      billettePerLogEffettive = pezziInteriPerLog;
    }

    const billetteTotaliNecessarie = bpbEffettivo > 0 ? Math.ceil(barreConSfrido / bpbEffettivo) : 0;
    const billetteRimanenti = Math.max(0, billetteTotaliNecessarie - billetteEstruse);
    const logsDecimali = billettePerLogEffettive > 0 ? billetteRimanenti / billettePerLogEffettive : 0;
    const logsInteri = Math.floor(logsDecimali);
    const metriRimanenti = (logsDecimali - logsInteri) * logLen / 1000;
    
    // Calcolo billetta corta "classica" (non giuntata)
    const utileCorta = Math.max(0, scartoResiduoLog - fondello);
    const tirataCorta = utileCorta * ratioAllungamento;
    const bpbCorta = (tirataCorta > (scartoTesta + scartoCoda + lunghezzaBarra)) 
      ? Math.floor((tirataCorta - scartoTesta - scartoCoda) / lunghezzaBarra) * numeroLuci 
      : 0;
    const isCortaRecuperabile = !abilitaGiunta && scartoResiduoLog >= MIN_BILLET_LEN && bpbCorta > 0;
    const isCortaScartata = !abilitaGiunta && scartoResiduoLog >= MIN_BILLET_LEN && bpbCorta === 0;
    const numeroBilletteCorte = isCortaRecuperabile ? logsInteri : 0;

    // --- BILLET ADVISOR ---
    const billetAdvisor = BILLET_TYPES.map(log => {
      const remainder = log.length % (cut || 1);
      
      const utileCortaLog = Math.max(0, remainder - fondello);
      const tirataCortaLog = utileCortaLog * ratioAllungamento;
      const bpbCortaLog = (tirataCortaLog > (scartoTesta + scartoCoda + lunghezzaBarra)) 
        ? Math.floor((tirataCortaLog - scartoTesta - scartoCoda) / lunghezzaBarra) * numeroLuci 
        : 0;
        
      let waste = 0;
      let effectiveWaste = 0;
      
      if (abilitaGiunta) {
        waste = 0;
        effectiveWaste = 0;
      } else {
        if (remainder === 0) {
          waste = 0;
          effectiveWaste = 0;
        } else if (remainder >= MIN_BILLET_LEN && bpbCortaLog > 0) {
          waste = 0; // Recoverable
          effectiveWaste = 0.1; // Small penalty for managing short billet
        } else {
          waste = remainder; // Unrecoverable scrap
          effectiveWaste = remainder;
        }
      }
      return { id: log.id, name: log.name, waste, remainder, effectiveWaste, logLength: log.length };
    }).sort((a, b) => {
      if (a.effectiveWaste !== b.effectiveWaste) {
        return a.effectiveWaste - b.effectiveWaste;
      }
      if (a.effectiveWaste === 0.1) {
        return b.remainder - a.remainder;
      }
      return b.logLength - a.logLength;
    })[0];

    const pesoBarra = (lunghezzaBarra / 1000) * (pesoMTL / 1000);
    const pesoOrdine = numeroBarre * pesoBarra;
    const pesoProduzione = barreConSfrido * pesoBarra;

    const errors = [];
    if (cut <= 0) errors.push("Taglio nullo");
    if (bpbEffettivo <= 0) errors.push("Tirata proiettata insufficiente");

    return {
      ratioAllungamento,
      tirataProiettata,
      utileNettoProfilo,
      bpbEffettivo,
      billetteTotaliNecessarie,
      billetteRimanenti,
      logsInteri,
      logsDecimali,
      metriRimanenti,
      pezziInteriPerLog,
      scartoResiduoLog,
      isCortaRecuperabile,
      isCortaScartata,
      numeroBilletteCorte,
      bpbCorta,
      cutUtilizzato: cut,
      barreConSfrido,
      pesoOrdine,
      pesoProduzione,
      billetAdvisor,
      isValid: errors.length === 0,
      errors
    };
  }, [selectedCut, inputs, selectedLog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = value === '' ? 0 : parseFloat(value);
    setInputs(prev => ({ ...prev, [name]: isNaN(val) ? 0 : val }));
  };

  const toggleManualMode = () => setInputs(prev => ({ ...prev, modalitaManuale: !prev.modalitaManuale }));
  const toggleGiunta = () => setInputs(prev => ({ ...prev, abilitaGiunta: !prev.abilitaGiunta }));

  const handleReset = () => {
    setInputs({ ...INITIAL_INPUTS });
    const initialLog = BILLET_TYPES.find(b => b.id === INITIAL_INPUTS.billettoneId);
    if (initialLog) {
      setSelectedCut(initialLog.options[0]?.length || 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30">
      <header className="bg-[#0f172a] border-b border-emerald-500/30 p-4 flex justify-between items-center shadow-xl z-10">
        <button onClick={handleReset} className="flex items-center gap-4 group transition-all">
          <div className="bg-emerald-500 p-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:bg-emerald-400">
            <Monitor className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-left">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none group-hover:text-emerald-400">EXTRUCALC Ø206</h1>
              <span className="text-[7px] font-black text-emerald-500/40 uppercase tracking-[0.2em]">Developed by Robert Musin</span>
            </div>
            <p className="text-[9px] font-bold text-emerald-500 tracking-[0.3em] uppercase opacity-70 mt-1 flex items-center gap-1">
              <RotateCcw className="w-2 h-2" /> Reset Calcoli
            </p>
          </div>
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-[340px] bg-[#0f172a] border-r border-slate-800 p-5 overflow-y-auto space-y-6 shadow-inner custom-scrollbar">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-3 h-3 text-emerald-500" />
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Calibrazione Ratio</h2>
            </div>
            <IndustrialInput label="Tirata Ottenuta (mm)" name="tirataRiferimento" value={inputs.tirataRiferimento} onChange={handleInputChange} highlight />
            <IndustrialInput label="Fondello (mm)" name="fondello" value={inputs.fondello} onChange={handleInputChange} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-3 h-3 text-blue-500" />
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Dati Commessa</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IndustrialInput label="L. Barra (mm)" name="lunghezzaBarra" value={inputs.lunghezzaBarra} onChange={handleInputChange} />
              <IndustrialInput label="Peso MTL (g/m)" name="pesoMTL" value={inputs.pesoMTL} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IndustrialInput 
                label="Barre Ordine" 
                name="numeroBarre" 
                value={inputs.numeroBarre} 
                onChange={handleInputChange} 
                helper={`+10% Sfrido: ${Math.floor(inputs.numeroBarre * 1.1)} PZ`}
              />
              <IndustrialInput label="Num. Luci" name="numeroLuci" value={inputs.numeroLuci} onChange={handleInputChange} />
            </div>
            <div className="mt-1">
              <IndustrialInput label="Billette Già Estruse" name="billetteEstruse" value={inputs.billetteEstruse} onChange={handleInputChange} customColor="border-blue-500/50 text-blue-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Ruler className="w-3 h-3 text-red-500" />
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Scarti Processo</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IndustrialInput label="Sfrido Testa" name="scartoTesta" value={inputs.scartoTesta} onChange={handleInputChange} />
              <IndustrialInput label="Sfrido Coda" name="scartoCoda" value={inputs.scartoCoda} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Factory className="w-3 h-3 text-amber-500" />
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Configurazione Forno</h2>
            </div>
            
            <div className="space-y-3">
              <select 
                name="billettoneId"
                value={inputs.billettoneId}
                onChange={(e) => setInputs(p => ({ ...p, billettoneId: e.target.value }))}
                className="w-full bg-slate-950 text-white border-2 border-slate-800 p-2.5 text-sm font-black rounded-lg focus:border-emerald-500 outline-none cursor-pointer"
              >
                {BILLET_TYPES.map(b => <option key={b.id} value={b.id}>{b.name} ({b.length}mm)</option>)}
              </select>

              <div onClick={toggleGiunta} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors group">
                  <div className="flex items-center gap-2">
                    <Link2 className={`w-3 h-3 ${inputs.abilitaGiunta ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className={`text-[10px] font-black uppercase ${inputs.abilitaGiunta ? 'text-blue-400' : 'text-slate-400'}`}>Abilita Compensato</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${inputs.abilitaGiunta ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${inputs.abilitaGiunta ? 'left-6' : 'left-1'}`}></div>
                  </div>
              </div>

              <div onClick={toggleManualMode} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors group">
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">Modalità Manuale</span>
                  <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${inputs.modalitaManuale ? 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.4)]' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${inputs.modalitaManuale ? 'left-6' : 'left-1'}`}></div>
                  </div>
              </div>

              {inputs.modalitaManuale && (
                <div className="animate-in slide-in-from-top-2">
                  <IndustrialInput label="Lunghezza della Billetta (mm)" name="taglioManuale" value={inputs.taglioManuale} onChange={handleInputChange} customColor="border-amber-500/50 text-amber-400" />
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#020617] custom-scrollbar">
          {!results.isValid ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
              <h2 className="text-lg font-black uppercase tracking-widest">Dati Insufficienti</h2>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResultCard 
                  label={inputs.billetteEstruse > 0 ? "Billette Rimanenti" : "Billette Totali"} 
                  value={inputs.billetteEstruse > 0 
                    ? results.billetteRimanenti.toString() 
                    : (results.numeroBilletteCorte > 0 ? `${results.billetteTotaliNecessarie} + ${results.numeroBilletteCorte}` : results.billetteTotaliNecessarie.toString())} 
                  unit="PZ" 
                  sub={inputs.billetteEstruse > 0 
                    ? `Su un totale di ${results.billetteTotaliNecessarie} PZ` 
                    : (results.numeroBilletteCorte > 0 ? `Totale: ${results.billetteTotaliNecessarie + results.numeroBilletteCorte} billette (incl. corte)` : `Produzione barre: ${results.bpbEffettivo} pz/billetta`)} 
                  icon={<Layers className="w-5 h-5" />} 
                  highlight 
                />
                <ResultCard 
                  label="Advisor Log" 
                  value={results.billetAdvisor.name} 
                  unit="LOG" 
                  sub={results.billetAdvisor.waste === 0 && results.billetAdvisor.remainder > 0 && !inputs.abilitaGiunta ? `Scarto: 0 mm (Avanzo: ${results.billetAdvisor.remainder.toFixed(0)}mm)` : `Scarto log: ${results.billetAdvisor.waste.toFixed(0)} mm`} 
                  icon={<ThumbsUp className="w-5 h-5" />} 
                  highlight={results.billetAdvisor.id === inputs.billettoneId} 
                  color={results.billetAdvisor.id === inputs.billettoneId ? "text-emerald-400" : "text-amber-400"} 
                />
                <ResultCard 
                  label={inputs.billetteEstruse > 0 ? "Logs Rimanenti" : "Carico Log"} 
                  value={results.metriRimanenti > 0.01 ? `${results.logsInteri} LOG + ${parseFloat(results.metriRimanenti.toFixed(2))}m` : `${results.logsInteri} LOG`} 
                  unit="LOGS" 
                  sub={inputs.abilitaGiunta ? "Efficienza compensato attivo" : `Totale: ${results.logsDecimali.toFixed(2)} logs`} 
                  icon={<Factory className="w-5 h-5" />} 
                />
                <ResultCard label="Peso Totale" value={results.pesoProduzione.toFixed(1)} unit="kg" sub={`Include sfrido 10%: ${results.barreConSfrido} pz`} icon={<BarChart3 className="w-5 h-5 text-amber-500" />} />
              </div>

              {!inputs.modalitaManuale && !inputs.abilitaGiunta && (
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <List className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tagli Ottimizzati</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {selectedLog?.options.map((opt) => {
                      const isSelected = selectedCut === opt.length;
                      return (
                        <button key={opt.length} onClick={() => setSelectedCut(opt.length)} className={`group p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
                          <span className={`text-xl font-black mono ${isSelected ? 'text-white' : 'text-slate-500'}`}>{opt.length}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{opt.pieces} PZ</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative">
                 <div className="flex justify-between items-end relative z-10">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Box className="w-4 h-4 text-emerald-500" /> Geometria Log {selectedLog?.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic">Taglio: {results.cutUtilizzato}mm | {inputs.abilitaGiunta ? 'Modalità Compensato' : 'Modalità Standard'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">{inputs.abilitaGiunta ? 'Avanzo x Compensato' : 'Stato Fondo'}</span>
                      <span className={`text-2xl font-black mono ${results.scartoResiduoLog === 0 ? 'text-emerald-500' : (inputs.abilitaGiunta ? 'text-blue-400' : (results.isCortaRecuperabile ? 'text-emerald-400' : 'text-red-500'))}`}>
                        {results.scartoResiduoLog.toFixed(0)} <span className="text-xs">mm</span>
                      </span>
                    </div>
                 </div>

                 {/* LOG VISUALIZER */}
                 <div className="relative pt-4 z-10">
                    <div className="w-full h-24 bg-slate-950 rounded-2xl flex border-4 border-slate-900 shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] overflow-hidden p-1.5 gap-1.5">
                      {Array.from({ length: results.pezziInteriPerLog }).map((_, i) => (
                        <div key={i} className="h-full flex flex-col items-center justify-center relative transition-all duration-700" style={{ width: `${(results.cutUtilizzato / (selectedLog?.length || 1)) * 100}%`, background: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)' }}>
                          <div className="absolute top-2 text-[8px] font-black text-slate-700">{i+1}</div>
                          <span className="text-[11px] font-black text-emerald-500/60 mono">{results.cutUtilizzato}</span>
                          <div className="absolute bottom-0 w-full h-1 bg-emerald-500/30"></div>
                        </div>
                      ))}
                      
                      {results.scartoResiduoLog > 0 && (
                        <div className={`flex-1 h-full flex items-center justify-center border-l relative overflow-hidden transition-all duration-500 ${inputs.abilitaGiunta ? 'bg-blue-950/40 border-blue-900/40' : (results.isCortaRecuperabile ? 'bg-emerald-950/40 border-emerald-900/40' : 'bg-red-950/30 border-red-900/40')}`}>
                          <div className="absolute inset-0 opacity-10" style={(!inputs.abilitaGiunta && !results.isCortaRecuperabile) ? { backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, #ff0000 10px, #ff0000 20px)' } : {}}></div>
                          <div className="flex flex-col items-center z-10 text-center px-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${inputs.abilitaGiunta ? 'text-blue-400' : (results.isCortaRecuperabile ? 'text-emerald-400' : 'text-red-600')}`}>
                              {inputs.abilitaGiunta ? 'INIZIO COMPENSATO' : (results.isCortaRecuperabile ? 'CORTA' : 'SCARTO')}
                            </span>
                            <span className={`text-[10px] font-bold mono ${inputs.abilitaGiunta ? 'text-blue-300' : (results.isCortaRecuperabile ? 'text-emerald-300' : 'text-red-500')}`}>
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
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Analisi Resa</span>
                      </div>
                      <div className="grid grid-cols-2 gap-6 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/50">
                        <MetricRow label="Utile Netto" value={`${results.utileNettoProfilo.toFixed(0)} mm`} sub="Profilo pianificato" color="text-emerald-400" />
                        <MetricRow label="Resa Standard" value={`${results.bpbEffettivo} PZ`} sub="Barre per billetta" color="text-amber-500" />
                        <MetricRow label="Billette Necessarie" value={`${results.billetteTotaliNecessarie} PZ`} sub="Cicli pressa totali" color="text-blue-400" />
                        <MetricRow label="Carico Ordine" value={results.metriRimanenti > 0.01 ? `${results.logsInteri} LOG + ${parseFloat(results.metriRimanenti.toFixed(2))}m` : `${results.logsInteri} LOG`} sub="Totale logs ordine" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-6">
                       <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-800">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficienza Recupero Forno</span>
                            <span className="text-sm font-black text-emerald-500 mono">
                              {inputs.abilitaGiunta ? '99.5' : (results.scartoResiduoLog === 0 ? '100.0' : (( (results.pezziInteriPerLog * results.cutUtilizzato + (results.isCortaRecuperabile ? results.scartoResiduoLog : 0)) / (selectedLog?.length || 1) ) * 100).toFixed(1))}%
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: inputs.abilitaGiunta ? '99.5%' : (results.scartoResiduoLog === 0 ? '100%' : `${((results.pezziInteriPerLog * results.cutUtilizzato + (results.isCortaRecuperabile ? results.scartoResiduoLog : 0)) / (selectedLog?.length || 1)) * 100}%`) }}></div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Peso Ordine</span>
                            <span className="text-sm font-black text-white mono">{results.pesoOrdine.toFixed(1)} kg</span>
                         </div>
                         <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Scarto Stimato</span>
                            <span className="text-sm font-black text-red-400 mono">{(results.pesoProduzione - results.pesoOrdine).toFixed(1)} kg</span>
                         </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* MESSAGGIO INFORMATIVO RECUPERO */}
              {results.isCortaRecuperabile && (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 flex items-start gap-5 animate-in slide-in-from-bottom-2">
                  <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                    <Scissors className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Recupero Fondo Log</h4>
                    <p className="text-[11px] text-emerald-300/80 mt-1 leading-relaxed">
                      L'avanzo di <b>{results.scartoResiduoLog.toFixed(0)}mm</b> permette una billetta corta da <b>{results.bpbCorta} barre</b>.
                    </p>
                  </div>
                </div>
              )}
              {results.isCortaScartata && (
                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 flex items-start gap-5 animate-in slide-in-from-bottom-2">
                  <div className="bg-red-500 p-3 rounded-xl shadow-lg shadow-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Billetta Corta da Scartare</h4>
                    <p className="text-[11px] text-red-300/80 mt-1 leading-relaxed">
                      L'avanzo di <b>{results.scartoResiduoLog.toFixed(0)}mm</b> è troppo corto per produrre profili (0 tagli). <b>Scartare.</b>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-[#0f172a] border-t border-slate-800 p-4 px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">© {new Date().getFullYear()} EXTRUCALC</span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <span>Ø206 EXTRUSION ENGINE</span>
        </div>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors group">
          <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-emerald-400 transition-colors">Contatto Instagram</span>
        </a>
      </footer>
    </div>
  );
};

export default App;
