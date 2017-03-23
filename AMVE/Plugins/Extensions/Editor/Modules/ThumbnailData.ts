module AMVE {
    /**
     * Class for holding generated thumbnail properties
     */
    export class ThumbnailData {
        private _time: number = -1;
        private _dataUrl: string = null;
        private _width: number = null;
        private _height: number = null;
        private _imageType: string = null;

        constructor(time: number, dataUrl: string, width: number, height: number, imagetype: string) {
            this._time = time;
            this._dataUrl = dataUrl;
            this._width = width;
            this._height = height;
            this._imageType = imagetype;

        }

        public get time(): number {
            return this._time;
        }

        public get dataUrl(): string {
            return this._dataUrl;
        }

        public get width(): number {
            return this._width;
        }

        public get height(): number {
            return this._height;
        }

        public get imageType(): string {
            return this._imageType;
        }

        public get data(): string {
            if (this._dataUrl != null && this._imageType != null) {
                var foundtypestridx = this._dataUrl.indexOf('base64,');
                if (foundtypestridx >= 0) {
                    return this._dataUrl.substr(foundtypestridx + 'base64,'.length,
                        this._dataUrl.length - foundtypestridx + 1);
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
    }
}

export = AMVE;
