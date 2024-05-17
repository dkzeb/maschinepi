/*import { SoundEngine } from "../tmp/classes/soundEngine";
import { StorageController } from "../tmp/classes/storage";

declare const global: { se: SoundEngine, db: StorageController };

(async () => {
    const soundEngine = new SoundEngine();
    global.se = soundEngine; // so as to not get garbage collected    

    const storage = new StorageController();
    global.db = storage;
})();*/

import { el, Renderer } from '@elemaudio/core';


// Here we're using a default Renderer instance, so it's our responsibility to
// send the instruction batches to the underlying engine
let core = new Renderer((batch) => {
  // Send the instruction batch somewhere: you can set up whatever message
  // passing channel you want!
  console.log(batch);
});

// Now we can write and render audio. How about some binaural beating
// with two detuned sine tones in the left and right channel:
core.render(el.cycle(440), el.cycle(441));