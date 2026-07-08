import { Song } from "../types";

const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/**
 * Transpose a single note (like C# or G or B) by a set amount of semitones
 */
export function transposeNote(note: string, semitones: number): string {
  if (!note) return "";
  
  // Match a base note (A-G followed by optional # or b)
  const match = note.match(/^([A-G][#b]?)/);
  if (!match) return note;
  
  const baseNote = match[1];
  const suffix = note.substring(baseNote.length);

  let index = NOTES_SHARP.indexOf(baseNote);
  if (index === -1) {
    index = NOTES_FLAT.indexOf(baseNote);
  }
  if (index === -1) return note;

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  // Use flat or sharp scale depending on context or preference. Let's default to standard.
  const isFlatContext = ["Db", "Eb", "Ab", "Bb", "F"].includes(baseNote) || (semitones < 0 && !baseNote.includes("#"));
  const transposedBase = isFlatContext ? NOTES_FLAT[newIndex] : NOTES_SHARP[newIndex];
  
  return transposedBase + suffix;
}

/**
 * Transposes any standard chord string, including slash chords (e.g. "D/F#", "C#m7(9)")
 */
export function transposeChord(chord: string, semitones: number): string {
  if (!chord || chord === "N.C." || chord === "%") return chord;
  
  // If it's a slash chord, transpose both sides
  if (chord.includes("/")) {
    const parts = chord.split("/");
    return `${transposeChord(parts[0], semitones)}/${transposeChord(parts[1], semitones)}`;
  }
  
  // Isolate the root note vs extensions. Chords start with A-G, optionally # or b.
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  
  const root = match[1];
  const rest = match[2];
  
  return transposeNote(root, semitones) + rest;
}

/**
 * Transposes an entire Song object and returns a cloned transposed copy
 */
export function transposeSong(song: Song | undefined, semitones: number): Song {
  if (!song) {
    return {
      id: "",
      title: "",
      originalKey: "",
      currentKey: "",
      bpm: 120,
      timeSignature: "4/4",
      sections: []
    };
  }
  if (semitones === 0) return song;

  // Transpose the current key
  const updatedKey = transposeNote(song.currentKey, semitones);

  const updatedSections = song.sections.map(section => ({
    ...section,
    measures: section.measures.map(measure => ({
      ...measure,
      chords: measure.chords.map(chord => transposeChord(chord, semitones))
    }))
  }));

  return {
    ...song,
    currentKey: updatedKey,
    sections: updatedSections
  };
}
