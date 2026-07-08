import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Music, 
  Play, 
  Pause, 
  Sliders, 
  Plus, 
  MessageSquare, 
  Grid, 
  Info, 
  Save, 
  Sparkles,
  ArrowRightLeft,
  X,
  PlusCircle,
  HelpCircle,
  Upload,
  FileText,
  Clock,
  Trash2,
  ListMusic,
  CheckCircle,
  FileDown,
  Eye,
  Settings,
  ChevronRight,
  PlusSquare,
  Sparkle,
  Mic,
  MicOff,
  Volume2,
  Globe,
  Copy,
  Check,
  Tag,
  StickyNote,
  Printer,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Layers,
  Activity
} from "lucide-react";
import { Song, SongSection, Measure } from "./types";
import { transposeSong, transposeChord } from "./utils/musicUtils";
import { parseMusicXML, parseChordSheet, extractTextFromPdf } from "./utils/fileParser";

// Premium repertoire including Angels from Robbie Williams with the exact PDF chords
const INITIAL_SONGS: Song[] = [
  {
    id: "angels",
    title: "Angels",
    artist: "Robbie Williams",
    originalKey: "E",
    currentKey: "E",
    bpm: 75,
    timeSignature: "4/4",
    duration: "4:24",
    notes: "Roteiro fiel ao LiveSet e ao PDF enviado. Destaque para as divisões rítmicas rápidas de final de sistema.",
    footerNotes: "* Afinamento padrão. Foco nas transições rítmicas do Pré-Refrão.",
    sections: [
      {
        id: "ang-in",
        name: "IN",
        color: "bg-zinc-700 text-white border-zinc-550", // Gray
        dynamics: "Piano solo conduzindo suavemente",
        measures: [
          { id: "ang-in-1", chords: ["EM"], beats: 4, performanceNotes: ["Suave", "Piano Solo"] },
          { id: "ang-in-2", chords: ["%"], beats: 4 },
          { id: "ang-in-3", chords: ["%"], beats: 4 },
          { id: "ang-in-4", chords: ["%"], beats: 4 },
        ]
      },
      {
        id: "ang-v1",
        name: "V",
        color: "bg-emerald-600 text-white border-emerald-500", // Green
        dynamics: "Entrada da primeira estrofe (I sit and wait...)",
        measures: [
          { id: "ang-v1-1", chords: ["EM"], beats: 4 },
          { id: "ang-v1-2", chords: ["%"], beats: 4 },
          { id: "ang-v1-3", chords: ["AM"], beats: 4 },
          { id: "ang-v1-4", chords: ["BM"], beats: 4 },
        ]
      },
      {
        id: "ang-pc",
        name: "PC",
        color: "bg-zinc-100 text-zinc-950 border-2 border-zinc-400 font-bold", // White/Border
        dynamics: "Crescendo instrumental - preparation for chorus",
        measures: [
          { id: "ang-pc-1", chords: ["F#m7"], beats: 4 },
          { id: "ang-pc-2", chords: ["AM"], beats: 4 },
          { id: "ang-pc-3", chords: ["C#m"], beats: 4 },
          { id: "ang-pc-4", chords: ["AM"], beats: 4 },
          { id: "ang-pc-5", chords: ["DM"], beats: 4 },
          { id: "ang-pc-6", chords: ["AM/C#"], beats: 4 },
          { id: "ang-pc-7", chords: ["EM"], beats: 4 },
          { id: "ang-pc-8", chords: ["DM", "AM/C#", "EM"], beats: 4, performanceNotes: ["Crescendo Máximo", "Atenção ao Break"] },
        ]
      },
      {
        id: "ang-c",
        name: "C",
        color: "bg-red-650 text-white border-red-500", // Red
        dynamics: "Drums enter (Bateria cheia com peso nos metais)",
        measures: [
          { id: "ang-c-1", chords: ["BM"], beats: 4, performanceNotes: ["Entra Batera!", "Forte"] },
          { id: "ang-c-2", chords: ["C#m"], beats: 4 },
          { id: "ang-c-3", chords: ["AM"], beats: 4 },
          { id: "ang-c-4", chords: ["EM"], beats: 4 },
          { id: "ang-c-5", chords: ["BM"], beats: 4 },
          { id: "ang-c-6", chords: ["C#m"], beats: 4 },
          { id: "ang-c-7", chords: ["AM"], beats: 4 },
          { id: "ang-c-8", chords: ["EM/G#"], beats: 4 },
          { id: "ang-c-9", chords: ["F#m"], beats: 4 },
          { id: "ang-c-10", chords: ["DM"], beats: 4 },
          { id: "ang-c-11", chords: ["AM/C#"], beats: 4 },
          { id: "ang-c-12", chords: ["EM"], beats: 4 },
        ]
      },
      {
        id: "ang-v2",
        name: "V",
        color: "bg-emerald-600 text-white border-emerald-500", // Green
        dynamics: "Verso subsequente",
        measures: [
          { id: "ang-v2-1", chords: ["EM"], beats: 4 },
          { id: "ang-v2-2", chords: ["%"], beats: 4 },
          { id: "ang-v2-3", chords: ["AM"], beats: 4 },
          { id: "ang-v2-4", chords: ["BM"], beats: 4 },
        ]
      },
      {
        id: "ang-pc2",
        name: "PC",
        color: "bg-zinc-100 text-zinc-950 border-2 border-zinc-400 font-bold",
        dynamics: "Roteiro dinâmico direto",
        measures: [
          { id: "ang-pc2-1", chords: ["DM"], beats: 4 },
          { id: "ang-pc2-2", chords: ["AM/C#"], beats: 4 },
          { id: "ang-pc2-3", chords: ["EM"], beats: 4 },
          { id: "ang-pc2-4", chords: ["DM", "AM/C#", "EM"], beats: 4 },
        ]
      },
      {
        id: "ang-b",
        name: "B",
        color: "bg-amber-500 text-zinc-950 border-amber-400 font-bold", // Orange
        dynamics: "Bridge - Solo de Guitarra emocionante",
        measures: [
          { id: "ang-b-1", chords: ["BM"], beats: 4 },
          { id: "ang-b-2", chords: ["AM"], beats: 4 },
          { id: "ang-b-3", chords: ["EM"], beats: 4 },
          { id: "ang-b-4", chords: ["%"], beats: 4 },
          { id: "ang-b-5", chords: ["Bm7"], beats: 4 },
          { id: "ang-b-6", chords: ["F#m"], beats: 4 },
          { id: "ang-b-7", chords: ["EM"], beats: 4 },
          { id: "ang-b-8", chords: ["%"], beats: 4 },
          { id: "ang-b-fa2", chords: ["EM/G#"], beats: 4 },
        ]
      }
    ]
  },
  {
    id: "tempo-perdido",
    title: "Tempo Perdido",
    artist: "Legião Urbana",
    originalKey: "C",
    currentKey: "C",
    bpm: 114,
    timeSignature: "4/4",
    duration: "4:32",
    notes: "Clássico nacional. Roteiro estruturado comp-a-comp para execução precisa.",
    footerNotes: "* Ritmo de semicolcheia constante no violão de aço (114 BPM).",
    sections: [
      {
        id: "tp-in",
        name: "IN",
        color: "bg-zinc-700 text-white",
        dynamics: "Arpejos de guitarra e sintetizador",
        measures: [
          { id: "tp-i1", chords: ["C"], beats: 4 },
          { id: "tp-i2", chords: ["Am"], beats: 4 },
          { id: "tp-i3", chords: ["Bm"], beats: 4 },
          { id: "tp-i4", chords: ["Em"], beats: 4 },
        ]
      },
      {
        id: "tp-v1",
        name: "V",
        color: "bg-emerald-600 text-white",
        dynamics: "Voz limpa, baixo entra constante",
        measures: [
          { id: "tp-v-1", chords: ["C"], beats: 4 },
          { id: "tp-v-2", chords: ["Am"], beats: 4 },
          { id: "tp-v-3", chords: ["Bm"], beats: 4 },
          { id: "tp-v-4", chords: ["Em"], beats: 4 },
          { id: "tp-v-5", chords: ["C"], beats: 4 },
          { id: "tp-v-6", chords: ["Am"], beats: 4 },
          { id: "tp-v-7", chords: ["Bm"], beats: 4 },
          { id: "tp-v-8", chords: ["Em"], beats: 4 },
        ]
      }
    ]
  },
  {
    id: "so-what",
    title: "So What",
    artist: "Miles Davis",
    originalKey: "Dm",
    currentKey: "Dm",
    bpm: 134,
    timeSignature: "4/4",
    duration: "9:22",
    notes: "Estrutura modal Dorian. Contagem estrita 8 compassos por seção.",
    footerNotes: "* Clássico modal de Miles Davis: 16 compassos de Dm7, 8 compassos de Ebm7, depois mais 8 compassos de Dm7.",
    sections: [
      {
        id: "sw-a",
        name: "A",
        color: "bg-zinc-700 text-white",
        dynamics: "Tema de contrabaixo acústico",
        measures: [
          { id: "sw-a1", chords: ["Dm7"], beats: 4 },
          { id: "sw-a2", chords: ["%"], beats: 4 },
          { id: "sw-a3", chords: ["%"], beats: 4 },
          { id: "sw-a4", chords: ["%"], beats: 4 },
          { id: "sw-a5", chords: ["%"], beats: 4 },
          { id: "sw-a6", chords: ["%"], beats: 4 },
          { id: "sw-a7", chords: ["%"], beats: 4 },
          { id: "sw-a8", chords: ["%"], beats: 4 },
        ]
      },
      {
        id: "sw-b",
        name: "B",
        color: "bg-amber-500 text-black font-bold",
        dynamics: "Modulação meio tom acima para Eb Dorian",
        measures: [
          { id: "sw-b1", chords: ["Ebm7"], beats: 4 },
          { id: "sw-b2", chords: ["%"], beats: 4 },
          { id: "sw-b3", chords: ["%"], beats: 4 },
          { id: "sw-b4", chords: ["%"], beats: 4 },
          { id: "sw-b5", chords: ["%"], beats: 4 },
          { id: "sw-b6", chords: ["%"], beats: 4 },
          { id: "sw-b7", chords: ["%"], beats: 4 },
          { id: "sw-b8", chords: ["%"], beats: 4 },
        ]
      }
    ]
  }
];

// Simulated lyrics database for stage companion real-time simulation feed
const SIMULATED_LYRICS: Record<string, string[]> = {
  angels: [
    "I sit and wait, does an angel contemplate my fate...",
    "And do they know the places where we go when we're grey and old",
    "And I'm told that salvation lets their wings unfold",
    "REFRÃO: 'I'm loving angels instead' - Highlighting Chorus section",
    "So when I'm lying in my bed, thoughts running through my head",
    "And I feel that love is dead, I'm loving angels instead",
    "C#M: Heard chord 'C#m' during piano vocal crescendo",
    "And through it all she offers me protection",
    "A lot of love and affection, whether I'm right or wrong",
    "Down the waterfall, wherever it may take me",
    "I know that life won't break me",
    "When I come to call, she won't forsake me",
    "BM: Heard chord 'BM' in transitions"
  ],
  "tempo-perdido": [
    "Todos os dias antes de dormir, lembro e esqueço como foi o dia...",
    "Sempre em frente, não temos tempo a perder",
    "INTRO: 'Guitar riff & Synth introductory theme'",
    "Nosso suor sagrado é bem mais belo que esse sangue amargo",
    "E deixamos nossos corpos no mundo como se houvesse mais de nós",
    "AM: Heard chord 'Am' on double-bass syncopated rhythm",
    "Veja o sol dessa manhã tão cinza, a tempestade que chega é da cor dos teus olhos",
    "Mas não me diga isso, não me diga que o amor morreu"
  ],
  "so-what": [
    "Jazz ensemble counting measures...",
    "INTRO: 'Double bass introductory rubato solo'...",
    "A: Dynamic Modal Dorian groove active",
    "Double bass walking line...",
    "B: 'Modulating Eb Dorian half step up'",
    "Slight improvisation cue over modal scales..."
  ]
};

function getChordSuggestions(chord: string): string[] {
  if (!chord || chord === "%") {
    return ["C", "G", "D", "A", "E", "F"];
  }
  
  // Extract root note (A-G with optional # or b)
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  if (!rootMatch) {
    return ["C", "G", "D", "A", "E", "F"];
  }
  
  const root = rootMatch[0];
  const rest = chord.slice(root.length);
  
  // If it's a slash chord, get suggestions for the main part, but keep the slash bass
  if (chord.includes("/")) {
    const parts = chord.split("/");
    const baseSuggestions = getChordSuggestions(parts[0]);
    return baseSuggestions.map(s => `${s}/${parts[1]}`);
  }

  const isMinor = rest.startsWith("m") && !rest.startsWith("maj");
  const isSuspended = rest.toLowerCase().includes("sus");
  const isDiminished = rest.toLowerCase().includes("dim") || rest.includes("°");
  const isAugmented = rest.toLowerCase().includes("aug") || rest.includes("+");
  
  if (isMinor) {
    return [
      `${root}m7`,
      `${root}m9`,
      `${root}m(add9)`,
      `${root}m6`,
      `${root}m11`,
      `${root}msus4`
    ];
  } else if (isSuspended) {
    return [
      `${root}7sus4`,
      `${root}sus2`,
      `${root}9sus4`,
      root,
      `${root}m`
    ];
  } else if (isDiminished) {
    return [
      `${root}dim7`,
      `${root}m7b5`,
      `${root}7`
    ];
  } else if (isAugmented) {
    return [
      `${root}aug7`,
      `${root}7#5`,
      root
    ];
  } else {
    return [
      `${root}7`,
      `${root}maj7`,
      `${root}add9`,
      `${root}9`,
      `${root}maj9`,
      `${root}sus4`,
      `${root}6`,
      `${root}7#9`
    ];
  }
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("live_set_companion_songs");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load songs from localStorage:", e);
      }
    }
    return INITIAL_SONGS;
  });

  const [activeSongId, setActiveSongId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("live_set_companion_active_song_id");
        if (saved) return saved;
      } catch (e) {
        console.warn("Failed to load activeSongId from localStorage:", e);
      }
    }
    return "angels";
  });

  const [transposeOffset, setTransposeOffset] = useState<number>(0);
  
  // Setlist mode configuration states
  const [isSetlistMode, setIsSetlistMode] = useState<boolean>(false);

  const [setlist, setSetlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("live_set_companion_setlist");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load setlist from localStorage:", e);
      }
    }
    return INITIAL_SONGS.map(s => s.id);
  });

  // Auto-save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("live_set_companion_songs", JSON.stringify(songs));
    } catch (e) {
      console.warn("Failed to save songs to localStorage:", e);
    }
  }, [songs]);

  useEffect(() => {
    try {
      localStorage.setItem("live_set_companion_setlist", JSON.stringify(setlist));
    } catch (e) {
      console.warn("Failed to save setlist to localStorage:", e);
    }
  }, [setlist]);

  useEffect(() => {
    try {
      localStorage.setItem("live_set_companion_active_song_id", activeSongId);
    } catch (e) {
      console.warn("Failed to save activeSongId to localStorage:", e);
    }
  }, [activeSongId]);
  const [activeTab, setActiveTab] = useState<"repertoire" | "setlist">("repertoire");
  
  // Theme Toggle: "paper" (PDF facsimile style) vs "stage" (Deep high-contrast neon stage mode)
  const [scoreTheme, setScoreTheme] = useState<"paper" | "stage">("paper");

  // Metronome State
  const [isPlayingMetronome, setIsPlayingMetronome] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [bpmOverride, setBpmOverride] = useState<number>(0);
  const [metronomeBeats, setMetronomeBeats] = useState<number>(4);
  const [isRehearsalMode, setIsRehearsalMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("live_set_companion_rehearsal_mode");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load rehearsal mode:", e);
      }
    }
    return false;
  });

  // Auto-save rehearsal mode state
  useEffect(() => {
    try {
      localStorage.setItem("live_set_companion_rehearsal_mode", JSON.stringify(isRehearsalMode));
    } catch (e) {
      console.warn("Failed to save rehearsal mode:", e);
    }
  }, [isRehearsalMode]);

  // File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadFeedback, setUploadFeedback] = useState<string>("");

  // Alignment questionnaire responses
  const [q1, setQ1] = useState<string>("misto");
  const [q2, setQ2] = useState<string>("txt_import");
  const [q3, setQ3] = useState<string>("tablet_pedal");
  const [q4, setQ4] = useState<string>("realtime_sync");
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // Live Audio Transcription States
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionLogs, setTranscriptionLogs] = useState<{ time: string; text: string; isCommand?: boolean }[]>([]);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>("pt-BR");
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isRealMic, setIsRealMic] = useState<boolean>(false);
  const [activeVoiceCommand, setActiveVoiceCommand] = useState<string>("none");
  const [micError, setMicError] = useState<string>("");
  const [selectedFeedType, setSelectedFeedType] = useState<"microphone" | "simulation">("simulation");
  const [voiceNoteFeedback, setVoiceNoteFeedback] = useState<string>("");
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  // Hands-free Keyboard & MIDI Shortcut States
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [activeSystemIdx, setActiveSystemIdx] = useState<number>(0);
  const [midiAccessState, setMidiAccessState] = useState<string>("Não inicializado");
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [lastMidiEvent, setLastMidiEvent] = useState<string>("Nenhum evento");
  const [midiMappingNext, setMidiMappingNext] = useState<{ type: 'cc' | 'note'; value: number }>({ type: 'cc', value: 64 }); // Default: Sustain Pedal (CC 64)
  const [midiMappingPrev, setMidiMappingPrev] = useState<{ type: 'cc' | 'note'; value: number }>({ type: 'note', value: 62 }); // Default: D3 (62)
  const [isMappingMode, setIsMappingMode] = useState<'next' | 'prev' | null>(null);
  const [midiFeedback, setMidiFeedback] = useState<string>("");

  // Copy transcribed logs to clipboard
  const handleCopyLogs = () => {
    if (transcriptionLogs.length === 0) return;
    const textToCopy = transcriptionLogs.map(log => `[${log.time}] ${log.text}`).join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            setCopiedLogs(true);
            setTimeout(() => setCopiedLogs(false), 2000);
          })
          .catch(err => {
            console.error("Erro ao copiar via clipboard API:", err);
          });
      } else {
        // Fallback for older browsers or sandboxed iframes
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopiedLogs(true);
          setTimeout(() => setCopiedLogs(false), 2000);
        } catch (err) {
          console.error("Fallback de cópia falhou:", err);
        }
        document.body.removeChild(textArea);
      }
    } catch (e) {
      console.error("Erro geral de cópia:", e);
    }
  };

  // Append logs as a voice rehearsal note directly into the active song's metadata
  const handleAddVoiceNoteToSong = () => {
    if (transcriptionLogs.length === 0) return;
    const notesToAppend = transcriptionLogs.map(log => `[${log.time}] ${log.text}`).join("\n");
    setSongs(prevSongs => prevSongs.map(song => {
      if (song.id === activeSongId) {
        return {
          ...song,
          notes: song.notes 
            ? `${song.notes}\n\n[Ensaio de Voz]:\n${notesToAppend}` 
            : `[Ensaio de Voz]:\n${notesToAppend}`
        };
      }
      return song;
    }));
    
    setVoiceNoteFeedback("Anotação adicionada ao roteiro da música!");
    setTimeout(() => setVoiceNoteFeedback(""), 3000);
  };

  // Add song modal
  const [showAddSongModal, setShowAddSongModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newArtist, setNewArtist] = useState<string>("");
  const [newBpm, setNewBpm] = useState<number>(80);
  const [newKey, setNewKey] = useState<string>("G");

  // Chord Editing States
  const [editingChord, setEditingChord] = useState<{
    sectionId: string;
    measureId: string;
    chordIdx: number;
  } | null>(null);
  const [editingChordText, setEditingChordText] = useState<string>("");

  const handleUpdateChord = (sectionId: string, measureId: string, chordIdx: number, newChord: string) => {
    // If we have a transposeOffset, transpose the chord back to the original key before saving
    const untransposedChord = transposeOffset !== 0 ? transposeChord(newChord, -transposeOffset) : newChord;
    setSongs(prevSongs => prevSongs.map(song => {
      if (song.id === activeSongId) {
        return {
          ...song,
          sections: song.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                measures: section.measures.map(measure => {
                  if (measure.id === measureId) {
                    const updatedChords = [...measure.chords];
                    updatedChords[chordIdx] = untransposedChord.trim() || "%";
                    return {
                      ...measure,
                      chords: updatedChords
                    };
                  }
                  return measure;
                })
              };
            }
            return section;
          })
        };
      }
      return song;
    }));
  };

  // Performance Notes States
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [selectedSectionIdForNote, setSelectedSectionIdForNote] = useState<string>("");
  const [selectedMeasureIdForNote, setSelectedMeasureIdForNote] = useState<string>("");
  const [newPerformanceNoteText, setNewPerformanceNoteText] = useState<string>("");

  const handleAddPerformanceNote = (sectionId: string, measureId: string, noteText: string) => {
    if (!noteText.trim()) return;
    setSongs(prevSongs => prevSongs.map(song => {
      if (song.id === activeSongId) {
        return {
          ...song,
          sections: song.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                measures: section.measures.map(measure => {
                  if (measure.id === measureId) {
                    const currentNotes = measure.performanceNotes || [];
                    return {
                      ...measure,
                      performanceNotes: [...currentNotes, noteText.trim()]
                    };
                  }
                  return measure;
                })
              };
            }
            return section;
          })
        };
      }
      return song;
    }));
  };

  const handleRemovePerformanceNote = (sectionId: string, measureId: string, noteIndex: number) => {
    setSongs(prevSongs => prevSongs.map(song => {
      if (song.id === activeSongId) {
        return {
          ...song,
          sections: song.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                measures: section.measures.map(measure => {
                  if (measure.id === measureId) {
                    const currentNotes = measure.performanceNotes || [];
                    const updatedNotes = currentNotes.filter((_, idx) => idx !== noteIndex);
                    return {
                      ...measure,
                      performanceNotes: updatedNotes
                    };
                  }
                  return measure;
                })
              };
            }
            return section;
          })
        };
      }
      return song;
    }));
  };

  // Setlist management helper functions
  const toggleSongInSetlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSetlist(prev => {
      if (prev.includes(id)) {
        return prev.filter(songId => songId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const moveSetlistItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= setlist.length) return;
    const newSetlist = [...setlist];
    const [moved] = newSetlist.splice(index, 1);
    newSetlist.splice(newIndex, 0, moved);
    setSetlist(newSetlist);
  };

  const removeSetlistItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSetlist = [...setlist];
    newSetlist.splice(index, 1);
    setSetlist(newSetlist);
  };

  const handleClearSetlist = () => {
    setSetlist([]);
  };

  const handleAddAllToSetlist = () => {
    setSetlist(songs.map(s => s.id));
  };

  const handleShuffleSetlist = () => {
    const shuffled = [...setlist].sort(() => Math.random() - 0.5);
    setSetlist(shuffled);
  };

  // Refs
  const metronomeInterval = useRef<NodeJS.Timeout | null>(null);
  const metronomeAudioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0.0);
  const currentBeatRef = useRef<number>(0);
  const metronomeTimerRef = useRef<number | null>(null);
  const bpmRef = useRef<number>(120);
  const beatsRef = useRef<number>(4);
  const tapTimestampsRef = useRef<number[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lyricIndexRef = useRef<number>(0);

  // Stop transcription and release resources
  const stopTranscription = () => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setMicVolume(0);
    setIsRealMic(false);
  };

  // Process incoming transcribed text (or simulated lyrics)
  const handleIncomingTranscript = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Check if the phrase contains any musical keywords
    const textUpper = text.toUpperCase();
    let isCommand = false;
    let matchedCmd = "";

    // Command keywords representing chords or section symbols
    const commandKeywords = ["EM", "AM", "BM", "C#M", "REFRÃO", "INTRO", "PC", "V", "B", "ANGELS", "LEGIÃO"];
    for (const keyword of commandKeywords) {
      if (textUpper.includes(keyword)) {
        isCommand = true;
        matchedCmd = keyword;
        break;
      }
    }

    if (isCommand && matchedCmd) {
      setActiveVoiceCommand(matchedCmd);
      // Auto-reset highlight after 3.5 seconds
      setTimeout(() => {
        setActiveVoiceCommand(prev => prev === matchedCmd ? "none" : prev);
      }, 3500);
    }

    setTranscriptionLogs(prev => [
      { time: timeStr, text, isCommand },
      ...prev.slice(0, 49) // limit to last 50 logs
    ]);
  };

  // Start reading real-time microphone amplitude/volume levels
  const startRealMicVolume = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // scale avg volume to 0-100 range
        setMicVolume(Math.min(100, Math.floor(avg * 1.8)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
      setMicError("");
    } catch (err: any) {
      console.warn("Real mic access failed inside iframe sandbox or blocked permissions:", err);
      setMicError("Acesso ao microfone bloqueado pelo iframe/navegador. Iniciando Simulador de Ensaio automático.");
      setSelectedFeedType("simulation");
    }
  };

  // Initialize browser Web Speech API SpeechRecognition
  const startSpeechRecognition = () => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) {
      setMicError("Speech Recognition não é suportada neste navegador. Use o Simulador de Ensaio.");
      setSelectedFeedType("simulation");
      return;
    }

    try {
      const rec = new SpeechClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = transcriptionLanguage;

      rec.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const speechText = event.results[lastResultIndex][0].transcript.trim();
        if (speechText) {
          handleIncomingTranscript(speechText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setMicError("Permissão de microfone negada. Iniciando Simulador de Ensaio automático.");
          setSelectedFeedType("simulation");
        }
      };

      rec.onend = () => {
        // Keep it running as long as transcribing is active
        if (isTranscribing && selectedFeedType === "microphone" && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e: any) {
      console.warn("Speech API start failed", e);
    }
  };

  // Transcription Orchestrator Effect
  useEffect(() => {
    // Reset lyric index on song or language change
    lyricIndexRef.current = 0;
    
    if (isTranscribing) {
      if (selectedFeedType === "microphone") {
        setIsRealMic(true);
        startRealMicVolume();
        startSpeechRecognition();
      } else {
        setIsRealMic(false);
        // Start simulation
        const currentSongLyrics = SIMULATED_LYRICS[activeSongId] || SIMULATED_LYRICS["angels"];
        handleIncomingTranscript(currentSongLyrics[0]);
        lyricIndexRef.current = 1;

        simulationTimerRef.current = setInterval(() => {
          const lyrics = SIMULATED_LYRICS[activeSongId] || SIMULATED_LYRICS["angels"];
          const line = lyrics[lyricIndexRef.current % lyrics.length];
          handleIncomingTranscript(line);
          lyricIndexRef.current++;
          
          // Simulate simple audio volume bounce
          setMicVolume(Math.floor(Math.random() * 30) + 40);
          setTimeout(() => setMicVolume(Math.floor(Math.random() * 15) + 10), 1000);
        }, 4000);
      }
    } else {
      stopTranscription();
    }

    return () => {
      stopTranscription();
    };
  }, [isTranscribing, selectedFeedType, activeSongId, transcriptionLanguage]);

  // Get current active song and transpose chords on the fly
  const baseSong = songs.find(s => s.id === activeSongId) || songs[0];
  const activeSong = transposeSong(baseSong, transposeOffset);
  const currentBpm = bpmOverride || activeSong.bpm;

  // Synchronize selected measure when selected section changes
  useEffect(() => {
    if (selectedSectionIdForNote) {
      const sectionObj = activeSong.sections.find(s => s.id === selectedSectionIdForNote);
      if (sectionObj && sectionObj.measures.length > 0) {
        const hasMeasure = sectionObj.measures.some(m => m.id === selectedMeasureIdForNote);
        if (!hasMeasure) {
          setSelectedMeasureIdForNote(sectionObj.measures[0].id);
        }
      } else {
        setSelectedMeasureIdForNote("");
      }
    }
  }, [selectedSectionIdForNote, activeSong, selectedMeasureIdForNote]);

  // Keep BPM and beat signature refs in sync with state for Web Audio scheduler
  useEffect(() => {
    bpmRef.current = currentBpm;
  }, [currentBpm]);

  useEffect(() => {
    beatsRef.current = metronomeBeats;
  }, [metronomeBeats]);

  // Sync metronome beats with the active song's time signature (numerator)
  useEffect(() => {
    if (activeSong && activeSong.timeSignature) {
      const numerator = parseInt(activeSong.timeSignature.split("/")[0], 10);
      if (!isNaN(numerator) && numerator >= 1 && numerator <= 12) {
        setMetronomeBeats(numerator);
      }
    }
  }, [activeSongId, activeSong?.timeSignature]);

  // High-Resolution Web Audio API Metronome Scheduler Effect
  useEffect(() => {
    if (metronomeTimerRef.current) {
      clearTimeout(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
    }

    if (isPlayingMetronome) {
      // Lazy initialization of metronome Audio Context
      if (!metronomeAudioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          metronomeAudioCtxRef.current = new AudioContextClass();
        }
      }

      const audioCtx = metronomeAudioCtxRef.current;
      if (audioCtx) {
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        // Set start coordinates
        nextNoteTimeRef.current = audioCtx.currentTime + 0.05;
        currentBeatRef.current = 0;
        setCurrentBeat(1);

        const lookahead = 25.0; // Check interval (ms)
        const scheduleAheadTime = 0.1; // Scheduling window (seconds)

        const scheduleNextClick = (beatNumber: number, time: number) => {
          if (!audioCtx) return;
          try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            // Accent beat 1 (index 0)
            const isAccent = beatNumber === 0;
            osc.frequency.setValueAtTime(isAccent ? 1200 : 800, time);
            
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06); // Decay envelope
            
            osc.start(time);
            osc.stop(time + 0.08);
          } catch (e) {
            console.warn("Rhythmic scheduling click error:", e);
          }
        };

        const scheduler = () => {
          if (!audioCtx || audioCtx.state === "closed") return;

          while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
            const beat = currentBeatRef.current;
            const time = nextNoteTimeRef.current;

            // 1. Schedule sound
            scheduleNextClick(beat, time);

            // 2. Schedule visual interface beat highlighting
            const delayMs = (time - audioCtx.currentTime) * 1000;
            const uiBeatNumber = beat + 1;

            setTimeout(() => {
              setCurrentBeat(uiBeatNumber);
            }, Math.max(0, delayMs));

            // 3. Increment counters
            const secondsPerBeat = 60.0 / bpmRef.current;
            nextNoteTimeRef.current += secondsPerBeat;
            currentBeatRef.current = (currentBeatRef.current + 1) % beatsRef.current;
          }

          metronomeTimerRef.current = window.setTimeout(scheduler, lookahead);
        };

        scheduler();
      }
    } else {
      setCurrentBeat(1);
    }

    return () => {
      if (metronomeTimerRef.current) {
        clearTimeout(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
    };
  }, [isPlayingMetronome]);

  // Tap Tempo Handler
  const handleTapTempo = () => {
    const now = Date.now();
    const taps = tapTimestampsRef.current;
    
    // Reset tap memory if dormant for more than 2.5 seconds
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      taps.length = 0;
    }
    
    taps.push(now);
    
    if (taps.length > 1) {
      // Retain last 5 taps for a stable running average
      if (taps.length > 5) {
        taps.shift();
      }
      
      let sumIntervals = 0;
      for (let i = 1; i < taps.length; i++) {
        sumIntervals += taps[i] - taps[i - 1];
      }
      const avgInterval = sumIntervals / (taps.length - 1);
      const calculatedBpm = Math.round(60000 / avgInterval);
      
      // Keep BPM within musicians' common territory
      const clampedBpm = Math.max(40, Math.min(250, calculatedBpm));
      setBpmOverride(clampedBpm);
    }
  };

  // Transpose actions
  const changeTranspose = (amount: number) => {
    setTransposeOffset(amount);
  };

  const handleSelectSong = (id: string) => {
    setActiveSongId(id);
    setTransposeOffset(0);
    setBpmOverride(0);
    if (!isRehearsalMode) {
      setIsPlayingMetronome(false);
    }
    setActiveSectionIdx(0);
    setActiveSystemIdx(0);
  };

  // Automatically scroll & navigate measures
  const advanceMeasureSet = useCallback((direction: 1 | -1) => {
    // Find active song
    const songIndex = songs.findIndex(s => s.id === activeSongId);
    if (songIndex === -1) return;
    const currentSongObj = songs[songIndex];
    if (!currentSongObj || !currentSongObj.sections || currentSongObj.sections.length === 0) return;

    // Helper to calculate total system rows for a section
    const getSystemCount = (sec: SongSection) => {
      const chunkSize = sec.measures.length > 8 ? 8 : 4;
      return Math.ceil(sec.measures.length / chunkSize);
    };

    let newSectionIdx = activeSectionIdx;
    let newSystemIdx = activeSystemIdx;

    if (direction === 1) {
      const currentSection = currentSongObj.sections[activeSectionIdx];
      const maxSystems = currentSection ? getSystemCount(currentSection) : 0;

      if (newSystemIdx + 1 < maxSystems) {
        newSystemIdx += 1;
      } else {
        // go to next section
        if (newSectionIdx + 1 < currentSongObj.sections.length) {
          newSectionIdx += 1;
          newSystemIdx = 0;
        } else {
          // go to next song
          if (isSetlistMode) {
            const currentInSetlistIdx = setlist.indexOf(activeSongId);
            if (currentInSetlistIdx !== -1 && currentInSetlistIdx + 1 < setlist.length) {
              const nextSongId = setlist[currentInSetlistIdx + 1];
              const nextSong = songs.find(s => s.id === nextSongId);
              if (nextSong) {
                setActiveSongId(nextSongId);
                setActiveSectionIdx(0);
                setActiveSystemIdx(0);
                
                setTransposeOffset(0);
                setBpmOverride(0);
                if (!isRehearsalMode) setIsPlayingMetronome(false);

                setLastMidiEvent(`Setlist: Avançou para: ${nextSong.title}`);
                setMidiFeedback(`Setlist: Avançou para: ${nextSong.title}`);
                setTimeout(() => setMidiFeedback(""), 2500);
              }
            } else {
              // Reached end of setlist, loop back to the first song
              const firstSongId = setlist[0];
              const firstSong = songs.find(s => s.id === firstSongId);
              if (firstSong) {
                setActiveSongId(firstSongId);
                setActiveSectionIdx(0);
                setActiveSystemIdx(0);
                
                setTransposeOffset(0);
                setBpmOverride(0);
                if (!isRehearsalMode) setIsPlayingMetronome(false);

                setLastMidiEvent(`Setlist Reiniciada: ${firstSong.title}`);
                setMidiFeedback(`Setlist Reiniciada: ${firstSong.title}`);
                setTimeout(() => setMidiFeedback(""), 2500);
              }
            }
            return;
          } else {
            const nextSongIndex = (songIndex + 1) % songs.length;
            const nextSong = songs[nextSongIndex];
            setActiveSongId(nextSong.id);
            setActiveSectionIdx(0);
            setActiveSystemIdx(0);
            
            setTransposeOffset(0);
            setBpmOverride(0);
            if (!isRehearsalMode) setIsPlayingMetronome(false);

            setLastMidiEvent(`Avançou para: ${nextSong.title}`);
            setMidiFeedback(`Avançou para: ${nextSong.title}`);
            setTimeout(() => setMidiFeedback(""), 2500);
            return;
          }
        }
      }
    } else {
      // direction === -1
      if (newSystemIdx > 0) {
        newSystemIdx -= 1;
      } else {
        // go to previous section
        if (newSectionIdx > 0) {
          newSectionIdx -= 1;
          const prevSection = currentSongObj.sections[newSectionIdx];
          newSystemIdx = getSystemCount(prevSection) - 1;
        } else {
          // go to previous song
          if (isSetlistMode) {
            const currentInSetlistIdx = setlist.indexOf(activeSongId);
            if (currentInSetlistIdx !== -1 && currentInSetlistIdx - 1 >= 0) {
              const prevSongId = setlist[currentInSetlistIdx - 1];
              const prevSong = songs.find(s => s.id === prevSongId);
              if (prevSong) {
                setActiveSongId(prevSongId);
                
                const lastSecIdx = prevSong.sections.length - 1;
                const lastSec = prevSong.sections[lastSecIdx];
                const lastSysIdx = lastSec ? getSystemCount(lastSec) - 1 : 0;
                
                setActiveSectionIdx(lastSecIdx >= 0 ? lastSecIdx : 0);
                setActiveSystemIdx(lastSysIdx >= 0 ? lastSysIdx : 0);
                
                setTransposeOffset(0);
                setBpmOverride(0);
                if (!isRehearsalMode) setIsPlayingMetronome(false);

                setLastMidiEvent(`Setlist: Voltou para: ${prevSong.title}`);
                setMidiFeedback(`Setlist: Voltou para: ${prevSong.title}`);
                setTimeout(() => setMidiFeedback(""), 2500);
              }
            } else {
              // Loop to last song in the setlist
              const lastSongId = setlist[setlist.length - 1];
              const prevSong = songs.find(s => s.id === lastSongId);
              if (prevSong) {
                setActiveSongId(lastSongId);
                
                const lastSecIdx = prevSong.sections.length - 1;
                const lastSec = prevSong.sections[lastSecIdx];
                const lastSysIdx = lastSec ? getSystemCount(lastSec) - 1 : 0;
                
                setActiveSectionIdx(lastSecIdx >= 0 ? lastSecIdx : 0);
                setActiveSystemIdx(lastSysIdx >= 0 ? lastSysIdx : 0);
                
                setTransposeOffset(0);
                setBpmOverride(0);
                if (!isRehearsalMode) setIsPlayingMetronome(false);

                setLastMidiEvent(`Setlist: Voltou para: ${prevSong.title}`);
                setMidiFeedback(`Setlist: Voltou para: ${prevSong.title}`);
                setTimeout(() => setMidiFeedback(""), 2500);
              }
            }
            return;
          } else {
            const prevSongIndex = (songIndex - 1 + songs.length) % songs.length;
            const prevSong = songs[prevSongIndex];
            setActiveSongId(prevSong.id);
            
            const lastSecIdx = prevSong.sections.length - 1;
            const lastSec = prevSong.sections[lastSecIdx];
            const lastSysIdx = lastSec ? getSystemCount(lastSec) - 1 : 0;
            
            setActiveSectionIdx(lastSecIdx >= 0 ? lastSecIdx : 0);
            setActiveSystemIdx(lastSysIdx >= 0 ? lastSysIdx : 0);
            
            setTransposeOffset(0);
            setBpmOverride(0);
            if (!isRehearsalMode) setIsPlayingMetronome(false);

            setLastMidiEvent(`Voltou para: ${prevSong.title}`);
            setMidiFeedback(`Voltou para: ${prevSong.title}`);
            setTimeout(() => setMidiFeedback(""), 2500);
            return;
          }
        }
      }
    }

    setActiveSectionIdx(newSectionIdx);
    setActiveSystemIdx(newSystemIdx);

    const activeSection = currentSongObj.sections[newSectionIdx];
    if (activeSection) {
      setMidiFeedback(`Compassos ${newSystemIdx * (activeSection.measures.length > 8 ? 8 : 4) + 1} focados`);
      setTimeout(() => setMidiFeedback(""), 1500);
    }

    // Scroll into view
    setTimeout(() => {
      const elementId = `system-${currentSongObj.sections[newSectionIdx]?.id}-${newSystemIdx}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }, [songs, activeSongId, activeSectionIdx, activeSystemIdx, isSetlistMode, setlist]);

  // MIDI Access Setup and listeners
  useEffect(() => {
    try {
      if (typeof navigator === "undefined" || !(navigator as any).requestMIDIAccess) {
        setMidiAccessState("Não suportado");
        return;
      }
    } catch (e) {
      console.warn("MIDI check threw synchronously:", e);
      setMidiAccessState("Bloqueado por segurança");
      return;
    }

    let midiObj: any = null;

    const onMIDIMessage = (message: any) => {
      const [status, data1, data2] = message.data;
      const isNoteOn = (status & 0xF0) === 0x90 && data2 > 0;
      const isCC = (status & 0xF0) === 0xB0;

      let eventDesc = "";
      if (isNoteOn) {
        eventDesc = `Nota MIDI: ${data1} (Vel: ${data2})`;
      } else if (isCC) {
        eventDesc = `CC MIDI: #${data1} (Valor: ${data2})`;
      } else {
        return;
      }

      setLastMidiEvent(`${eventDesc} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);

      // Learn mapping mode
      if (isMappingMode) {
        const mappingType = isNoteOn ? 'note' : 'cc';
        const mappingValue = data1;
        if (isMappingMode === 'next') {
          setMidiMappingNext({ type: mappingType, value: mappingValue });
        } else if (isMappingMode === 'prev') {
          setMidiMappingPrev({ type: mappingType, value: mappingValue });
        }
        setIsMappingMode(null);
        setMidiFeedback("MIDI mapeado com sucesso!");
        setTimeout(() => setMidiFeedback(""), 2000);
        return;
      }

      // Check matches
      const checkMatch = (mapping: { type: 'cc' | 'note'; value: number }) => {
        if (mapping.type === 'note' && isNoteOn && data1 === mapping.value) return true;
        if (mapping.type === 'cc' && isCC && data1 === mapping.value && data2 >= 64) return true;
        return false;
      };

      if (checkMatch(midiMappingNext)) {
        advanceMeasureSet(1);
      } else if (checkMatch(midiMappingPrev)) {
        advanceMeasureSet(-1);
      }
    };

    const setupMIDIInputs = (midi: any) => {
      if (!midi || !midi.inputs) {
        setMidiDevices([]);
        return;
      }
      try {
        const inputs = Array.from(midi.inputs.values());
        const names = inputs.map((input: any) => input.name || "Controlador Genérico");
        setMidiDevices(names);

        inputs.forEach((input: any) => {
          if (input) {
            input.onmidimessage = onMIDIMessage;
          }
        });
      } catch (e) {
        console.warn("Falha ao configurar entradas MIDI:", e);
      }
    };

    try {
      (navigator as any).requestMIDIAccess()
        .then((midi: any) => {
          if (!midi) {
            setMidiAccessState("Acesso recusado");
            return;
          }
          midiObj = midi;
          setMidiAccessState("Conectado");
          setupMIDIInputs(midi);
          
          try {
            midi.onstatechange = () => {
              setupMIDIInputs(midi);
            };
          } catch (e) {
            console.warn("Não foi possível atribuir onstatechange no MIDI", e);
          }
        })
        .catch((err: any) => {
          console.warn("MIDI access failed", err);
          setMidiAccessState("Acesso recusado");
        });
    } catch (e) {
      console.warn("MIDI access threw synchronously", e);
      setMidiAccessState("Acesso recusado / Bloqueado");
    }

    return () => {
      if (midiObj) {
        try {
          if (midiObj.inputs) {
            const inputs = Array.from(midiObj.inputs.values());
            inputs.forEach((input: any) => {
              if (input) {
                input.onmidimessage = null;
              }
            });
          }
        } catch (e) {}
      }
    };
  }, [isMappingMode, midiMappingNext, midiMappingPrev, advanceMeasureSet]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (e.key === ' ') e.preventDefault();
        advanceMeasureSet(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        advanceMeasureSet(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isSetlistMode && setlist.length > 0) {
          const currentInSetlistIdx = setlist.indexOf(activeSongId);
          if (currentInSetlistIdx !== -1) {
            const nextIndex = (currentInSetlistIdx + 1) % setlist.length;
            handleSelectSong(setlist[nextIndex]);
          }
        } else {
          const songIndex = songs.findIndex(s => s.id === activeSongId);
          if (songIndex !== -1) {
            const nextIndex = (songIndex + 1) % songs.length;
            handleSelectSong(songs[nextIndex].id);
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isSetlistMode && setlist.length > 0) {
          const currentInSetlistIdx = setlist.indexOf(activeSongId);
          if (currentInSetlistIdx !== -1) {
            const prevIndex = (currentInSetlistIdx - 1 + setlist.length) % setlist.length;
            handleSelectSong(setlist[prevIndex]);
          }
        } else {
          const songIndex = songs.findIndex(s => s.id === activeSongId);
          if (songIndex !== -1) {
            const prevIndex = (songIndex - 1 + songs.length) % songs.length;
            handleSelectSong(songs[prevIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [songs, activeSongId, advanceMeasureSet, isSetlistMode, setlist]);

  // Drag and Drop simulation for music file imports
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploadedSongFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedSongFile(files[0]);
    }
  };

  // Real processing for various formats like MusicXML, ChordPro, TXT, PDF, and JSON
  const processUploadedSongFile = async (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    setUploadFeedback("Lendo arquivo e processando estrutura...");
    
    try {
      if (fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string);
            if (parsed.title && parsed.sections && Array.isArray(parsed.sections)) {
              const importedSong: Song = {
                ...parsed,
                id: parsed.id || `imported-json-${Date.now()}`,
                currentKey: parsed.currentKey || parsed.originalKey || "C"
              };
              
              setSongs(prev => {
                if (!prev.some(s => s.id === importedSong.id || s.title.toLowerCase() === importedSong.title.toLowerCase())) {
                  return [importedSong, ...prev];
                }
                return prev;
              });
              setActiveSongId(importedSong.id);
              setUploadedFileName(file.name);
              setUploadFeedback(`Música "${importedSong.title}" importada com sucesso do JSON!`);
              setTimeout(() => setUploadFeedback(""), 4000);
            } else {
              setUploadFeedback("Erro: O arquivo JSON não possui o formato de música válido.");
            }
          } catch (e) {
            setUploadFeedback("Erro ao processar JSON: formato inválido.");
          }
        };
        reader.readAsText(file);
        return;
      }
      
      if (fileExtension === "musicxml" || fileExtension === "xml") {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const textContent = event.target?.result as string;
            if (!textContent.includes("<score-partwise") && !textContent.includes("<score-timewise")) {
              setUploadFeedback("Erro: O arquivo não parece ser um MusicXML válido.");
              return;
            }
            const song = parseMusicXML(textContent);
            setSongs(prev => [song, ...prev]);
            setActiveSongId(song.id);
            setUploadedFileName(file.name);
            setUploadFeedback(`Música "${song.title}" importada do MusicXML com sucesso!`);
            setTimeout(() => setUploadFeedback(""), 4000);
          } catch (e) {
            setUploadFeedback("Erro ao processar arquivo MusicXML.");
          }
        };
        reader.readAsText(file);
        return;
      }
      
      if (fileExtension === "pdf") {
        setUploadFeedback("Extraindo texto do PDF (Carregando PDF.js)...");
        try {
          const text = await extractTextFromPdf(file);
          if (!text || text.trim() === "") {
            setUploadFeedback("Erro: Não foi possível extrair texto desse PDF (pode ser escaneado ou protegido).");
            return;
          }
          const song = parseChordSheet(text, file.name);
          setSongs(prev => [song, ...prev]);
          setActiveSongId(song.id);
          setUploadedFileName(file.name);
          setUploadFeedback(`Música "${song.title}" importada e convertida do PDF!`);
          setTimeout(() => setUploadFeedback(""), 4000);
        } catch (err: any) {
          console.error("PDF Extraction error:", err);
          setUploadFeedback(`Erro ao extrair PDF: ${err.message || "arquivo inválido."}`);
        }
        return;
      }
      
      // Default: parse as ChordPro / Text chord sheet
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const song = parseChordSheet(text, file.name);
          setSongs(prev => [song, ...prev]);
          setActiveSongId(song.id);
          setUploadedFileName(file.name);
          setUploadFeedback(`Cifra de "${song.title}" importada e mapeada em compassos!`);
          setTimeout(() => setUploadFeedback(""), 4000);
        } catch (e) {
          setUploadFeedback("Erro ao processar arquivo de cifra.");
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setUploadFeedback("Erro ao processar o upload do arquivo.");
    }
  };

  const handleSaveQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const createSongFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const customSong: Song = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      artist: newArtist || "Artista Desconhecido",
      originalKey: newKey,
      currentKey: newKey,
      bpm: Number(newBpm) || 80,
      timeSignature: "4/4",
      duration: "3:30",
      notes: "Formatada com sistema padrão de visualização.",
      sections: [
        {
          id: `custom-in-${Date.now()}`,
          name: "IN",
          color: "bg-zinc-700 text-white",
          dynamics: "Início suave do arranjo",
          measures: [
            { id: `cm1-${Date.now()}`, chords: [newKey], beats: 4 },
            { id: `cm2-${Date.now()}`, chords: ["%"], beats: 4 },
            { id: `cm3-${Date.now()}`, chords: ["AM"], beats: 4 },
            { id: `cm4-${Date.now()}`, chords: ["BM"], beats: 4 },
          ]
        },
        {
          id: `custom-v-${Date.now()}`,
          name: "V",
          color: "bg-emerald-600 text-white",
          dynamics: "Primeira estrofe",
          measures: [
            { id: `cm5-${Date.now()}`, chords: [newKey], beats: 4 },
            { id: `cm6-${Date.now()}`, chords: ["%"], beats: 4 },
            { id: `cm7-${Date.now()}`, chords: ["AM"], beats: 4 },
            { id: `cm8-${Date.now()}`, chords: ["BM"], beats: 4 },
          ]
        }
      ]
    };

    setSongs([customSong, ...songs]);
    setActiveSongId(customSong.id);
    setNewTitle("");
    setNewArtist("");
    setShowAddSongModal(false);
  };

  return (
    <div id="liveset-facsimile-root" className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      
      {/* GLOBAL BANNER / PROMPT */}
      <header id="stage-banner" className="bg-amber-500 text-zinc-950 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-600 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-amber-500 font-black italic rounded-lg text-lg">SS</div>
          <div>
            <span className="font-display font-black uppercase text-sm tracking-widest block">Stage Set</span>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-xs font-medium text-zinc-900 leading-none">Partitura funcional compasso a compasso baseada na sua referência.</p>
              <span className="inline-flex items-center gap-1 bg-black/15 text-zinc-900 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                <CheckCircle className="w-3 h-3 text-emerald-800" /> Salvo Auto
              </span>
            </div>
          </div>
        </div>
        
        {/* VIEW THEME SWITCHER */}
        <div className="flex items-center gap-2 bg-black/10 p-1 rounded-lg">
          <button 
            onClick={() => setScoreTheme("paper")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${scoreTheme === "paper" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-900 hover:text-white"}`}
          >
            <Eye className="w-3.5 h-3.5" /> Estilo Folha (Light)
          </button>
          <button 
            onClick={() => setScoreTheme("stage")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${scoreTheme === "stage" ? "bg-zinc-900 text-amber-500 shadow-sm" : "text-zinc-900 hover:text-white"}`}
          >
            <Sparkle className="w-3.5 h-3.5" /> Palco Escuro (Dark)
          </button>
        </div>
      </header>

      {/* COMPANION LAYOUT */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDE CONTROLS COLUMN (Setlist, transposer, imports) */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          
          {/* SONG REPERTOIRE LIST */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-1 border-b border-zinc-800">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-amber-500" />
                Playlists / Setlist
              </span>
              <button 
                id="btn-add-song" 
                onClick={() => setShowAddSongModal(true)}
                className="p-1.5 text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Cadastrar música"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs for Repertoire vs Setlist */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
              <button
                type="button"
                onClick={() => setActiveTab("repertoire")}
                className={`py-1.5 px-2 rounded-md text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "repertoire"
                    ? "bg-[#121214] border border-zinc-800 text-amber-500 shadow-sm font-extrabold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Music className="w-3.5 h-3.5" /> Repertório
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("setlist")}
                className={`py-1.5 px-2 rounded-md text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "setlist"
                    ? "bg-[#121214] border border-zinc-800 text-amber-500 shadow-sm font-extrabold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Setlist ({setlist.length})
              </button>
            </div>

            {activeTab === "repertoire" ? (
              <div className="flex flex-col gap-1.5 max-h-[290px] overflow-y-auto">
                {songs.map((song, idx) => {
                  const isSelected = song.id === activeSongId;
                  const isInSetlist = setlist.includes(song.id);
                  return (
                    <div 
                      key={song.id}
                      onClick={() => handleSelectSong(song.id)}
                      className={`group/song w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold" 
                          : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900 text-zinc-300"
                      }`}
                    >
                      <div className="truncate pr-2 flex-1">
                        <span className="font-mono text-[9px] text-zinc-650 block">0{idx + 1}</span>
                        <p className="text-sm truncate font-medium">{song.title}</p>
                        <span className="text-xs text-zinc-500 font-normal">{song.artist}</span>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-end shrink-0 font-mono text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded ${isSelected ? "bg-amber-500/20 text-amber-400 font-black" : "bg-zinc-900 text-zinc-400"}`}>
                            {song.currentKey}
                          </span>
                          <span className="text-zinc-600 mt-1">{song.bpm} BPM</span>
                        </div>
                        
                        {/* Quick toggle in setlist */}
                        <button
                          type="button"
                          onClick={(e) => toggleSongInSetlist(song.id, e)}
                          className={`p-1.5 rounded transition-all cursor-pointer shrink-0 border ${
                            isInSetlist
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-500"
                          }`}
                          title={isInSetlist ? "Remover da Setlist" : "Adicionar à Setlist"}
                        >
                          {isInSetlist ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover/song:text-amber-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Setlist Mode Toggle Switch */}
                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-900">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isSetlistMode ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
                      Modo Setlist
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">Avanço automático linear</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSetlistMode(!isSetlistMode);
                      if (!isSetlistMode && setlist.length > 0 && !setlist.includes(activeSongId)) {
                        handleSelectSong(setlist[0]);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isSetlistMode ? 'bg-emerald-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isSetlistMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {setlist.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-xs flex flex-col items-center gap-2 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
                      <Layers className="w-6 h-6 text-zinc-700 animate-pulse" />
                      <span>Sua setlist está vazia</span>
                      <button
                        onClick={handleAddAllToSetlist}
                        className="mt-1 text-[10px] text-amber-500 hover:underline font-mono"
                      >
                        + Adicionar todas as músicas
                      </button>
                    </div>
                  ) : (
                    setlist.map((songId, idx) => {
                      const song = songs.find(s => s.id === songId);
                      if (!song) return null;
                      const isSelected = song.id === activeSongId;
                      return (
                        <div 
                          key={`${songId}-${idx}`}
                          onClick={() => handleSelectSong(song.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold" 
                              : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          <div className="truncate pr-2 flex-1">
                            <span className="font-mono text-[9px] text-zinc-600 block">Set {idx + 1}</span>
                            <p className="text-xs truncate font-semibold">{song.title}</p>
                            <span className="text-[10px] text-zinc-500 font-normal block truncate">{song.artist}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                            <div className="flex flex-col items-end font-mono text-[9px] mr-1">
                              <span className="text-zinc-400 font-bold">{song.currentKey}</span>
                              <span className="text-zinc-600 mt-0.5">{song.bpm} BPM</span>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSetlistItem(idx, -1)}
                                className="p-0.5 hover:bg-zinc-850 rounded disabled:opacity-20 text-zinc-400 hover:text-white cursor-pointer"
                                title="Mover para cima"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === setlist.length - 1}
                                onClick={() => moveSetlistItem(idx, 1)}
                                className="p-0.5 hover:bg-zinc-850 rounded disabled:opacity-20 text-zinc-400 hover:text-white cursor-pointer"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={(e) => removeSetlistItem(idx, e)}
                              className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded text-zinc-500 transition-colors cursor-pointer"
                              title="Remover da Setlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {setlist.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-900 mt-1">
                    <button
                      type="button"
                      onClick={handleShuffleSetlist}
                      className="py-1 px-1 bg-zinc-950 border border-zinc-850 text-[9px] font-mono text-zinc-400 rounded hover:bg-zinc-900 hover:text-white cursor-pointer flex items-center justify-center gap-1"
                      title="Embaralhar ordem da Setlist"
                    >
                      <Shuffle className="w-2.5 h-2.5" /> Shuf
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAllToSetlist}
                      className="py-1 px-1 bg-zinc-950 border border-zinc-850 text-[9px] font-mono text-zinc-400 rounded hover:bg-zinc-900 hover:text-white cursor-pointer flex items-center justify-center gap-1"
                      title="Adicionar todas as músicas"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add Tod.
                    </button>
                    <button
                      type="button"
                      onClick={handleClearSetlist}
                      className="py-1 px-1 bg-red-950/20 border border-red-900/30 text-[9px] font-mono text-red-400 rounded hover:bg-red-900/20 cursor-pointer flex items-center justify-center gap-1"
                      title="Zerar Setlist"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Limp
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DYNAMIC TRANSPOSER (Changes sheet music on the fly!) */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 flex items-center gap-1.5 pb-2 border-b border-zinc-800">
              <ArrowRightLeft className="w-4 h-4 text-amber-500" />
              Transposição de Tons
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <button 
                onClick={() => changeTranspose(transposeOffset - 2)} 
                className="py-1 px-1 bg-zinc-950 border border-zinc-850 text-xs font-mono rounded hover:bg-zinc-800 cursor-pointer"
              >
                -2 sem
              </button>
              <button 
                onClick={() => changeTranspose(transposeOffset - 1)} 
                className="py-1 px-1 bg-zinc-950 border border-zinc-850 text-xs font-mono rounded hover:bg-zinc-800 cursor-pointer"
              >
                -1 sem
              </button>
              <button 
                onClick={() => changeTranspose(0)} 
                className={`py-1 px-1 border text-xs font-mono rounded cursor-pointer ${transposeOffset === 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-zinc-950 border-zinc-850 hover:bg-zinc-800"}`}
              >
                Original
              </button>
              <button 
                onClick={() => changeTranspose(transposeOffset + 1)} 
                className="py-1 px-1 bg-zinc-950 border border-zinc-850 text-xs font-mono rounded hover:bg-zinc-800 cursor-pointer"
              >
                +1 sem
              </button>
            </div>
            
            <div className="flex items-center justify-between text-xs font-mono p-2 bg-zinc-950 rounded border border-zinc-850">
              <span className="text-zinc-500">Transf. Ativa:</span>
              <span className="font-bold text-amber-400">
                {transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset} semitom(ns)
              </span>
            </div>
          </div>

          {/* METRÔNOMO INTEGRADO PANEL */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 text-amber-500 ${isPlayingMetronome ? "animate-pulse" : ""}`} />
                Metrônomo Integrado
              </span>
              <span className={`w-2 h-2 rounded-full ${isPlayingMetronome ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"}`} />
            </span>

            {/* Tempo (BPM) Display */}
            <div className="flex flex-col gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Andamento</span>
                  <span className="text-xl font-mono font-black text-amber-400 flex items-baseline gap-1">
                    {currentBpm} <span className="text-[10px] text-zinc-500 font-sans font-normal">BPM</span>
                  </span>
                </div>
                
                {/* Tap Tempo Button */}
                <button
                  type="button"
                  onClick={handleTapTempo}
                  className="py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-mono font-bold text-amber-500 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  title="Toque repetidamente no ritmo para definir o andamento"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  TAP TEMPO
                </button>
              </div>

              {/* Range Slider for BPM */}
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="range"
                  min={40}
                  max={240}
                  value={currentBpm}
                  onChange={(e) => setBpmOverride(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Precision BPM Increments */}
              <div className="grid grid-cols-4 gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setBpmOverride(Math.max(40, currentBpm - 5))}
                  className="py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 hover:text-white rounded border border-zinc-850 cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setBpmOverride(Math.max(40, currentBpm - 1))}
                  className="py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 hover:text-white rounded border border-zinc-850 cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setBpmOverride(Math.min(240, currentBpm + 1))}
                  className="py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 hover:text-white rounded border border-zinc-850 cursor-pointer"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setBpmOverride(Math.min(240, currentBpm + 5))}
                  className="py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 hover:text-white rounded border border-zinc-850 cursor-pointer"
                >
                  +5
                </button>
              </div>

              {/* Sync with Song Button if Override Active */}
              {bpmOverride !== 0 && bpmOverride !== activeSong.bpm && (
                <button
                  type="button"
                  onClick={() => setBpmOverride(0)}
                  className="mt-1.5 py-1 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-[9px] font-mono text-amber-400 rounded-md border border-amber-500/20 text-center transition-colors cursor-pointer w-full"
                >
                  Sincronizar com Música ({activeSong.bpm} BPM)
                </button>
              )}
            </div>

            {/* Time Signature / Compass Section */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Compasso / Beats</span>
              <div className="grid grid-cols-4 gap-1">
                {[2, 3, 4, 6].map((num) => {
                  const label = num === 6 ? "6/8" : `${num}/4`;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMetronomeBeats(num)}
                      className={`py-1 text-xs font-mono rounded cursor-pointer transition-colors border ${
                        metronomeBeats === num
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                          : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Custom beat numerator selector */}
              <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded border border-zinc-900 mt-1">
                <span className="text-[9px] text-zinc-500 font-mono">Outros compassos:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMetronomeBeats(prev => Math.max(1, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 rounded cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-zinc-300 w-6 text-center">{metronomeBeats}</span>
                  <button
                    type="button"
                    onClick={() => setMetronomeBeats(prev => Math.min(12, prev + 1))}
                    className="w-5 h-5 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 rounded cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* LED Beat Visualizer dots */}
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 flex flex-col gap-2">
              <div className="flex justify-center items-center gap-2.5 py-1">
                {Array.from({ length: metronomeBeats }).map((_, i) => {
                  const beatNum = i + 1;
                  const isActive = currentBeat === beatNum && isPlayingMetronome;
                  const isAccent = beatNum === 1;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-100 border ${
                          isActive 
                            ? isAccent 
                              ? "bg-emerald-500 text-black border-emerald-400 scale-110 shadow-lg shadow-emerald-500/50" 
                              : "bg-amber-500 text-black border-amber-400 scale-110 shadow-lg shadow-amber-500/50"
                            : isAccent 
                              ? "bg-zinc-900/50 text-emerald-500/70 border-emerald-950" 
                              : "bg-zinc-950 text-zinc-650 border-zinc-900"
                        }`}
                      >
                        {beatNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continuous sweeping line visualizer */}
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                <div 
                  className={`absolute top-0 bottom-0 w-1/4 rounded-full transition-all duration-75 ease-out shadow-lg ${
                    isPlayingMetronome 
                      ? currentBeat === 1 
                        ? "bg-emerald-500 shadow-emerald-500/40" 
                        : "bg-amber-500 shadow-amber-500/40" 
                      : "bg-zinc-800"
                  }`}
                  style={{
                    left: isPlayingMetronome 
                      ? `${((currentBeat - 1) / metronomeBeats) * 100}%` 
                      : "0%"
                  }}
                />
              </div>
            </div>

            {/* Rehearsal Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-900 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  Modo Ensaio (Rehearsal)
                </span>
                <span className="text-[9px] text-zinc-500 leading-tight">
                  Mantém o metrônomo ativo e ajusta o BPM automaticamente ao pular de música.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRehearsalMode(!isRehearsalMode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isRehearsalMode ? "bg-amber-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                    isRehearsalMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Play / Stop Master Button */}
            <button
              type="button"
              onClick={() => setIsPlayingMetronome(!isPlayingMetronome)}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isPlayingMetronome 
                  ? "bg-red-500 hover:bg-red-650 text-white animate-pulse" 
                  : "bg-amber-500 hover:bg-amber-600 text-black"
              }`}
            >
              {isPlayingMetronome ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> PARAR METRÔNOMO
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> INICIAR METRÔNOMO
                </>
              )}
            </button>
          </div>

          {/* FOOTER NOTES CONTROL PANEL (Observações de Rodapé) */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 flex items-center gap-1.5 pb-2 border-b border-zinc-800">
              <FileText className="w-4 h-4 text-amber-500" />
              Observações de Fim de Página
            </span>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="footer-notes-textarea" className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                Texto do Rodapé
              </label>
              <textarea
                id="footer-notes-textarea"
                rows={2}
                value={baseSong.footerNotes || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSongs(prevSongs => prevSongs.map(song => {
                    if (song.id === activeSongId) {
                      return {
                        ...song,
                        footerNotes: val
                      };
                    }
                    return song;
                  }));
                }}
                placeholder="Ex: * Afinamento em Eb. Solo de guitarra entra no compasso 9..."
                className="w-full text-xs bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-650 resize-none"
              />
              <span className="text-[9px] text-zinc-500 leading-normal font-sans">
                💡 Nota: Exibido apenas na parte inferior da partitura quando impressa ou exportada em PDF.
              </span>
            </div>
          </div>

          {/* HANDS-FREE KEYBOARD & MIDI SHORTCUTS PANEL */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Mãos Livres (Atalhos & MIDI)
              </span>
              <span className={`w-2 h-2 rounded-full ${midiAccessState === "Conectado" ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
            </span>

            {/* Status indicators */}
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-850">
                <span className="text-zinc-500">Web MIDI:</span>
                <span className={`font-bold ${midiAccessState === "Conectado" ? "text-emerald-400" : "text-amber-500"}`}>
                  {midiAccessState}
                </span>
              </div>
              
              {midiDevices.length > 0 ? (
                <div className="flex flex-col gap-1 bg-zinc-950/55 p-2 rounded border border-zinc-900">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Dispositivos Ativos:</span>
                  {midiDevices.map((dev, i) => (
                    <span key={i} className="text-zinc-300 truncate font-semibold" title={dev}>
                      🎹 {dev}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-600 italic px-1">
                  Nenhum dispositivo MIDI conectado.
                </div>
              )}
            </div>

            {/* Mappings */}
            <div className="flex flex-col gap-2.5 mt-1">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Mapeamento de Pedal / Teclas
              </div>

              {/* Next mapping row */}
              <div className="flex flex-col gap-1 bg-zinc-950/80 p-2.5 rounded border border-zinc-850">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Avançar Grade/Música:</span>
                  <button
                    type="button"
                    onClick={() => setIsMappingMode(isMappingMode === 'next' ? null : 'next')}
                    className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold cursor-pointer transition-colors ${
                      isMappingMode === 'next' 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800"
                    }`}
                  >
                    {isMappingMode === 'next' ? "Pressione Pedal/Tecla..." : "Mapear"}
                  </button>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Teclado: <kbd className="bg-zinc-900 text-zinc-300 px-1 rounded">Espaço</kbd>, <kbd className="bg-zinc-900 text-zinc-300 px-1 rounded">→</kbd></span>
                  <span>MIDI: <span className="text-amber-500 font-bold">{midiMappingNext.type.toUpperCase()} {midiMappingNext.value}</span></span>
                </div>
              </div>

              {/* Prev mapping row */}
              <div className="flex flex-col gap-1 bg-zinc-950/80 p-2.5 rounded border border-zinc-850">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Voltar Grade/Música:</span>
                  <button
                    type="button"
                    onClick={() => setIsMappingMode(isMappingMode === 'prev' ? null : 'prev')}
                    className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold cursor-pointer transition-colors ${
                      isMappingMode === 'prev' 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800"
                    }`}
                  >
                    {isMappingMode === 'prev' ? "Pressione Pedal/Tecla..." : "Mapear"}
                  </button>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Teclado: <kbd className="bg-zinc-900 text-zinc-300 px-1 rounded">PgUp</kbd>, <kbd className="bg-zinc-900 text-zinc-300 px-1 rounded">←</kbd></span>
                  <span>MIDI: <span className="text-amber-500 font-bold">{midiMappingPrev.type.toUpperCase()} {midiMappingPrev.value}</span></span>
                </div>
              </div>
            </div>

            {/* Simulated Footswitch / Pedal for testing without hardware */}
            <div className="flex flex-col gap-1.5 mt-1 bg-zinc-950/40 p-2 rounded border border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Simular Pedal Footswitch</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => advanceMeasureSet(-1)}
                  className="py-1 px-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-[10px] font-mono font-bold text-zinc-400 rounded cursor-pointer"
                >
                  ◀ Voltar
                </button>
                <button
                  type="button"
                  onClick={() => advanceMeasureSet(1)}
                  className="py-1 px-2 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/25 text-[10px] font-mono font-bold text-amber-400 rounded cursor-pointer"
                >
                  Avançar ▶
                </button>
              </div>
            </div>

            {/* Last event and visual feedback */}
            <div className="flex flex-col gap-1 font-mono text-[9px] text-zinc-500 mt-1 p-2 bg-[#0A0A0B] rounded border border-zinc-900">
              <div className="text-[8px] text-zinc-650 uppercase font-bold">Último Sinal Captado:</div>
              <div className="text-zinc-400 truncate font-semibold">
                {lastMidiEvent}
              </div>
              {midiFeedback && (
                <div className="text-amber-500 font-black animate-pulse mt-0.5">
                  ⚡ {midiFeedback}
                </div>
              )}
            </div>
          </div>

          {/* FILE EXPORT / DROPN AND DRAG FOR MUSIC FILE IMPORT */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 flex items-center gap-1.5 pb-2 border-b border-zinc-800">
              <Upload className="w-4 h-4 text-amber-500" />
              Upload da Cifra / Guia
            </span>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 text-zinc-400"}`}
            >
              <input 
                id="aside-file-upload"
                type="file"
                className="hidden"
                accept=".txt,.json,.pdf,.chordpro,.cho,.crd,.musicxml,.xml"
                onChange={handleFileSelect}
              />
              <label htmlFor="aside-file-upload" className="cursor-pointer block">
                <FileText className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-zinc-200 block hover:text-amber-500 transition-colors">
                  Arraste seu arquivo aqui
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1 leading-relaxed">
                  ou clique para selecionar<br />
                  <span className="font-mono text-[9px] text-zinc-600 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900">.musicxml</span>
                  <span className="font-mono text-[9px] text-zinc-600 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900 ml-1">.pdf</span>
                  <span className="font-mono text-[9px] text-zinc-600 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900 ml-1">.chordpro</span>
                  <span className="font-mono text-[9px] text-zinc-600 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900 ml-1">.txt</span>
                </span>
              </label>
            </div>

            {uploadFeedback && (
              <div className="p-2.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                {uploadFeedback}
              </div>
            )}

            {uploadedFileName && (
              <div className="text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-850 flex flex-col gap-1">
                <div className="flex justify-between font-bold text-zinc-300">
                  <span className="truncate pr-2">{uploadedFileName}</span>
                  <span className="text-amber-500 shrink-0 font-mono text-[9px]">ATIVO</span>
                </div>
                <button 
                  onClick={() => {
                    setUploadedFileName("");
                    setSongs(INITIAL_SONGS);
                    setActiveSongId("angels");
                  }} 
                  className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 self-end mt-1.5"
                >
                  <Trash2 className="w-3 h-3" /> Restaurar padrão
                </button>
              </div>
            )}
          </div>
          
        </aside>

        {/* CORE WORKSPACE COLUMN (THE MUSIC SHEET SHEETPLATE FACSIMILE) */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          
          {/* QUICK PERFORMANCE CONTROLS BAR */}
          <section className="quick-performance-controls-bar bg-[#121214] border border-zinc-850 rounded-xl px-5 py-3.5 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold tracking-widest">Sincronizador Metrônomo:</span>
              <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-850">
                <div className="flex gap-1.5 font-mono text-[11px] text-zinc-500">
                  <span className={currentBeat === 1 && isPlayingMetronome ? "text-amber-500 font-black scale-110" : ""}>1</span>
                  <span className={currentBeat === 2 && isPlayingMetronome ? "text-zinc-300 font-bold" : ""}>2</span>
                  <span className={currentBeat === 3 && isPlayingMetronome ? "text-zinc-300 font-bold" : ""}>3</span>
                  <span className={currentBeat === 4 && isPlayingMetronome ? "text-zinc-300 font-bold" : ""}>4</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-zinc-700 block" style={{ opacity: isPlayingMetronome ? 1 : 0.3 }} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-zinc-300">{currentBpm} BPM</span>
              <button 
                onClick={() => setIsPlayingMetronome(!isPlayingMetronome)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isPlayingMetronome ? "bg-red-500 hover:bg-red-650 text-white" : "bg-amber-500 hover:bg-amber-600 text-black font-black"}`}
              >
                {isPlayingMetronome ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Parar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Ativar Metrônomo
                  </>
                )}
              </button>
            </div>
          </section>

          {/* FACSIMILE SCORE SHEETPLATE */}
          <section 
            id="facsimile-sheetplate" 
            className={`rounded-2xl shadow-xl p-6 lg:p-10 border transition-all duration-300 flex flex-col gap-8 relative overflow-hidden ${
              scoreTheme === "paper" 
                ? "bg-white text-[#111112] border-zinc-300 shadow-zinc-450/30" 
                : "bg-[#0A0A0B] text-zinc-100 border-zinc-800 shadow-black/80"
            }`}
          >
            {/* Header section with robbie williams styling */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] font-mono uppercase font-bold px-3 py-1 rounded ${scoreTheme === "paper" ? "bg-zinc-100 text-zinc-800 border border-zinc-300" : "bg-zinc-900 text-amber-500 border border-zinc-800"}`}>
                    ♩ = {currentBpm}
                  </span>
                  {activeSong.timeSignature && (
                    <span className="text-xs font-serif italic text-zinc-400">Compasso: {activeSong.timeSignature}</span>
                  )}
                </div>
                {isSetlistMode && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-1.5">
                    <Layers className="w-3 h-3 animate-pulse" />
                    Setlist: {setlist.indexOf(activeSongId) + 1} de {setlist.length}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-sans tracking-tight font-black uppercase mt-1">
                  {activeSong.title}
                </h1>
                <p className={`text-base font-medium italic ${scoreTheme === "paper" ? "text-zinc-650" : "text-zinc-400"}`}>
                  {activeSong.artist}
                </p>
                <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border no-print ${
                  scoreTheme === "paper"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Clique em qualquer acorde para editar
                </div>
              </div>

              {/* Original VS Transposed display */}
              <div className="text-left md:text-right mt-3 md:mt-0 font-sans flex flex-col items-start md:items-end gap-1.5">
                <div className={`text-2xl font-black ${scoreTheme === "paper" ? "text-black" : "text-amber-500"}`}>
                  Tom: {activeSong.currentKey}
                </div>
                {transposeOffset !== 0 && (
                  <div className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider">
                    Tom original: {activeSong.originalKey} (desv. {transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset})
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1 no-print">
                  <button
                    onClick={() => {
                      if (activeSong.sections.length > 0) {
                        const firstSection = activeSong.sections[0];
                        setSelectedSectionIdForNote(firstSection.id);
                        if (firstSection.measures.length > 0) {
                          setSelectedMeasureIdForNote(firstSection.measures[0].id);
                        }
                      }
                      setShowAddNoteModal(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                      scoreTheme === "paper"
                        ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-350"
                        : "bg-zinc-900 hover:bg-zinc-800 text-amber-500 border-zinc-800"
                    }`}
                    title="Adicionar anotação de performance a um compasso específico"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Adicionar Nota
                  </button>

                  <button
                    onClick={() => {
                      try {
                        window.print();
                      } catch (err) {
                        console.error("Print blocked by iframe security:", err);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                      scoreTheme === "paper"
                        ? "bg-zinc-800 hover:bg-zinc-900 text-white border-zinc-700"
                        : "bg-amber-500 hover:bg-amber-600 text-black border-amber-500"
                    }`}
                    title="Exportar partitura para PDF ou Imprimir (Recomenda-se abrir em nova aba)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Exportar PDF
                  </button>
                </div>
              </div>
            </div>

            {/* SHEET CONTENT AREA - THE SYSTEMS */}
            <div className="flex flex-col gap-10">
              {activeSong.sections.map((section) => {
                
                // Let's split a section's measures into chunks of 4 (systems) exactly like the PDF!
                // For PC or C we might have 4 or 8 measures per line.
                // Let's chunk the measures.
                const systemChords: Measure[][] = [];
                const chunkSize = section.measures.length > 8 ? 8 : 4; 
                for (let i = 0; i < section.measures.length; i += chunkSize) {
                  systemChords.push(section.measures.slice(i, i + chunkSize));
                }

                const isSectionMatched = activeVoiceCommand !== "none" && (
                  section.name === activeVoiceCommand ||
                  (activeVoiceCommand === "REFRÃO" && section.name === "C") ||
                  (activeVoiceCommand === "INTRO" && section.name === "IN") ||
                  (activeVoiceCommand === "PC" && section.name === "PC") ||
                  (activeVoiceCommand === "V" && section.name === "V") ||
                  (activeVoiceCommand === "B" && section.name === "B")
                );

                return (
                  <div 
                    key={section.id} 
                    className={`relative flex flex-col gap-2 p-2 rounded-xl transition-all duration-300 ${
                      isSectionMatched 
                        ? "voice-command-flash bg-amber-500/5 ring-2 ring-amber-500/60 scale-[1.01]" 
                        : ""
                    }`}
                  >
                    
                    {/* Section Identifier Badge - Placed Left / Top Left exactly as the PDF */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Styled block badge corresponding to IN, V, PC, C, B */}
                        <div className={`w-9 h-7 rounded font-sans font-black flex items-center justify-center text-xs tracking-wider border-2 ${section.color}`}>
                          {section.name}
                        </div>
                        {section.dynamics && (
                          <span className={`text-xs italic font-medium font-serif ${scoreTheme === "paper" ? "text-zinc-650" : "text-amber-400/90"}`}>
                            {section.dynamics}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                        {section.measures.length} comp.
                      </span>
                    </div>

                    {/* Rendering the sheet staves / systems layout with clean bar separation */}
                    <div className="flex flex-col gap-4 mt-1">
                      {systemChords.map((systemLine, systemIdx) => {
                        const sectionIdx = activeSong.sections.indexOf(section);
                        const isThisSystemActive = sectionIdx === activeSectionIdx && systemIdx === activeSystemIdx;

                        return (
                          <div 
                            key={systemIdx} 
                            id={`system-${section.id}-${systemIdx}`}
                            className={`flex items-center w-full relative group transition-all duration-300 rounded-lg p-0.5 ${
                              isThisSystemActive 
                                ? "ring-2 ring-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10 scale-[1.01] z-20" 
                                : ""
                            }`}
                          >
                            {/* SYSTEM STAFF PLATE */}
                            {/* Left Heavy Double Bar indicator */}
                            <div className={`w-[6px] h-20 rounded-l ${
                              isThisSystemActive 
                                ? "border-l-4 border-r-2 border-amber-500 bg-amber-500" 
                                : (scoreTheme === "paper" ? "border-l-4 border-r-2 border-black" : "border-l-4 border-r-2 border-zinc-350")
                            }`} />

                          {/* SYSTEM MEASURE BLOCKS */}
                          <div className="grid grid-cols-2 md:grid-flow-col auto-cols-fr grow">
                            {systemLine.map((measure, measureIdx) => {
                              
                              // Check if metronome beat is pacing this measure for performance guidance
                              const isThisFirstMeasure = systemIdx === 0 && measureIdx === 0;

                              const isChordMatched = activeVoiceCommand !== "none" && measure.chords.some(chord => {
                                const cleanChord = chord.toUpperCase().replace(/[M7]/g, "").trim();
                                const cleanCmd = activeVoiceCommand.toUpperCase().replace(/[M7]/g, "").trim();
                                return cleanChord === cleanCmd && cleanChord !== "" && cleanChord !== "%";
                              });

                              return (
                                <div 
                                  key={measure.id} 
                                  className={`group/measure h-20 flex flex-col justify-center items-center relative border-r px-2 py-1 transition-all ${
                                    scoreTheme === "paper" 
                                      ? "border-zinc-350 hover:bg-zinc-50" 
                                      : "border-zinc-800 hover:bg-zinc-900/30"
                                  } ${
                                    isPlayingMetronome && currentBeat === 1 && isThisFirstMeasure 
                                      ? (scoreTheme === "paper" ? "bg-amber-100/40" : "bg-amber-500/5") 
                                      : ""
                                  } ${
                                    isChordMatched 
                                      ? "voice-command-flash bg-amber-500/10 ring-2 ring-amber-500/50 scale-105 z-10 rounded-md" 
                                      : ""
                                  }`}
                                >
                                  {/* Performance Notes Tags */}
                                  {measure.performanceNotes && measure.performanceNotes.length > 0 && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-wrap gap-1 z-30 max-w-[95%] justify-center pointer-events-auto">
                                      {measure.performanceNotes.map((note, noteIdx) => (
                                        <div 
                                          key={noteIdx}
                                          className="group/note flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-sans font-extrabold bg-amber-500 hover:bg-amber-400 text-black rounded-full shadow-sm border border-amber-400 whitespace-nowrap animate-fade-in"
                                        >
                                          <StickyNote className="w-2 h-2 shrink-0 text-black" />
                                          <span className="max-w-[80px] truncate select-all">{note}</span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemovePerformanceNote(section.id, measure.id, noteIdx);
                                            }}
                                            className="ml-0.5 text-[10px] text-black hover:text-red-700 font-black cursor-pointer leading-none"
                                            title="Remover nota"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Quick Inline Add Note Trigger on Hover */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSectionIdForNote(section.id);
                                      setSelectedMeasureIdForNote(measure.id);
                                      setNewPerformanceNoteText("");
                                      setShowAddNoteModal(true);
                                    }}
                                    className="absolute bottom-1 right-1 px-1 py-0.5 rounded opacity-0 group-hover/measure:opacity-100 transition-opacity bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-amber-500 cursor-pointer text-[8px] font-sans font-bold flex items-center gap-0.5 z-20"
                                    title="Adicionar Nota de Performance a este compasso"
                                  >
                                    <Plus className="w-2 h-2 text-amber-500" />
                                    <span>Nota</span>
                                  </button>

                                  {/* Compass minimal index badge (subtle background help) */}
                                  <span className={`absolute top-1 left-2 text-[9px] font-mono scale-90 ${scoreTheme === "paper" ? "text-zinc-400" : "text-zinc-600"}`}>
                                    {systemIdx * chunkSize + measureIdx + 1}
                                  </span>

                                  {/* Beat dots guide indicator */}
                                  {isThisFirstMeasure && isPlayingMetronome && (
                                    <div className="absolute top-1 right-2 flex gap-1">
                                      {Array.from({ length: measure.beats }).map((_, beatIdx) => (
                                        <div 
                                          key={beatIdx} 
                                          className={`w-[4px] h-[4px] rounded-full ${
                                            currentBeat === beatIdx + 1 ? "bg-amber-500 scale-125 shadow-sm" : "bg-zinc-400/40"
                                          }`} 
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {/* CHORDS CONTEXT DISPLAY (Render Robbie Williams' Angels chord split) */}
                                  <div className="flex items-center justify-center gap-1.5 w-full grow select-none">
                                    {measure.chords.map((chord, chordIdx) => {
                                      const isEditingThisChord = editingChord &&
                                        editingChord.sectionId === section.id &&
                                        editingChord.measureId === measure.id &&
                                        editingChord.chordIdx === chordIdx;

                                      const isRepeatMark = chord === "%";

                                      if (isEditingThisChord) {
                                        const suggestions = getChordSuggestions(editingChordText);
                                        return (
                                          <div key={chordIdx} className="flex items-center px-1 z-40 relative">
                                            {/* SUGGESTION POPUP */}
                                            <div 
                                              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-950 text-zinc-100 border border-amber-500/50 rounded-xl p-2.5 shadow-2xl flex flex-col gap-1.5 min-w-[210px] max-w-[240px] z-50 animate-fade-in no-print"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-sans tracking-wider font-extrabold text-amber-500 border-b border-zinc-850 pb-1 mb-1 text-center select-none">
                                                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                                                <span>Substituição Inteligente</span>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 gap-1 select-none">
                                                {suggestions.map((suggestion, idx) => (
                                                  <button
                                                    key={idx}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                      e.preventDefault(); // crucial to prevent input blur before onClick
                                                      handleUpdateChord(section.id, measure.id, chordIdx, suggestion);
                                                      setEditingChord(null);
                                                    }}
                                                    className="px-1.5 py-1 text-xs font-black rounded border border-zinc-800 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors bg-zinc-900 cursor-pointer text-center truncate"
                                                    title={`Substituir por ${suggestion}`}
                                                  >
                                                    {suggestion}
                                                  </button>
                                                ))}
                                              </div>
                                              
                                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-zinc-950" />
                                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-amber-500/50 -z-10 mt-[1px]" />
                                            </div>

                                            <input
                                              type="text"
                                              value={editingChordText}
                                              onChange={(e) => setEditingChordText(e.target.value)}
                                              onBlur={() => {
                                                handleUpdateChord(section.id, measure.id, chordIdx, editingChordText);
                                                setEditingChord(null);
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleUpdateChord(section.id, measure.id, chordIdx, editingChordText);
                                                  setEditingChord(null);
                                                } else if (e.key === "Escape") {
                                                  setEditingChord(null);
                                                }
                                              }}
                                              className="w-20 h-9 text-center text-xl font-black bg-amber-500 text-black border-2 border-amber-600 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-amber-900 font-marker animate-pulse"
                                              autoFocus
                                              placeholder="C"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        );
                                      }

                                      return (
                                        <div 
                                          key={chordIdx} 
                                          className="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 hover:bg-amber-500/10 hover:scale-110 active:scale-95"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingChord({
                                              sectionId: section.id,
                                              measureId: measure.id,
                                              chordIdx
                                            });
                                            setEditingChordText(chord);
                                          }}
                                          title="Clique para editar este acorde"
                                        >
                                          {isRepeatMark ? (
                                            <span className={`font-mono text-2xl font-bold italic tracking-wide select-none ${scoreTheme === "paper" ? "text-zinc-650" : "text-zinc-400"}`}>
                                              𝄎
                                            </span>
                                          ) : (
                                            <span 
                                              className={`font-marker text-2xl md:text-3xl font-black tracking-wide leading-none ${
                                                scoreTheme === "paper" ? "text-zinc-900" : "text-zinc-100"
                                              }`}
                                            >
                                              {chord}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Subtle dynamics helper of measures */}
                                  <span className="absolute bottom-1 text-[8px] font-mono text-zinc-500 scale-90 block">
                                    {measure.beats} tempos
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Right Heavy Double Bar indicator */}
                          <div className={`w-[6px] h-20 rounded-r ${scoreTheme === "paper" ? "border-r-4 border-l-2 border-black" : "border-r-4 border-l-2 border-zinc-350"}`} />

                        </div>
                      );})}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER LAYER OF SCORE SHEET */}
            <div className="flex justify-between items-center border-t-2 border-black pt-4 font-sans text-xs">
              <span className={scoreTheme === "paper" ? "text-zinc-500" : "text-zinc-400"}>
                Página 1 de 1. Gerado com Stage Set
              </span>
              {activeSong.footerNotes ? (
                <span className={`italic font-medium hidden print:inline-block ${scoreTheme === "paper" ? "text-amber-600" : "text-amber-500"}`}>
                  {activeSong.footerNotes}
                </span>
              ) : (
                <span className={`italic font-medium hidden print:inline-block ${scoreTheme === "paper" ? "text-amber-600" : "text-amber-500"}`}>
                  * Afinamento padrão. Foco nas transições rítmicas do Pré-Refrão.
                </span>
              )}
            </div>
            
          </section>

          {/* REAL-TIME AUDIO TRANSCRIPTION & VOCAL COMMANDS PANEL */}
          <section id="audio-transcription-stage-panel" className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${isTranscribing ? "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                    Transcrição de Voz e Comandos de Palco
                    {isTranscribing && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                        AO VIVO
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Transcreva áudio de ensaio ou use comandos de voz para destacar seções e compassos de acordes mãos-livres!
                  </p>
                </div>
              </div>

              {/* FEED SELECTOR BUTTONS */}
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
                <button
                  type="button"
                  onClick={() => setSelectedFeedType("simulation")}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${selectedFeedType === "simulation" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}
                >
                  Simulador de Ensaio
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFeedType("microphone")}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${selectedFeedType === "microphone" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}
                >
                  Microfone Real (Web Speech)
                </button>
              </div>
            </div>

            {/* ERROR BANNER IF ACCESS IS RESTRICTED BY IFRAME */}
            {micError && selectedFeedType === "microphone" && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3 text-xs text-amber-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-col gap-1">
                  <p className="font-bold">Restrição de Sandbox Detectada</p>
                  <p className="mt-1 leading-relaxed text-zinc-400">
                    O iframe de desenvolvimento pode bloquear o microfone direto do navegador. 
                    Nós recomendamos usar o <span className="text-amber-500 font-bold">Simulador de Ensaio</span> (funciona 100% off-line) ou 
                    abrir a aplicação em uma aba externa para liberar o hardware nativo!
                  </p>
                </div>
              </div>
            )}

            {/* MAIN TRANSCRIPTION GRID: CONTROL PANEL & TRIGGERS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT SIDE: FEED MONITOR & CONTROLS */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* INTERACTIVE CONTROLS */}
                <div className="flex items-center justify-between gap-4 p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl">
                  
                  {/* Master Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsTranscribing(!isTranscribing)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                        isTranscribing 
                          ? "bg-red-500 hover:bg-red-650 text-white animate-pulse" 
                          : "bg-amber-500 hover:bg-amber-600 text-black"
                      }`}
                    >
                      {isTranscribing ? (
                        <>
                          <MicOff className="w-4 h-4" /> Parar Transcritor
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" /> Ativar Transcritor
                        </>
                      )}
                    </button>

                    {/* Language Selector */}
                    <div className="flex items-center gap-1 text-xs">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      <select
                        value={transcriptionLanguage}
                        onChange={(e) => setTranscriptionLanguage(e.target.value)}
                        className="bg-transparent border-0 text-zinc-300 font-mono text-xs focus:ring-0 cursor-pointer"
                        disabled={isTranscribing}
                      >
                        <option value="pt-BR" className="bg-zinc-950">Português (PT)</option>
                        <option value="en-US" className="bg-zinc-950">Inglês (EN)</option>
                      </select>
                    </div>
                  </div>

                  {/* Log Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLogs}
                      disabled={transcriptionLogs.length === 0}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                      title="Copiar logs para o clipboard"
                    >
                      {copiedLogs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTranscriptionLogs([])}
                      disabled={transcriptionLogs.length === 0}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg text-xs border border-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-mono font-bold"
                    >
                      Limpar
                    </button>
                  </div>

                </div>

                {/* VOLUME GRAPH & DYNAMIC OSCILLOSCOPE WAVE */}
                <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                      Visualizador Dinâmico de Decibéis
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                      Volume: {micVolume}%
                    </span>
                  </div>

                  {/* WAVE BARS ROW */}
                  <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-zinc-900">
                    <div className="flex items-end justify-center gap-1.5 h-16 w-full px-4 overflow-hidden">
                      {Array.from({ length: 28 }).map((_, i) => {
                        // Dynamically scale height based on state
                        let animClass = "";
                        if (isTranscribing) {
                          if (i % 3 === 0) animClass = "animate-wave-1";
                          else if (i % 3 === 1) animClass = "animate-wave-2";
                          else animClass = "animate-wave-3";
                        }
                        
                        // Multiply base animation heights slightly when real volume peaks
                        const volOffset = micVolume > 10 ? micVolume / 6 : 0;
                        const defaultHeight = isTranscribing ? `${Math.min(95, 20 + (i % 5) * 12 + volOffset)}%` : "15%";

                        return (
                          <div
                            key={i}
                            className={`w-1.5 rounded-full transition-all duration-300 ${
                              isTranscribing 
                                ? (micVolume > 50 ? "bg-amber-400" : "bg-amber-500/80") 
                                : "bg-zinc-800"
                            } ${animClass}`}
                            style={{ height: defaultHeight }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* LOGS TRANSCRIPTION LOGPLATE */}
                <div className="bg-[#0A0A0B] border border-zinc-900 rounded-xl p-4 flex flex-col gap-2 grow min-h-[180px] max-h-[220px] overflow-y-auto">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                    Linhas de Transcrição • Feed Ativo ({selectedFeedType === "simulation" ? "Simulado" : "Microfone"})
                  </span>
                  
                  <div className="flex flex-col gap-2 overflow-y-auto font-mono text-xs text-zinc-400 mt-2 pr-1">
                    {transcriptionLogs.length === 0 ? (
                      <div className="text-zinc-650 italic text-center py-8">
                        {isTranscribing 
                          ? "Escutando ensaio... Comece a falar/tocar!" 
                          : "Transcritor inativo. Clique em 'Ativar Transcritor' acima para iniciar a captação."}
                      </div>
                    ) : (
                      transcriptionLogs.map((log, index) => (
                        <div 
                          key={index} 
                          className={`flex gap-3 p-2 rounded-lg border transition-all ${
                            log.isCommand 
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold shadow-sm" 
                              : "bg-zinc-950/40 border-zinc-900 text-zinc-300"
                          }`}
                        >
                          <span className="text-zinc-600 shrink-0 select-none">[{log.time}]</span>
                          <span className="grow break-words">{log.text}</span>
                          {log.isCommand && (
                            <span className="text-[9px] uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono shrink-0 font-black tracking-wider self-center">
                              Comando
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SAVE NOTE OPTION */}
                {transcriptionLogs.length > 0 && (
                  <div className="flex justify-between items-center gap-2 p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <span className="text-xs text-zinc-400">
                      {voiceNoteFeedback ? (
                        <span className="text-emerald-400 font-bold">✓ {voiceNoteFeedback}</span>
                      ) : (
                        "Adicione o histórico deste ensaio vocal ao roteiro da música ativo."
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVoiceNoteToSong}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvar no Roteiro
                    </button>
                  </div>
                )}

              </div>

              {/* RIGHT SIDE: RECOGNITION TRIGGERS GUIDE */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-[#18181B] border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 h-full">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                      Guia de Comando de Voz
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      O LiveSet Companion escuta os comandos abaixo. Ao falar ou simular estas palavras, a grade da partitura visual se destaca de forma sincronizada!
                    </p>
                  </div>

                  {/* ACTIVE RECOGNIZER FEEDBACK */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-mono">Último Comando Lido:</span>
                    <span className={`px-2 py-1 text-xs font-mono font-black uppercase rounded ${activeVoiceCommand !== "none" ? "bg-amber-500 text-black animate-bounce" : "bg-zinc-900 text-zinc-500"}`}>
                      {activeVoiceCommand === "none" ? "Nenhum" : activeVoiceCommand}
                    </span>
                  </div>

                  {/* ACTIVE COMMANDS SECTION Badges */}
                  <div className="flex flex-col gap-3 mt-1">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                      Estruturas / Seções de Palco
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { word: "INTRO", desc: "Introdução (IN)" },
                        { word: "V", desc: "Verso / Estrofe" },
                        { word: "PC", desc: "Pré-Refrão (Crescendo)" },
                        { word: "REFRÃO", desc: "Refrão (C)" },
                        { word: "B", desc: "Ponte / Guitar Bridge" }
                      ].map((item) => {
                        const isTriggered = activeVoiceCommand === item.word;
                        return (
                          <div 
                            key={item.word}
                            className={`p-2 rounded-lg border transition-all flex flex-col justify-between ${
                              isTriggered 
                                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 scale-105" 
                                : "bg-zinc-950/40 border-zinc-900"
                            }`}
                          >
                            <span className={`text-xs font-mono font-black ${isTriggered ? "text-amber-400" : "text-zinc-300"}`}>
                              "{item.word}"
                            </span>
                            <span className="text-[9px] text-zinc-500">{item.desc}</span>
                          </div>
                        );
                      })}
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block mt-2">
                      Acordes Mapeados
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { word: "EM", desc: "E major / mi menor" },
                        { word: "AM", desc: "A minor / lá menor" },
                        { word: "BM", desc: "B major / si menor" },
                        { word: "C#M", desc: "C# minor / dó sust. menor" }
                      ].map((item) => {
                        const isTriggered = activeVoiceCommand === item.word;
                        return (
                          <div 
                            key={item.word}
                            className={`p-2 rounded-lg border transition-all flex flex-col justify-between ${
                              isTriggered 
                                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 scale-105" 
                                : "bg-zinc-950/40 border-zinc-900"
                            }`}
                          >
                            <span className={`text-xs font-mono font-black ${isTriggered ? "text-amber-400" : "text-zinc-300"}`}>
                              "{item.word}"
                            </span>
                            <span className="text-[9px] text-zinc-500">{item.desc}</span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* DYNAMIC CO-DESIGN & ALIGNMENT FORM */}
          <section className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4 pb-4 border-b border-zinc-800">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="grow">
                <h3 className="text-base font-display font-bold text-zinc-100 uppercase tracking-widest">
                  Alinhador de Coodesign do Stage Set
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Responda abaixo para lapidarmos e configurarmos o mecanismo de leitura compassada segundo o seu uso real no palco e nos ensaios.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveQuestionnaire} className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Question 1 */}
                <div className="flex flex-col gap-1.5 bg-[#0A0A0B]/60 p-3 rounded-lg border border-zinc-900">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <span className="text-amber-500">1.</span> O que significa "Partitura Funcional" para você?
                  </label>
                  <select 
                    id="select-q1"
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 p-2.5 rounded text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer mt-1"
                  >
                    <option value="grade_compasso">Grade de compassos isolados (blocos iguais a Miles Davis)</option>
                    <option value="roteiro_letras">Roteiros estruturados de estrofes (Intro, Verso, Solos) + anotações</option>
                    <option value="sistema_numerico">Sistema numérico por graus (Exemplo: I, IV, vi, V)</option>
                    <option value="misto">Uma mescla de tudo para palco escuro (compassos + cifra gigante + observações)</option>
                  </select>
                </div>

                {/* Question 2 */}
                <div className="flex flex-col gap-1.5 bg-[#0A0A0B]/60 p-3 rounded-lg border border-zinc-900">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <span className="text-amber-500">2.</span> Como as músicas devem ser cadastradas?
                  </label>
                  <select 
                    id="select-q2"
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 p-2.5 rounded text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer mt-1"
                  >
                    <option value="manual_form">Preencher um formulário compasso por compasso</option>
                    <option value="ai_magic">Colar a cifra inteira (ex: CifraClub) e a IA gera do arquivo original</option>
                    <option value="txt_import">Carregar arquivo TXT estruturado ou JSON puro</option>
                  </select>
                </div>

                {/* Question 3 */}
                <div className="flex flex-col gap-1.5 bg-[#0A0A0B]/60 p-3 rounded-lg border border-zinc-900">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <span className="text-amber-500">3.</span> Qual seu foco de usabilidade?
                  </label>
                  <select 
                    id="select-q3"
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 p-2.5 rounded text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer mt-1"
                  >
                    <option value="tablet_pedal">Leitura em Tablet com pedal Bluetooth / MIDI passando páginas</option>
                    <option value="scroll_auto">Roteiro no celular com rolagem automática no BPM da música</option>
                    <option value="minimalist_compact">Letras e acordes hiper-gigantes para visualização à distância no pedestal</option>
                  </select>
                </div>

                {/* Question 4 */}
                <div className="flex flex-col gap-1.5 bg-[#0A0A0B]/60 p-3 rounded-lg border border-zinc-900">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <span className="text-amber-500">4.</span> Qual dessas integrações traria mais valor?
                  </label>
                  <select 
                    id="select-q4"
                    value={q4}
                    onChange={(e) => setQ4(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 p-2.5 rounded text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer mt-1"
                  >
                    <option value="audio_track">Metrônomo inteligente com contagem falada por áudio</option>
                    <option value="realtime_sync">Sincronia multitelas (o líder passa a música e todos mudam juntos no palco)</option>
                    <option value="banco_dados">Exportador universal e backup banda em nuvem</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-between items-center flex-wrap gap-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-400">
                  {showSaveSuccess ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ✓ Preferências atualizadas na sessão local!
                    </span>
                  ) : (
                    <span>Preencha suas preferências reais para alinhar a IA.</span>
                  )}
                </p>
                
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-black rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Preferências
                </button>
              </div>

            </form>
          </section>

        </main>

      </div>

      {/* CREATE NEW SONG MODAL POPUP */}
      {showAddSongModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowAddSongModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-display font-medium text-white pb-2 border-b border-zinc-800 flex items-center gap-2">
              <PlusSquare className="text-amber-500 w-5 h-5" /> Nova Música no Setlist
            </h3>

            <form onSubmit={createSongFromModal} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-300 font-mono">Título *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="EX: Angels" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-300 font-mono">Artista</label>
                <input 
                  type="text" 
                  placeholder="EX: Robbie Williams" 
                  value={newArtist} 
                  onChange={e => setNewArtist(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-300 font-mono">BPM Original</label>
                  <input 
                    type="number" 
                    min="30" 
                    max="280" 
                    value={newBpm} 
                    onChange={e => setNewBpm(Number(e.target.value))}
                    className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-300 font-mono">Tom Clave</label>
                  <select 
                    value={newKey} 
                    onChange={e => setNewKey(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200"
                  >
                    {["C", "Cm", "C#", "C#m", "Db", "D", "Dm", "Eb", "E", "Em", "F", "Fm", "F#", "F#m", "G", "Gm", "Ab", "A", "Am", "Bb", "B"].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-850">
                <button 
                  type="button" 
                  onClick={() => setShowAddSongModal(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-black rounded text-xs transition-colors cursor-pointer"
                >
                  Criar Música
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowAddNoteModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-display font-medium text-white pb-2 border-b border-zinc-800 flex items-center gap-2">
              <Tag className="text-amber-500 w-5 h-5" /> Adicionar Nota de Performance
            </h3>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPerformanceNote(selectedSectionIdForNote, selectedMeasureIdForNote, newPerformanceNoteText);
                setShowAddNoteModal(false);
                setNewPerformanceNoteText("");
              }} 
              className="flex flex-col gap-4 mt-4"
            >
              {/* Select Section */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-300 font-mono">Seção da Música</label>
                <select
                  value={selectedSectionIdForNote}
                  onChange={(e) => {
                    const secId = e.target.value;
                    setSelectedSectionIdForNote(secId);
                    const secObj = activeSong.sections.find(s => s.id === secId);
                    if (secObj && secObj.measures.length > 0) {
                      setSelectedMeasureIdForNote(secObj.measures[0].id);
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200 cursor-pointer"
                >
                  {activeSong.sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} ({sec.dynamics || `${sec.measures.length} comp.`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Measure */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-300 font-mono">Compasso Alvo</label>
                <select
                  value={selectedMeasureIdForNote}
                  onChange={(e) => setSelectedMeasureIdForNote(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200 cursor-pointer"
                >
                  {(activeSong.sections.find(s => s.id === selectedSectionIdForNote)?.measures || []).map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      Compasso {idx + 1} - Acordes: [{m.chords.join(" | ")}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Note input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-300 font-mono">Anotação / Tag</label>
                <input 
                  type="text" 
                  required 
                  placeholder="EX: crescendo, ficar atento, diminuendo..." 
                  value={newPerformanceNoteText} 
                  onChange={e => setNewPerformanceNoteText(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500 text-zinc-200"
                />
              </div>

              {/* Presets / Suggestions */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Sugestões Rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["crescendo", "ficar atento", "suave", "forte", "bateria entra", "parada total", "solo de guitarra", "segura o tom"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewPerformanceNoteText(preset)}
                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 rounded cursor-pointer transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-850">
                <button 
                  type="button" 
                  onClick={() => setShowAddNoteModal(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-black rounded text-xs transition-colors cursor-pointer"
                >
                  Adicionar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAGE BOTTOM CONTROLLER */}
      <footer className="border-t border-zinc-800 bg-[#121214] py-8 px-6 text-center text-xs text-zinc-500 mt-12">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            Stage Set • Design focado no instrumentista
          </p>
          <p className="text-zinc-500 leading-relaxed text-xs">
            Formatado com o sistema de partitura simplificada de compacidade visual. Sincronize com o metrônomo visual e mude de tom dinamicamente.
          </p>
        </div>
      </footer>

    </div>
  );
}
