// interface Array<T> {
//     findFirst(predicate: Function): T;
//     findIndexOf(predicate: Function): number;
// }

// /**
//  * Find the first element in the Array which matches the given predicate.
//  */
// Object.defineProperty(Array.prototype, "findFirst", {
//     value: function (predicate: Function) {
//         for (var idx = 0; idx < this.length; idx++) {
//             var value = this[idx];
//             if (predicate.call(this, value, idx, Object(this))) {
//                 return value;
//             }
//         }
//         return null;
//     },
//     enumerable: false,
//     configurable: true
// });

// function findFirst<T>(array: Array<T>, predicate: (value: T, idx: number) => boolean): T | null {
//     for (var idx: number = 0; idx < array.length; idx++) {
//         const value: T = array[idx];
//         if (predicate(value, idx)) {
//             return value;
//         }
//     }
//     return null;
// }


// /**
//  * Find the index of the first element in the Array which matches the given predicate.
//  */
// Object.defineProperty(Array.prototype, "findIndexOf", {
//     value: function (predicate: Function) {
//         for (var idx = 0; idx < this.length; idx++) {
//             var value = this[idx];
//             if (predicate.call(this, value, idx, Object(this))) {
//                 return idx;
//             }
//         }
//         return -1;
//     },
//     enumerable: false,
//     configurable: true
// });

module AMVE {
    /**
     * Internal enum for specifying the current editor mode.
     */
    export enum EditorModes {
        Trim,
        Virtual,
        Rendered
    }

    /**
     * Public enum used for specifying the source stream's framerate.  
     * Currently used to populate a SELECT in the settings dialog. 
     */
    export enum AMVEFrameRates {
        TwentyThreeNineSevenSixFPS,
        TwentyFiveFPS,
        TwentyNineNineSevenSixFPS,
        ThirtyFPS,
        SixtyFPS
    }
}

export = AMVE;
