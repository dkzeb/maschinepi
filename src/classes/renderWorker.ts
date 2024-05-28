require('ts-node').register();

const { parentPort } = require('node:worker_threads');
const r = require('raylib');

let jobs: string[] = [];
let isBusy = false;

parentPort.on('message', (msg) => {        
    // msg will be a function to run, add it to jobs
    if(!jobs) {
        jobs = [];
    }
    jobs.push(msg);
    if(!isBusy) {
        work();
    }
});

async function work() {
    if(!jobs) {
        jobs = [];
    }
    while(jobs.length > 0) {
        isBusy = true;
        const j = jobs.shift();        
        if(j && typeof j === 'string') {            
            eval(j)();            
        }
    }
    isBusy = false;
} // no job no run 

setInterval(() => {    
    work();
}, 1000 / 60);