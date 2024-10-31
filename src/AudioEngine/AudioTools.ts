import { AudioContext } from "node-web-audio-api";
import { pid } from "process";

const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const notesFromC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export class AudioTools {

    public static NoteToFrequencyOld(note: string): number {
        const baseFrequency = 440; // A4    
        const [noteName, octaveString] = note.split('');
        const octave = parseInt(octaveString);    
        const noteIndex = notes.indexOf(noteName);
        const halfStepsAboveA4 = (octave - 4) * 12 + noteIndex;    
        return baseFrequency * Math.pow(2, halfStepsAboveA4 / 12);
    }

    public static NoteToFrequency(note: string, octave: number): number {
        const noteMap: { [key: string]: number } = {
          'A': 0, 'A#': 1, 'Bb': 1, 'B': 2, 'Cb': 2, 'C': 3,
          'C#': 4, 'Db': 4, 'D': 5, 'D#': 6, 'Eb': 6, 'E': 7,
          'Fb': 7, 'F': 8, 'F#': 9, 'Gb': 9, 'G': 10, 'G#': 11, 'Ab': 11
        };
      
        console.log('input note', note, 'input octave:', octave);
        const semitonesFromA4 = 12 * (octave - 4) + noteMap[note.toUpperCase()];
        const frequency = 440 * 2 ** (semitonesFromA4 / 12);      
        return frequency;
      }

    public static padIndexToNote(pIdx: string, fromC?: boolean) {
        console.log('padIndexToNote', pIdx)
        const idx = parseInt(pIdx.substring(1)) - 1;        
        const noteIdx = idx % (notes.length);
        if(fromC) {
            return notesFromC[noteIdx];
        } else {
            return notes[noteIdx];
        }
    }

    public static CreateEnvelope(audioCtx: AudioContext) {

    }
}