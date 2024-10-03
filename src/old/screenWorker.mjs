import { parentPort } from 'node:worker_threads';
import r from 'raylib';

parentPort.on('message', (msg) => {
    console.log('we got msg');
    if(msg === 'INIT') {
        init();
    }
});

function init() {
    let frameCount = 0;
    // init this shit! yay!
    r.SetTargetFPS(60);
    r.InitWindow(800, 480, 'Worker Thread');
    while(!r.WindowShouldClose()) {
        r.BeginDrawing();
        r.ClearBackground(r.BLACK);
        frameCount++;
        r.DrawText("Frame " + frameCount, 10, 10, 12, r.WHITE);
        r.EndDrawing();
    }
    r.CloseWindow();
}