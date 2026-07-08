import { Song, SongSection, Measure } from "../types";

/**
 * Loads the PDF.js library from a reliable CDN dynamically
 */
export const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      // Configure workerSrc
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(pdfjsLib);
    };
    script.onerror = (err) => {
      reject(new Error("Não foi possível carregar a biblioteca de processamento de PDFs (PDF.js). Verifique sua conexão."));
    };
    document.head.appendChild(script);
  });
};

/**
 * Extracts plain text from a PDF file using PDF.js
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // To preserve columns and layouts, group items by their vertical (Y) coordinate
    const linesMap: { [key: number]: any[] } = {};
    
    textContent.items.forEach((item: any) => {
      if (!item.str || item.str.trim() === "") return;
      const y = Math.round(item.transform[5]); // Y coordinate
      if (!linesMap[y]) {
        linesMap[y] = [];
      }
      linesMap[y].push(item);
    });
    
    // Sort Y coordinates from top to bottom (descending order in PDF space)
    const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
    
    const pageLines = sortedY.map((y) => {
      // Sort items inside the same line by horizontal (X) position (transform[4])
      const lineItems = linesMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
      return lineItems.map((item) => item.str).join(" ");
    });
    
    fullText += pageLines.join("\n") + "\n";
  }
  
  return fullText;
};

/**
 * Parses a MusicXML (.musicxml / .xml) file into a structured Song object
 */
export function parseMusicXML(xmlText: string): Song {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  // Extract Title
  let title = "Música Sem Título";
  const workTitle = xmlDoc.querySelector("work-title")?.textContent;
  const movementTitle = xmlDoc.querySelector("movement-title")?.textContent;
  const creditText = xmlDoc.querySelector("credit-words")?.textContent;
  
  if (workTitle) {
    title = workTitle.trim();
  } else if (movementTitle) {
    title = movementTitle.trim();
  } else if (creditText) {
    title = creditText.trim();
  }
  
  // Extract Artist/Composer
  let artist = "Artista Desconhecido";
  const creator = xmlDoc.querySelector("creator[type='composer']")?.textContent || 
                  xmlDoc.querySelector("creator")?.textContent ||
                  xmlDoc.querySelector("rights")?.textContent;
  if (creator) {
    artist = creator.trim();
  }
  
  // Extract BPM / Tempo
  let bpm = 120;
  const soundTempo = xmlDoc.querySelector("sound[tempo]")?.getAttribute("tempo");
  const perMinute = xmlDoc.querySelector("per-minute")?.textContent;
  if (soundTempo) {
    bpm = Math.round(Number(soundTempo));
  } else if (perMinute) {
    bpm = Math.round(Number(perMinute));
  }
  
  // Extract Time Signature
  let beatsPerMeasure = 4;
  let beatType = 4;
  const beatsEl = xmlDoc.querySelector("beats");
  const beatTypeEl = xmlDoc.querySelector("beat-type");
  if (beatsEl) beatsPerMeasure = Number(beatsEl.textContent) || 4;
  if (beatTypeEl) beatType = Number(beatTypeEl.textContent) || 4;
  const timeSignature = `${beatsPerMeasure}/${beatType}`;

  // Extract Key Signature
  let originalKey = "C";
  const fifthsEl = xmlDoc.querySelector("fifths");
  if (fifthsEl) {
    const fifths = Number(fifthsEl.textContent);
    const keysMap: { [key: number]: string } = {
      [-7]: "Cb", [-6]: "Gb", [-5]: "Db", [-4]: "Ab", [-3]: "Eb", [-2]: "Bb", [-1]: "F",
      0: "C",
      1: "G", 2: "D", 3: "A", 4: "E", 5: "B", 6: "F#", 7: "C#"
    };
    originalKey = keysMap[fifths] || "C";
  }

  // Parse Measures and Harmonies
  const xmlMeasures = xmlDoc.querySelectorAll("measure");
  const parsedMeasures: { id: string; chords: string[]; beats: number; sectionName?: string }[] = [];
  
  let measureCounter = 1;
  
  xmlMeasures.forEach((measureNode) => {
    const measureId = measureNode.getAttribute("number") || `${measureCounter++}`;
    
    // Check for rehearsal mark (e.g., section marker "A", "Chorus", "Intro")
    let sectionName: string | undefined = undefined;
    const rehearsalEl = measureNode.querySelector("rehearsal");
    if (rehearsalEl && rehearsalEl.textContent) {
      sectionName = rehearsalEl.textContent.trim();
    }
    
    // Check for chords/harmonies inside this measure
    const harmonyNodes = measureNode.querySelectorAll("harmony");
    const chordsInMeasure: string[] = [];
    
    harmonyNodes.forEach((harmonyNode) => {
      const step = harmonyNode.querySelector("root-step")?.textContent;
      if (!step) return;
      
      const alter = harmonyNode.querySelector("root-alter")?.textContent;
      let alterSymbol = "";
      if (alter === "1") alterSymbol = "#";
      else if (alter === "-1") alterSymbol = "b";
      
      const kind = harmonyNode.querySelector("kind")?.textContent || "";
      let kindSuffix = "";
      
      // Map common kinds to text representation
      if (kind.includes("minor")) {
        kindSuffix = "m";
      }
      if (kind.includes("seventh")) {
        if (kind.includes("major")) kindSuffix = "M7";
        else if (kind.includes("minor")) kindSuffix = "m7";
        else kindSuffix = "7";
      } else if (kind.includes("major")) {
        kindSuffix = ""; // Cmajor -> C
      } else if (kind === "suspended-fourth" || kind === "sus") {
        kindSuffix = "sus4";
      } else if (kind === "suspended-second") {
        kindSuffix = "sus2";
      } else if (kind === "diminished") {
        kindSuffix = "dim";
      } else if (kind === "augmented") {
        kindSuffix = "aug";
      } else if (kind === "dominant") {
        kindSuffix = "7";
      } else if (kind === "half-diminished") {
        kindSuffix = "m7b5";
      } else if (kind === "power") {
        kindSuffix = "5";
      }
      
      // Bass note (e.g., C/G)
      const bassStep = harmonyNode.querySelector("bass-step")?.textContent;
      let bassSuffix = "";
      if (bassStep) {
        const bassAlter = harmonyNode.querySelector("bass-alter")?.textContent;
        let bassAlterSymbol = "";
        if (bassAlter === "1") bassAlterSymbol = "#";
        else if (bassAlter === "-1") bassAlterSymbol = "b";
        bassSuffix = `/${bassStep}${bassAlterSymbol}`;
      }
      
      const chordName = `${step}${alterSymbol}${kindSuffix}${bassSuffix}`;
      chordsInMeasure.push(chordName);
    });
    
    if (chordsInMeasure.length === 0) {
      // In Live Set, "%" represents repeat chord / same as previous
      chordsInMeasure.push("%");
    }
    
    parsedMeasures.push({
      id: `xml-m-${measureId}-${Date.now()}-${measureCounter}`,
      chords: chordsInMeasure,
      beats: beatsPerMeasure,
      sectionName
    });
  });
  
  // Group the measures into SongSections
  const sections: SongSection[] = [];
  let currentSectionMeasures: Measure[] = [];
  let currentSectionName = "Intro";
  
  const createSection = (name: string, mList: Measure[]) => {
    let color = "bg-zinc-800 text-white";
    const nameLower = name.toLowerCase();
    if (nameLower.includes("intro") || nameLower.includes("in")) {
      color = "bg-zinc-700 text-white";
    } else if (nameLower.includes("verso") || nameLower.includes("verse") || nameLower.includes("v")) {
      color = "bg-emerald-600 text-white";
    } else if (nameLower.includes("refrão") || nameLower.includes("chorus") || nameLower.includes("c")) {
      color = "bg-amber-600 text-black font-extrabold";
    } else if (nameLower.includes("ponte") || nameLower.includes("bridge") || nameLower.includes("b")) {
      color = "bg-purple-600 text-white";
    } else if (nameLower.includes("solo") || nameLower.includes("s")) {
      color = "bg-red-600 text-white";
    } else {
      const colorOptions = [
        "bg-teal-600 text-white",
        "bg-blue-600 text-white",
        "bg-indigo-600 text-white",
        "bg-pink-600 text-white"
      ];
      color = colorOptions[sections.length % colorOptions.length];
    }
    
    sections.push({
      id: `sec-${nameLower.replace(/\s+/g, "-")}-${Date.now()}-${sections.length}`,
      name: name.substring(0, 12).toUpperCase(),
      color,
      dynamics: `Parte ${name}`,
      measures: mList
    });
  };

  const hasRehearsals = parsedMeasures.some(m => m.sectionName);
  
  if (hasRehearsals) {
    parsedMeasures.forEach((pm) => {
      if (pm.sectionName && currentSectionMeasures.length > 0) {
        createSection(currentSectionName, currentSectionMeasures);
        currentSectionMeasures = [];
        currentSectionName = pm.sectionName;
      } else if (pm.sectionName) {
        currentSectionName = pm.sectionName;
      }
      
      currentSectionMeasures.push({
        id: pm.id,
        chords: pm.chords,
        beats: pm.beats
      });
    });
    
    if (currentSectionMeasures.length > 0) {
      createSection(currentSectionName, currentSectionMeasures);
    }
  } else {
    // No rehearsals: group in blocks of 4 measures
    const blockSize = 4;
    for (let i = 0; i < parsedMeasures.length; i += blockSize) {
      const slice = parsedMeasures.slice(i, i + blockSize).map(pm => ({
        id: pm.id,
        chords: pm.chords,
        beats: pm.beats
      }));
      
      let blockName = "VERSO";
      if (i === 0) blockName = "INTRO";
      else if (i >= 8 && i < 16) blockName = "REFRÃO";
      else if (i >= 24) blockName = "PONTE / FIM";
      else blockName = `VERSO ${Math.floor(i / 4) + 1}`;
      
      createSection(blockName, slice);
    }
  }

  // Ensure we have at least one section
  if (sections.length === 0) {
    sections.push({
      id: `sec-default-${Date.now()}`,
      name: "INTRO",
      color: "bg-zinc-700 text-white",
      dynamics: "Arranjo padrão",
      measures: [
        { id: `m1-${Date.now()}`, chords: ["C"], beats: 4 },
        { id: `m2-${Date.now()}`, chords: ["%"], beats: 4 },
        { id: `m3-${Date.now()}`, chords: ["F"], beats: 4 },
        { id: `m4-${Date.now()}`, chords: ["G"], beats: 4 }
      ]
    });
  }

  return {
    id: `imported-musicxml-${Date.now()}`,
    title,
    artist,
    originalKey,
    currentKey: originalKey,
    bpm,
    timeSignature,
    duration: "4:00",
    notes: `MusicXML importado: ${parsedMeasures.length} compassos mapeados com sucesso.`,
    sections
  };
}

/**
 * Parses a ChordPro / TXT chord sheet into a structured Song object
 */
export function parseChordSheet(text: string, fileName: string): Song {
  const lines = text.split(/\r?\n/);
  
  let title = fileName.split(".")[0] || "Música Importada";
  title = title.charAt(0).toUpperCase() + title.slice(1).replace(/[-_]/g, " ");
  let artist = "Artista Desconhecido";
  let originalKey = "C";
  let bpm = 120;
  let timeSignature = "4/4";
  let notes = "Cifra de acordes importada e mapeada em compassos de palco.";
  
  const detectedSections: { name: string; chords: string[] }[] = [];
  let currentSectionName = "";
  let currentSectionChords: string[] = [];
  
  const bracketChordRegex = /\[([^\]]+)\]/g;
  
  // Checks if a word is likely a chord
  const isChord = (token: string): boolean => {
    const cleanToken = token.trim().replace(/[()]/g, "");
    if (!cleanToken) return false;
    
    // Starts with A-G (with flat/sharp/modifiers)
    if (!/^[A-G]/i.test(cleanToken)) return false;
    if (cleanToken.length > 10) return false;
    
    // Standard chord symbols match
    return true;
  };

  const isChordLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (trimmed.includes("[") && trimmed.includes("]")) return false;
    
    const tokens = trimmed.split(/\s+/);
    let chordCount = 0;
    let nonChordCount = 0;
    
    tokens.forEach((token) => {
      if (isChord(token)) {
        chordCount++;
      } else if (token.length > 2 && !/^[A-G]/i.test(token)) {
        nonChordCount++;
      }
    });
    
    return chordCount > 0 && chordCount >= nonChordCount;
  };

  const addChordsToCurrentSection = (chords: string[]) => {
    if (chords.length === 0) return;
    if (!currentSectionName) {
      currentSectionName = "Intro";
    }
    currentSectionChords.push(...chords);
  };

  const commitCurrentSection = () => {
    if (currentSectionName && currentSectionChords.length > 0) {
      detectedSections.push({
        name: currentSectionName,
        chords: [...currentSectionChords]
      });
      currentSectionChords = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // 1. Check for ChordPro tags
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const content = trimmed.substring(1, trimmed.length - 1);
      const colonIdx = content.indexOf(":");
      if (colonIdx !== -1) {
        const key = content.substring(0, colonIdx).trim().toLowerCase();
        const val = content.substring(colonIdx + 1).trim();
        
        if (key === "title" || key === "t") {
          title = val;
        } else if (key === "artist" || key === "a") {
          artist = val;
        } else if (key === "key" || key === "k") {
          originalKey = val;
        } else if (key === "tempo" || key === "bpm") {
          bpm = parseInt(val) || 120;
        } else if (key === "time" || key === "timesig") {
          timeSignature = val;
        } else if (key === "comment" || key === "c") {
          commitCurrentSection();
          currentSectionName = val;
        }
      } else {
        const directive = content.toLowerCase();
        if (directive === "start_of_chorus" || directive === "soc") {
          commitCurrentSection();
          currentSectionName = "REFRÃO";
        } else if (directive === "end_of_chorus" || directive === "eoc") {
          commitCurrentSection();
          currentSectionName = "";
        } else if (directive === "start_of_verse" || directive === "sov") {
          commitCurrentSection();
          currentSectionName = "VERSO";
        } else if (directive === "end_of_verse" || directive === "eov") {
          commitCurrentSection();
          currentSectionName = "";
        }
      }
      continue;
    }
    
    // 2. Section Headers: e.g. [Intro], [Verse], [Chorus], Verse 1:, Refrão:
    const sectionHeaderMatch = trimmed.match(/^\[([^\]]+)\]$/) || trimmed.match(/^([^:]+):$/);
    if (sectionHeaderMatch) {
      const headerCandidate = sectionHeaderMatch[1].trim();
      if (!isChord(headerCandidate)) {
        commitCurrentSection();
        currentSectionName = headerCandidate.toUpperCase();
        continue;
      }
    }
    
    // 3. Inline chords in brackets e.g. [C] e [G]
    if (trimmed.includes("[") && trimmed.includes("]")) {
      const chordsOnLine: string[] = [];
      let match;
      bracketChordRegex.lastIndex = 0;
      while ((match = bracketChordRegex.exec(trimmed)) !== null) {
        const ch = match[1].trim();
        if (isChord(ch)) {
          chordsOnLine.push(ch);
        }
      }
      addChordsToCurrentSection(chordsOnLine);
      continue;
    }
    
    // 4. Standalone chord lines
    if (isChordLine(line)) {
      const tokens = trimmed.split(/\s+/);
      const chordsOnLine = tokens.filter(t => isChord(t));
      addChordsToCurrentSection(chordsOnLine);
    }
  }
  
  commitCurrentSection();
  
  const finalSections: SongSection[] = [];
  
  detectedSections.forEach((ds, idx) => {
    const measures: Measure[] = [];
    
    // Group chords: default is 1 chord per 4-beat measure.
    // If chords are repeated or adjacent, we structure them cleanly.
    ds.chords.forEach((chord, chordIdx) => {
      measures.push({
        id: `crd-m-${idx}-${chordIdx}-${Date.now()}-${chordIdx}`,
        chords: [chord],
        beats: 4
      });
    });
    
    let color = "bg-zinc-800 text-white";
    const nameLower = ds.name.toLowerCase();
    if (nameLower.includes("intro") || nameLower.includes("in")) color = "bg-zinc-700 text-white";
    else if (nameLower.includes("verso") || nameLower.includes("verse") || nameLower.includes("v")) color = "bg-emerald-600 text-white";
    else if (nameLower.includes("refrão") || nameLower.includes("chorus") || nameLower.includes("c")) color = "bg-amber-600 text-black font-extrabold";
    else if (nameLower.includes("ponte") || nameLower.includes("bridge") || nameLower.includes("b")) color = "bg-purple-600 text-white";
    else if (nameLower.includes("solo") || nameLower.includes("s")) color = "bg-red-600 text-white";
    
    if (measures.length > 0) {
      finalSections.push({
        id: `sec-txt-${idx}-${Date.now()}-${idx}`,
        name: ds.name.substring(0, 12).toUpperCase(),
        color,
        dynamics: `Seção ${ds.name}`,
        measures
      });
    }
  });
  
  if (finalSections.length === 0) {
    // Final fallback: try to scrape any chords anywhere in the text
    const allChords: string[] = [];
    lines.forEach(line => {
      const tokens = line.trim().split(/\s+/);
      tokens.forEach(token => {
        const cleaned = token.replace(/[\[\]()]/g, "").trim();
        if (isChord(cleaned)) {
          allChords.push(cleaned);
        }
      });
    });
    
    const measures: Measure[] = [];
    if (allChords.length > 0) {
      allChords.forEach((chord, chordIdx) => {
        measures.push({
          id: `def-m-${chordIdx}-${Date.now()}-${chordIdx}`,
          chords: [chord],
          beats: 4
        });
      });
    } else {
      measures.push(
        { id: `def-m1-${Date.now()}`, chords: ["C"], beats: 4 },
        { id: `def-m2-${Date.now()}`, chords: ["%"], beats: 4 },
        { id: `def-m3-${Date.now()}`, chords: ["F"], beats: 4 },
        { id: `def-m4-${Date.now()}`, chords: ["G"], beats: 4 }
      );
    }
    
    finalSections.push({
      id: `sec-fallback-${Date.now()}`,
      name: "INTRO",
      color: "bg-zinc-700 text-white",
      dynamics: "Acordes extraídos do arquivo",
      measures
    });
  }
  
  return {
    id: `imported-txt-${Date.now()}`,
    title,
    artist,
    originalKey,
    currentKey: originalKey,
    bpm,
    timeSignature,
    duration: "3:30",
    notes,
    sections: finalSections
  };
}
