import { AudioContext } from "node-web-audio-api";

export class Transport {
    private _tempo: number = 120;
    private _isPlaying: boolean = false;

    private _startTime: number = 0;
    private _previousTick: number = 0;

    get tempo() {
      return this._tempo;
    }
  
    set tempo(tempo: number) {
      this._tempo = tempo;      
    }

    get isPlaying() {
        return this._isPlaying;
    }

    set isPlaying(playing: boolean) {
        this._isPlaying = playing;
    }    
  
    start() {
      this._isPlaying = true;
      
      this._startTime = performance.now();
      console.log('starting to tick', this._startTime, this._previousTick);
      this.tick();
      // Start the audio engine or sequencer
    }

    private calculateInterval(): number {
      // Calculate the interval in milliseconds based on tempo
      return (60 / this._tempo) * 1000;
    }
  
    private tick(): void {
      if (this._isPlaying) {        
        if((this._startTime + (60000 / this._tempo)) < performance.now()) {
          console.log('tick');
        }                        
        this.tick();
  
        //requestAnimationFrame(this.tick.bind(this)); // Ensure 'this' refers to the class
      }
    }
  
    stop() {
      this._isPlaying = false;
      // Stop the audio engine or sequencer
    }
  
    scrub(position: number) {
      // Seek to the specified position in the timeline
    }
    
  }