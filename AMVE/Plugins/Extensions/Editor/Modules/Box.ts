module AMVE {
    /**
     * Internal class used for positioning elements
     */
    export class Box {
        public left: number;
        public top: number;
        public right: number;
        public bottom: number;
        public height: number;
        public width: number;

        public static buildBox(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0, height: number = 0, width: number = 0) {
            var box = new Box();
            box.left = left;
            box.top = top;
            box.right = right;
            box.bottom = bottom;
            box.height = height;
            box.width = width;
            return box;
        }

        // May need to change to DOMRect in later versions of TypeScript
        public static fromClientRect(clientRect: ClientRect): Box {
            var box = new Box();
            box.left = clientRect.left;
            box.right = clientRect.right;
            box.top = clientRect.top;
            box.bottom = clientRect.bottom;
            box.height = clientRect.height;
            box.width = clientRect.width;
            return box;
        }
    }
}

export = AMVE;
