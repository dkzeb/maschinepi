import { DisplayObject, Graphics, Ticker } from "@pixi/node";
import { PixiWidget } from "./PixiWidget";
import { Text } from '@pixi/node';
import { filter, Subject } from "rxjs";
import { AudioContext, GainNode, OscillatorNode, AnalyserNode } from "node-web-audio-api";
import Channel from "../../AudioEngine/channel";
import { container } from "tsyringe";
import Mixer from "../../AudioEngine/mixer";
import { AudioTools } from "../../AudioEngine/AudioTools";
import { UITools } from "../../UI/UITools";


export class OscillatorWidget extends PixiWidget {

    synth: ThreeOSCSynth;
    mixerChannel: Channel = container.resolve(Mixer).getChannel(0);
    mainOutputWaveform: any;
    UITicker?: Ticker;
    
    constructor() {
        super({
            name: 'OscillatorWidget',
            titlebar: {
                color: '#ffffff',
                title: '3xOSC Clone (Synthesizer)'
            },
            dims: {
                x: 0, y: 0, w: 480 * 2, h: 272
            },
            options: [
                {
                    ui: {
                        label: 'OSC 0',
                        slot: 0,
                    },
                    buttonId: 'd1',
                    toggleable: {
                        state: false,
                        activeColor: '#00FFFF'
                    },
                    cb: (o) => {                         
                        this.toggleOscillator(0, o.ui.active);
                    }
                },
                {
                    ui: {
                        label: 'OSC 1',
                        slot: 1,
                    },
                    buttonId: 'd2',
                    toggleable: {
                        state: false,
                        activeColor: '#00FFFF'
                    },
                    cb: (o) => {                         
                        this.toggleOscillator(1, o.ui.active);
                    }
                },
                {
                    ui: {
                        label: 'OSC 2',
                        slot: 2,
                    },
                    buttonId: 'd3',
                    toggleable: {
                        state: false,
                        activeColor: '#00FFFF'
                    },
                    cb: (o) => {                         
                        this.toggleOscillator(2, o.ui.active);
                    }
                }
            ],
            themeBg: true
        });

        const mixer = container.resolve(Mixer);
        this.synth = new ThreeOSCSynth();
        

        this.mixerChannel = mixer.getChannel(0);
        this.mixerChannel.connectInput(this.synth.out);        

        this.mainOutputWaveform = UITools.DrawAnalyzerWave(this.synth.mainAnalyser, 480, 200);    

        this.setupPadEvents();
    }

    toggleOscillator(idx: number, state: boolean) {
        const osc = this.synth.getOSC(idx);
        osc.on = state;
    }

    tick() {    
        this.ui.renderDisplayObject('left', this.draw());
    }

    isPlaying = false;
    activeNotes: string[] = [];
    updateInterval;

    setupPadEvents() {

        this.ebus.events.pipe(filter(e => e.type === 'PadInput')).subscribe(ev => {
            const [padName, action] = ev.name!.split(':');            
            const offNote = action === 'released';
            const note = AudioTools.padIndexToNote(padName, true);            
            const pIdx = parseInt(padName.replace("p", ''));            
            this.synth.playNote(note, pIdx, offNote);

            if(this.isPlaying && offNote) {
                this.activeNotes = this.activeNotes.filter(n => n !== note);
                console.log('Stopped playing', note, this.activeNotes);

                if(this.activeNotes.length === 0) {
                    this.isPlaying = false;
                    console.log('Stopped playing completely');
                    setTimeout(() => {
                        this.UITicker?.stop();
                    }, 100);
                    return;
                }
            } else if( !this.isPlaying) {
                this.isPlaying = true;
                console.log('started playing', note);
                this.activeNotes.push(note);

                if(!this.UITicker) {
                    this.UITicker = this.ui.app.ticker.add(() => this.tick());
                } else {
                    this.UITicker.start();
                }

            } else {                
                this.activeNotes.push(note);
                console.log('still playing, added', note);
            };
        });

    }    

    testDraw: any; // = new Graphics();

    override draw(): DisplayObject {            

        if(!this.testDraw) {
            this.testDraw = new Graphics();
            this.testDraw.beginFill("#FF00FF");
            this.testDraw.drawCircle(25, 25, 25);
            this.testDraw.endFill();
            this.containers.main.addChild(this.testDraw);
        }                

        /*const container = this.containers.main;
        container.removeChildren(0);
        
        container.addChild(this.mainOutputWaveform.graphics);
        this.mainOutputWaveform.update();        

        /*const txt = new Text("OscillatorWidget", {
            fill: '#ffffff'
        });
        txt.x = 10;
        txt.y = 10;
        container.addChild(txt);*/
        return super.draw();
    }

}

type OSC = {
    on: boolean,
    node: OscillatorNode,
    gain: GainNode,
    envelope: Envelope,
    analyzer: AnalyserNode
}

class ThreeOSCSynth {

    private audioCtx: AudioContext;
    private _out: GainNode;
    private _oscs: OSC[];
    private _gainControls: GainNode[];    

    public get mainAnalyser() {
        return this._mainAnalyser;
    }
    private _mainAnalyser: AnalyserNode;

    private _octave = 3;
    private _analyserFftSize = 512;

    public set anlyserFftSize(size: number) {
        this._analyserFftSize = size;
        this._mainAnalyser.fftSize = size;
    }

    public set octave(oct: number) {
        this._octave = oct;
    }

    public get out(): GainNode {
        return this._out;
    }

    public get oscs(): OSC[] {
        return this._oscs;
    }

    constructor() {
        const mixer = container.resolve(Mixer);
        this.audioCtx = mixer.audioCtx;
        this._out = this.audioCtx.createGain();                
        this._gainControls = [];
        this._oscs = [
            this.createOSC(),
            this.createOSC(),
            this.createOSC()
        ];
        this.initOSCs();
        
        this._mainAnalyser = this.audioCtx.createAnalyser();
        this._mainAnalyser.fftSize = this._analyserFftSize;                
        this._out.connect(this._mainAnalyser);
    }

    playEvents: Subject<string> = new Subject();    

    getOSC(idx: number): OSC{
        return this._oscs[idx];
    }

    toggleOSC(idx) {
        this._oscs[idx].on = !this._oscs[idx].on;

        if(this._oscs[idx].on) {
            this._oscs[idx].gain.gain.setValueAtTime(.5, this.audioCtx.currentTime);
        } else {
            this._oscs[idx].gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        }
    }

    connectToChannel(channel: Channel) {
        channel.connectInput(this._out);
    }

    playNote(note: string, pIdx: number, off?: boolean): void {

        if(off) {
            this._oscs.forEach(o => o.gain.gain.setValueAtTime(0, this.audioCtx.currentTime));
        } else {
            const freq = AudioTools.NoteToFrequency(note, this._octave);
            this._oscs.filter(o => o.on).forEach((o) => {
                o.node.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
                o.gain.gain.setValueAtTime(.5, this.audioCtx.currentTime);
            });
        }
    }
    

    /*
    activeNotes: string[] = [];

    playNote(note: string, pIdx: number, off?: boolean): void {
        
        if(!off) {
            //this.activeNotes.push(note + '_p' + pIdx);
            this.playEvents.next("PLAY");
        } else {
            this.playEvents.next("STOP");
            //this.activeNotes = this.activeNotes.filter(n => n !== note + '_p' + pIdx);
        }
        let noNotesPlaying = this.activeNotes.length === 0;        

        const currentOctave = pIdx > 9 ? this._octave + 1 : this._octave;
        const freq = AudioTools.NoteToFrequency(note, currentOctave);        

        this._oscs.forEach((osc, idx) => {            

            if(noNotesPlaying && off) {
                osc.envelope.stop();
                osc.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
            } else {
                if(osc.on) {
                    osc.gain.gain.setValueAtTime(.5, this.audioCtx.currentTime);
                    osc.node.frequency.exponentialRampToValueAtTime(
                        freq,
                        this.audioCtx.currentTime + 0.1 // Adjust the ramp time as needed
                    );                    
                }     
            }            

            if (!off) {
                osc.envelope.trigger(0.5, 0.2, 0.7, 0.5); // Adjust ADSR values as needed
            } else {
                osc.envelope.stop();
            }

        });        
    }*/    

    private createOSC(): OSC {
        const node = this.audioCtx.createOscillator();
        node.frequency.value = 440;
        node.type = 'sine';
        const nodeGain = this.audioCtx.createGain();
        nodeGain.gain.setValueAtTime(.5, this.audioCtx.currentTime);
        node.connect(nodeGain);
        nodeGain.connect(this._out);
        this._gainControls.push(nodeGain);

        const analyzer = this.audioCtx.createAnalyser();
        analyzer.fftSize = 1024;
        node.connect(analyzer);

        return {
            node,
            gain: nodeGain,
            analyzer,
            envelope: new Envelope(this.audioCtx),
            on: false
        };
    }

    private initOSCs() {
        this._oscs.forEach(osc => {
            osc.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
            osc.node.start();
            osc.node.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        });        
    }
}

class Envelope {
    audioCtx: AudioContext;
    gainNode: GainNode
    constructor(audioContext: AudioContext) {
      this.audioCtx = audioContext;
      this.gainNode = this.audioCtx.createGain();
    }
    
    stop() {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }

    trigger(attack, decay, sustain, release) {
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime   
   + attack);
      this.gainNode.gain.linearRampToValueAtTime(sustain, this.audioCtx.currentTime + attack + decay);
      this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + attack + decay + release);
    }
  
    connect(destination) {
      this.gainNode.connect(destination);
    }
  }