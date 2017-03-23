import { IEventSource } from "../Interfaces/IEventSource";
import { IPropertyChangeEventSource } from "../Interfaces/IPropertyChangeEventSource";
import { EditorModes } from "../Modules/Common"
import { ThumbnailData } from "../Modules/ThumbnailData";
import { AMVEUX } from "../Modules/AMVEUX";

module AMVE {
    /**
     * Resultant AMVE clip data output
     */
    export class AMVEClipData implements IPropertyChangeEventSource  {
        private _src: string;
        private _markIn: number = -1;
        private _markOut: number = -1;
        private _markInPT: number = -1;
        private _markOutPT: number = -1;
        private _title: string;
        private _description: string;
        private _thumbnail: ThumbnailData;
        private _isClipCompleted: boolean = false;
        private _amveUX: AMVEUX;
        private _eventHandlers = {};
        private _negativeMarkCount: number = 0;
        private _negativeMarkThreshold: number = 10;


        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;

            this._amveUX.player.addEventListener(amp.eventName.timeupdate, function () {
                if (!that._amveUX.isScrubbing && that.markInPT >= 0) {
                    var markIn = that._amveUX.fromMediaTime(that.markIn);
                    var markOut = that._amveUX.fromMediaTime(that.markOut);
                    if (markIn < 0) {
                        // HACK for PTO repoerting in chrome
                        if (that._negativeMarkCount >= that._negativeMarkThreshold) {
                            that.markInPT = -1;
                            that.markOutPT = -1;
                            that._negativeMarkCount = 0;
                        } else {
                            that._negativeMarkCount++;
                        }
                    } else {
                        that._negativeMarkCount = 0;
                    }
                    if (markOut < 0) {
                        // HACK for PTO repoerting in chrome
                        if (that._negativeMarkCount >= 5) {
                            that.markOutPT = -1;
                        } 
                    } else {
                        that._negativeMarkCount = 0;
                    }
                    if (markIn >= 0 && (markOut - markIn) < that._amveUX.minClipDuration) {
                        // HACK for PTO repoerting in chrome
                        if (that._negativeMarkCount >= 5) {
                            that.markOutPT = -1;
                        }
                    }
                } 
            });
        }

        /** PROPERTIES */
        /**
         * Returns the src
         */
        public get src(): string {
            return this._src;
        }

        /**
         * Sets the src
         * Triggers event
         */
        public set src(src: string) {
            if (src != this._src) {
                this._src = src;
                this.propertyChanged('src');
            }
        }

        /**
         * Returns the markIn
         */
        public get markIn(): number {
            return this._markIn;
        }

        /**
         * Returns the markOut
         */
        public get markOut(): number {
            return this._markOut;
        }

        /**
         * Returns the markInPT
         */
        public get markInPT(): number {
            return this._markInPT;
        }

        /**
         * Sets the markInPT
         * Triggers event
         */
        public set markInPT(markInPT: number) {
            if (markInPT != this._markInPT) {
                this._markInPT = markInPT;
                this.propertyChanged('markInPT');
                if (markInPT > 0) {
                    this._markIn = this._amveUX.toMediaTime(markInPT);
                } else {
                    this._markIn = -1;
                }
                this.propertyChanged('markIn');
                if (this.markOutPT > 0 && markInPT >= this.markOutPT) {
                    this.markOutPT = markInPT + this._amveUX.minClipDuration;
                }
            }
        }

        /**
         * Returns the markOutPT
         */
        public get markOutPT(): number {
            return this._markOutPT;
        }

        /**
         * Sets the 
         * Triggers event
         */
        public set markOutPT(markOutPT: number) {
            if (markOutPT != this._markOutPT) {
                if (this.markInPT >= 0 && markOutPT <= this.markInPT) {
                    markOutPT = this.markInPT + this._amveUX.minClipDuration;
                }
                this._markOutPT = markOutPT;
                this.propertyChanged('markOutPT');
                if (markOutPT > 0) {
                    this._markOut = this._amveUX.toMediaTime(markOutPT);
                } else {
                    this._markOut = -1;
                }
                this.propertyChanged('markOut');
            }
        }

        /**
         * Returns the title
         */
        public get title(): string {
            return this._title;
        }

        /**
         * Sets the 
         * Triggers event
         */
        public set title(title: string) {
            if (title != this._title) {
                this._title = title;
                this.propertyChanged('title');
            }
        }

        /**
         * Returns the description
         */
        public get description(): string {
            return this._description;
        }

        /**
         * Sets the 
         * Triggers event
         */
        public set description(description: string) {
            if (description != this._description) {
                this._description = description;
                this.propertyChanged('description');
            }
        }

        /**
         * Returns the thumbnail
         */
        public get thumbnail(): ThumbnailData {
            return this._thumbnail;
        }

        /**
         * Sets the thumbnail
         * Triggers event
         */
        public set thumbnail(thumbnail: ThumbnailData) {
            if (thumbnail != this._thumbnail) {
                this._thumbnail = thumbnail;
                this.propertyChanged('thumbnail');
            }
        }

        /**
         * Returns the isClipCompleted
         */
        public get isClipCompleted(): boolean {
            return this._isClipCompleted;
        }

        /**
         * Sets the isClipCompleted
         * Triggers event
         */
        public set isClipCompleted(isClipCompleted : boolean) {
            this._isClipCompleted = isClipCompleted;
            this.propertyChanged('isClipCompleted');
        }

        /** METHODS **/

        /**
         * Given a time mark, uses the current EditorMode to calculate and return the appropriate closest editing time
         *
         * @param  {number} mark the target time in seconds
         * @return {number} resultant scrutinized mark time in seconds
         */
        private scrutinizeMark(mark: number): number {
            switch (this._amveUX.mode) {
                case EditorModes.Rendered:
                    return this._amveUX.closestFrame(mark, -1);
                case EditorModes.Trim:
                    return this._amveUX.closestGop(mark, -1);
                case EditorModes.Virtual:
                    return this._amveUX.closestGop(mark, -1);
            }
        }

        /** IPropertyChangeEventSource Implementation */
        /**
         * See Interface
         */
        public addPropertyChangedListener(property: string, propertyChangedListener: EventListener) {
            this.addEventListener(property, propertyChangedListener);
        }

        /**
         * See Interface
         */
        public removePropertyChangedListener(property: string, propertyChangedListener: EventListener) {
            this.removeEventListener(property, propertyChangedListener);
        }

        /**
         * See Interface
         */
        public propertyChanged(property: string) {
            this.trigger(property);
        }

        /** IEventSource Implementation */
        /**
         * See Interface
         */
        public addEventListener(event: string, handler: EventListener) {
            this._eventHandlers[event] = this._eventHandlers[event] || [];
            this._eventHandlers[event].push(handler);
        }

        /**
         * See Interface
         */
        public removeEventListener(event: string, handler: EventListener) {
            this._eventHandlers[event] = this._eventHandlers[event] || [];
            this._eventHandlers[event].pop(handler);
        }

        /**
         * See Interface
         */
        public trigger(event: string) {
            var handlers = this._eventHandlers[event];
            if (handlers) {
                for (var i = 0; i < handlers.length; i += 1) {
                    handlers[i](event);
                }
            }
        }
    }
}

export = AMVE;
