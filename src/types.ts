export interface CuttingOption {
  pieces: number;
  length: number;
}

export interface BilletType {
  id: string;
  name: string;
  length: number; // mm nominali
  options: CuttingOption[];
}

export interface CalculationInputs {
  tirataRiferimento: number;
  taglioRiferimento: number;
  fondello: number;
  lunghezzaBarra: number;
  numeroBarre: number;
  numeroLuci: number;
  pesoMTL: number;
  scartoTesta: number;
  scartoCoda: number;
  billettoneId: string;
  modalitaManuale: boolean;
  taglioManuale: number;
  abilitaGiunta: boolean;
  billetteEstruse: number;
}

export interface Ordine {
  id: string;
  articolo: string;
  numeroBarre: number; // For quantity of profiles in the order
  numeroBarra?: string; // For the "N° Barra" or Die identifier
  lega: string;
  tirataRiferimento: number;
  taglioRiferimento: number;
  fondello: number;
  lunghezzaBarra: number;
  numeroLuci: number;
  pesoMTL: number;
  scartoTesta: number;
  scartoCoda: number;
  billettoneId: string;
  taglioManuale: number;
  abilitaGiunta: boolean;
}

export interface ArticoloDB {
  id: string;
  articolo: string;
  numeroBarra?: string; // For the "N° Barra" or Die identifier
  lega: string;
  tirataRiferimento: number;
  taglioRiferimento: number;
  fondello: number;
  lunghezzaBarra: number;
  numeroLuci: number;
  pesoMTL: number;
  scartoTesta: number;
  scartoCoda: number;
  billettoneId: string;
  abilitaGiunta: boolean;
  dataCreazione: number;
}

export interface DieHistoryEntry {
  id: string;
  articolo: string;
  numeroBarra: string;
  billetteEstruse: number;
  scartoReale: number | null;
  turno?: 1 | 2 | 3 | null;
  operatore: string | null;
  note: string | null;
  dataCreazione: number;
}
