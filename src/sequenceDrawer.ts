export interface Sequence {
    elements: number[];
    max: number;
}

interface MyWindow extends Window {
    webkitRequestAnimationFrame: any;
    mozRequestAnimationFrame: any;
    msRequestAnimationFrame: any;
}

export interface SequenceDrawerOptions {
    framesPerElem? : number;
    currentStepCallback?: (step: number) => void;        
}

export class SequenceDrawer {

    private _done: boolean;

    constructor(private canvas: HTMLCanvasElement) {

    }

    drawSequence(seq: Sequence, options: SequenceDrawerOptions) {

        this._done = false;

        // Set defaults
        options.framesPerElem = options.framesPerElem || 15;

        // Cross-browser support for requestAnimationFrame
        let w = window as MyWindow;
        let requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

        var then = Date.now();

        let currentFrame = 0;

        let mainLoop = () => {
            var now = Date.now();
            var delta = now - then;

            currentFrame += delta / (1000 / 60);

            this.drawElems(seq, options, currentFrame);
            then = now;

            if (!this._done)
                requestAnimationFrame(mainLoop);
        };

        // Kick it off
        requestAnimationFrame(mainLoop);
    }

    private findXCoord(val: number, max: number): number {
        let width = this.canvas.clientWidth;
        let ratio = (val - 1.0) / max;

        return width * ratio;
    }

    private findYCoord(xCoord: number): number {
        var baseLine = this.canvas.clientHeight / 2;
        return baseLine;
    }

    private findMidpoint(x1: number, y1: number, x2: number, y2: number): { x: number, y: number } {
        let x = (x1 + x2) / 2.0;
        let y = (y1 + y2) / 2.0;

        return { x: x, y: y };
    }

    private findDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    private drawElems(sequence: Sequence, options: SequenceDrawerOptions, currentFrame: number): void {

        let framesPerElem = options.framesPerElem;

        let ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let lastX = this.findXCoord(sequence.elements[0], sequence.max);
        let lastY = this.findYCoord(lastX);

        let parity = 1;

        for (var i = 1; (i < sequence.elements.length) && ((i - 1) * framesPerElem < currentFrame); i++) {            
            let thisX = this.findXCoord(sequence.elements[i], sequence.max);
            let thisY = this.findYCoord(thisX);

            let center = this.findMidpoint(lastX, lastY, thisX, thisY);
            let radius = this.findDistance(lastX, lastY, thisX, thisY) / 2.0;

            let curveStepFactor = 1;
            if (i * framesPerElem >= currentFrame) {
                curveStepFactor = (currentFrame % framesPerElem) / framesPerElem;
            }

            ctx.beginPath();

            if (parity === 1) {
                if (thisX > lastX) {
                    ctx.arc(center.x, center.y, radius, Math.PI, Math.PI + (curveStepFactor * Math.PI));
                } else {
                    ctx.arc(center.x, center.y, radius, 2 * Math.PI - (curveStepFactor * Math.PI), 2 * Math.PI);
                }
            } else {
                if (thisX > lastX) {
                    ctx.arc(center.x, center.y, radius, Math.PI - (curveStepFactor * Math.PI), Math.PI);
                } else {
                    ctx.arc(center.x, center.y, radius, 0, (curveStepFactor * Math.PI));
                }
            }
            ctx.stroke();

            lastX = thisX;
            lastY = thisY;
            parity = 1 - parity;
        }

        if (options.currentStepCallback)
            options.currentStepCallback(i);

        if (currentFrame / framesPerElem > sequence.max) {
            this._done = true;
        }
    }
}