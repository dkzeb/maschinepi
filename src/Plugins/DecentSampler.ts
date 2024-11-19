import { ChildProcess, spawn } from "child_process";

type PluginOptions = {
    isExectuable: boolean;
    execPath?: string;
    args?: string[]
}

export class Plugin {

    pluginProcess?: ChildProcess;

    constructor(pluginOptions?: PluginOptions) {
        if(pluginOptions?.isExectuable && pluginOptions.execPath) {
            let cmd = pluginOptions.execPath;
            if(pluginOptions.args && pluginOptions.args.length > 0) {
                cmd += ' ';
                pluginOptions.args.forEach(arg => {
                    cmd += arg + ' ';
                });
                cmd = cmd.trim();
            }

            this.pluginProcess = spawn(cmd);
            this.pluginProcess.on('message', (msg) => console.log(msg));
        }
    }
}

export class DecentSampler extends Plugin {
    constructor() {
        super({
            isExectuable: true,
            execPath: process.cwd() + '/vendor/DecentSampler.exe'
        });
    }
}