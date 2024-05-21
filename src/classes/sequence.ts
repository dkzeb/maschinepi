export class Sequence {
    seq: number[][];
    _currentIndex: number = 0;

    constructor(seq?: number[][]) {
        this.seq = seq;
    }

    get length(): number {
        return this.seq[0].length;
    }

    tick(): number[] {
        const slice = [];
        this.seq.forEach(s => {
            slice.push(s[this._currentIndex])
        });
        this._currentIndex++;
        if(this._currentIndex === this.seq[0].length) {
            this._currentIndex = 0;
        }
        return slice;
    }
}