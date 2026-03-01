
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
