export interface Measure {
  id: string;
  chords: string[]; // e.g. ["C", "G"] for a split bar, or just ["C"]
  beats: number;    // typically 4
  performanceNotes?: string[]; // user-inserted performance notes (e.g. 'crescendo', 'ficar atento')
  performanceNote?: string; // fallback single note
}

export interface SongSection {
  id: string;
  name: string;      // e.g. "Intro", "Verso 1", "Refrão", "Solo"
  color: string;     // for high-contrast visual section tags
  measures: Measure[];
  dynamics?: string; // e.g. "Entra batera suave", "Crescendo", "Voz e violão"
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  originalKey: string;
  currentKey: string;
  bpm: number;
  timeSignature: string; // e.g. "4/4"
  sections: SongSection[];
  notes?: string;
  duration?: string;
  footerNotes?: string;
}

export interface Setlist {
  id: string;
  name: string;
  songs: Song[];
}
