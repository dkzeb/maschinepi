import { UITools } from '../UI/UITools';
import { Widget } from './Widget';
import * as os from 'os';
import * as pkg from '../../package.json';

export class SysInfoWidget extends Widget<SysInfoWidget> {
    static readonly discriminator: string = 'SysInfoWidget';
    constructor() {
        super({
            discriminator: SysInfoWidget.discriminator
        })
    }
    
    async render(): Promise<string> {
        if(this.canvas && this.ctx) {                                    

            UITools.DrawModal(this.ctx, {
                width: this.canvas.width,
                height: this.canvas.height,
                title: 'System Info'
            });
            
            const systemInfo = await this.getInfo();
            let startingPoint = { x: 40, y: 65 };
            
            UITools.DrawText(this.ctx, {
                text: `
                MaschinePI Version: ${pkg.version}
                Node Version: ${JSON.stringify(process.versions.node)}
                V8 Version: ${JSON.stringify(process.versions.v8)}

                OS: ${systemInfo.os.sys} (${systemInfo.os.release})
                Memory: ${ Math.round( systemInfo.memory.free / 1048576 ) } / ${ Math.round( systemInfo.memory.total  / 1048576 ) } (MB)
                CPU: ${ systemInfo.cpu[0].model.trim() } (Logical Units: ${ systemInfo.cpu.length })
                
                System User: ${ systemInfo.user.username }
                User Homedir: ${ systemInfo.user.homedir}
                
                System Uptime: ${ systemInfo.uptime }
                `,
                position: startingPoint,                
            });

            /*
            
            const formattedInfo: string[] = [
                `OS: ${systemInfo.os.sys} (${systemInfo.os.release})`,
                `Memory: ${ Math.round( systemInfo.memory.free / 1048576 ) } / ${ Math.round( systemInfo.memory.total  / 1048576 ) } (MB)`,
                `CPU: ${ systemInfo.cpu[0].model.trim() } (Logical Units: ${ systemInfo.cpu.length })`,
                ``,
                `System User: ${ systemInfo.user.username }`,
                `User Homedir: ${ systemInfo.user.homedir}`
            ];
            
            
            let offset = 0;
            let lineHeight = 15;

            formattedInfo.forEach(l => {
                this.ctx?.fillText(l, startingPoint.x, startingPoint.y + offset);
                offset += lineHeight;
            })
            this.ctx.fillStyle = fillStyle;            
            
*/
            return this.canvas.toDataURL("image/jpeg");
        } else {
            throw Error("SysInfoWidget has no CVS/CTX");
        }
    }    

    async getInfo() {
        const info = {
            os: { sys: await os.platform(), release: await os.release() },
            memory: {
                free: await os.freemem(), total: await os.totalmem()
            },            
            cpu: await os.cpus(),
            network: await os.networkInterfaces(),
            user: await os.userInfo(),
            uptime: this.formatMS(await os.uptime())
        }
    
        return info;
    }

    private formatMS(duration: number) {
        const portions: string[] = [];
      
        const msInHour = 1000 * 60 * 60;
        const hours = Math.trunc(duration / msInHour);
        if (hours > 0) {
          portions.push(hours + 'h');
          duration = duration - (hours * msInHour);
        }
      
        const msInMinute = 1000 * 60;
        const minutes = Math.trunc(duration / msInMinute);
        if (minutes > 0) {
          portions.push(minutes + 'm');
          duration = duration - (minutes * msInMinute);
        }
      
        const seconds = Math.trunc(duration / 1000);
        if (seconds > 0) {
          portions.push(seconds + 's');
        }
      
        return portions.join(' ');
      }
}
