import { EventBus } from "./classes/EventBus";
import { Mixer } from "./classes/Mixer";
import { Pad } from "./classes/Modes/PadMode";
import { SoundEngine } from "./classes/SoundEngine";
import { StorageController } from "./classes/StorageController";



(async () => {  
    const sc = new StorageController();
    const mixer = new Mixer();

    const group1 = mixer.groups[0];
    const p1 = new Pad('white', 'p1', false, group1);
    const p2 = new Pad('white', 'p2', false, group1);    

    p1.loadSample('hat 04.wav');
    p2.loadSample('kick 04.wav');

    setInterval(()=>{
        p1.play();
        p2.play();
    }, 1000);

})();