import { DisplayObject } from "@pixi/node";
import { PixiWidget } from "./PixiWidget";
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

    constructor() {
        super({
            name: 'OscillatorWidget',
            titlebar: {
                color: '#ffffff',
                title: 'OSC MonoSynth',
                icon: 'keys'
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
                //console.log('Stopped playing', note, this.activeNotes);
                if(this.activeNotes.length === 0) {
                    this.isPlaying = false;
                    //console.log('Stopped playing completely');                                                            
                    return;
                }
            } else if( !this.isPlaying) {
                this.isPlaying = true;
                //console.log('started playing', note);
                this.activeNotes.push(note);                
                
            } else {                
                this.activeNotes.push(note);
                //console.log('still playing, added', note);
            };
        });

    }    

    testDraw: any; // = new Graphics();

    tickerTime = 0;

    override draw(): DisplayObject {                            
        this.containers.main.addChild(this.mainOutputWaveform.graphics);        
        this.uiCtrl.app.ticker.add(() => {                                                    
            this.mainOutputWaveform.update();
            this.tickerTime = 0;            
        });
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