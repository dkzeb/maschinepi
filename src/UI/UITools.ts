import { CanvasRenderingContext2D } from "canvas";

type ModalOptions = {
    height: number,
    width: number,
    title?: string,
    dismissable?: boolean // TODO: expand on modal system to enable modal results, dismissables, etc...
};

type TextOptions = {
    text: string,
    position: {
        x: number,
        y: number,
    },
    maxWidth?: number
}

export class UITools {    

    public static DrawModal(ctx: CanvasRenderingContext2D, opts: ModalOptions): void {        

        const origFillstyle = ctx.fillStyle;
        const origStrokeStyle = ctx.strokeStyle;

        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, opts.width, opts.height);

        // draw a nice box
        ctx.strokeStyle = 'white';
        ctx.strokeRect(10, 10, opts.width - 20, opts.height - 20);

        // title
        ctx.fillStyle = 'white';
        if(opts.title) {
            const tAlign = ctx.textAlign;
            ctx.textAlign = 'center';
            ctx.fillText(opts.title, opts.width / 2, 25);
            ctx.textAlign = tAlign;
        }
        if(opts.title) {
            ctx.beginPath();
            ctx.moveTo(10, 35);
            ctx.lineTo(opts.width - 10, 35);
            ctx.closePath();
            ctx.stroke();
        } else {
            ctx.fillRect(10, 10, opts.width - 20, 25);
        }

        ctx.fillStyle = origFillstyle;
        ctx.strokeStyle = origStrokeStyle;
    }

    public static DrawText(ctx: CanvasRenderingContext2D, opts: TextOptions): void {
        const origFillstyle = ctx.fillStyle;            
        ctx.fillStyle = 'white';

        const formatted = opts.text.split('\n');
        let offset = 0;
            let lineHeight = 15;
            
        formatted.forEach((l, idx) => {
            if(l === '' && idx === 0) {
                return;
            }

            ctx.fillText(l.trim(), opts.position.x, opts.position.y + offset);
            offset += lineHeight;            
        });

        ctx.fillStyle = origFillstyle;
    }
}