import { BilletType, CalculationInputs } from './types';

export const BILLET_TYPES: BilletType[] = [
  {
    id: '8000', name: 'Log 8000', length: 8000,
    options: [
      { pieces: 6, length: 1348 },
      { pieces: 7, length: 1153 },
      { pieces: 8, length: 1008 },
      { pieces: 9, length: 894 },
      { pieces: 10, length: 805 }
    ]
  },
  {
    id: '7000', name: 'Log 7000', length: 7000,
    options: [
      { pieces: 6, length: 1180 },
      { pieces: 7, length: 1008 },
      { pieces: 8, length: 885 },
      { pieces: 9, length: 783 }
    ]
  },
  {
    id: '6300', name: 'Log 6300', length: 6300,
    options: [
      { pieces: 5, length: 1270 },
      { pieces: 6, length: 1058 },
      { pieces: 7, length: 907 }
    ]
  },
  {
    id: '6200', name: 'Log 6200', length: 6200,
    options: [
      { pieces: 5, length: 1255 },
      { pieces: 6, length: 1045 },
      { pieces: 7, length: 896 }
    ]
  },
  {
    id: '6100', name: 'Log 6100', length: 6100,
    options: [
      { pieces: 5, length: 1230 },
      { pieces: 6, length: 1026 },
      { pieces: 7, length: 880 }
    ]
  },
  {
    id: '5900', name: 'Log 5900', length: 5900,
    options: [
      { pieces: 5, length: 1192 },
      { pieces: 6, length: 995 },
      { pieces: 7, length: 850 }
    ]
  },
  {
    id: '5800', name: 'Log 5800', length: 5800,
    options: [
      { pieces: 5, length: 1170 },
      { pieces: 6, length: 980 },
      { pieces: 7, length: 843 }
    ]
  }
];

export const INITIAL_INPUTS: CalculationInputs = {
  tirataRiferimento: 4800,
  taglioRiferimento: 894,
  fondello: 17,
  lunghezzaBarra: 3000,
  numeroBarre: 68,
  numeroLuci: 1,
  pesoMTL: 24368,
  scartoTesta: 600,
  scartoCoda: 700,
  billettoneId: '8000',
  modalitaManuale: false,
  taglioManuale: 894,
  abilitaGiunta: false,
  billetteEstruse: 0,
};

export const ALLOY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "6082": { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" },
  "6060": { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" },
  "3103": { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", border: "border-fuchsia-500/50" },
  "1050": { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/50" },
  "6005": { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
  "6063": { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/50" },
  "6061": { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" }
};
