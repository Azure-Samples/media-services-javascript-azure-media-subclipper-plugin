import { EditorModes } from "../Modules/Common"
import { AMVEUX } from "../Modules/AMVEUX";

module AMVE {
    /**
     * Internal class used by AMVEUX to build the main timeline and scrubber
     */
    export class AMVEScrubber {
        private _amveUX: AMVEUX;
        private _scrubberElement: HTMLElement;
        private _scrubberZoomElement: HTMLElement;
        private _scrubberZoomInElement: HTMLElement;
        private _scrubberZoomOutElement: HTMLElement;
        private _scrubberProgressElement: HTMLElement;
        private _scrubberMarkFillElement: HTMLElement;
        private _scrubberHandleElement: HTMLElement;
        private _scrubbingTimeoutFlag: boolean = false;
        private _scrubbingTimeoutInterval: number = 1000;
        private _isScrubbing = false;
        private _lastTime: number = 0;
        private _zoomFactor: number = 0;
        private _maxZoom: number = 8;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;
            this._amveUX.player.addEventListener('timeupdate', onTimeUpdate);
            this._amveUX.player.addEventListener('resize', onResize);

            this._amveUX.clipData.addPropertyChangedListener('markInPT', onMark);
            this._amveUX.clipData.addPropertyChangedListener('markOutPT', onMark);

            this._scrubberElement =
                this._amveUX.createElement(['amve-scrubber']);
            this._amveUX.appendBottomChild(this._scrubberElement);

            this._scrubberZoomElement =
                this._amveUX.createElement(['amve-scrubber-zoom']);
            this._scrubberElement.appendChild(this._scrubberZoomElement);

            this._scrubberZoomInElement =
                this._amveUX.createElement(['amve-btn', 'amve-scrubber-zoom-in']);
            this._scrubberZoomElement.appendChild(this._scrubberZoomInElement);

            this._scrubberZoomOutElement =
                this._amveUX.createElement(['amve-btn', 'amve-scrubber-zoom-out']);
            this._scrubberZoomElement.appendChild(this._scrubberZoomOutElement);

            this._scrubberProgressElement =
                this._amveUX.createElement(['amve-scrubber-progress']);
            this._scrubberElement.appendChild(this._scrubberProgressElement);

            this._scrubberMarkFillElement =
                this._amveUX.createElement(['amve-scrubber-markfill']);
            this._scrubberElement.appendChild(this._scrubberMarkFillElement);

            this._scrubberHandleElement =
                this._amveUX.createElement(['amve-scrubber-handle']);
            this._amveUX.appendBottomChild(this._scrubberHandleElement);

            this._scrubberHandleElement.addEventListener('mousedown', onScrubberPointerDown);
            this._scrubberHandleElement.addEventListener('touchstart', onScrubberPointerDown);
            this._scrubberHandleElement.addEventListener('pointerdown', onScrubberPointerDown);

            this._scrubberElement.addEventListener('mousedown', onScrubberPointerDown);
            this._scrubberElement.addEventListener('touchstart', onScrubberPointerDown);
            this._scrubberElement.addEventListener('pointerdown', onScrubberPointerDown);

            this._amveUX.addContainerEventListener('mouseup', onScrubberPointerUp);
            this._amveUX.addContainerEventListener('touchend', onScrubberPointerUp);
            this._amveUX.addContainerEventListener('pointerup', onScrubberPointerUp);
            this._amveUX.addContainerEventListener('mouseleave', onScrubberPointerUp);

            this._amveUX.addContainerEventListener('mousemove', onScrubberPointerMove);
            this._amveUX.addContainerEventListener('touchmove', onScrubberPointerMove);
            this._amveUX.addContainerEventListener('pointermove', onScrubberPointerMove);

            /**
             * Positions the scrubber handle and fills the scrubber bar on player time update
             */
            function onTimeUpdate(): void {
                if (!that._isScrubbing) {
                    positionScrubber(null);
                    onMark();
                }
            }

            /**
             * Positions the scrubber handle and fills the scrubber bar on resize
             */
            function onResize(): void {
                positionScrubber(null);
                onMark();
            }

            /**
             * When markIn and markOut are set, Positions and fills a div on the scrubber bar
             * representing the clip length
             */
            function onMark(): void {
                if (that._amveUX.clipData.markIn >= 0 && (that._amveUX.mode == EditorModes.Trim || that._amveUX.clipData.markOut > 0)) {
                    var markIn = that._amveUX.fromMediaTime(that._amveUX.clipData.markIn);
                    var markOut = that._amveUX.fromMediaTime(that._amveUX.clipData.markOut);
                    var markInPct = that._amveUX.getDurationPercentage(markIn);
                    var markOutPct = that._amveUX.mode == EditorModes.Trim ? 1 : that._amveUX.getDurationPercentage(markOut);
                    var clipWidthPct = markOutPct - markInPct;
                    var left = that._amveUX.getCWPercentage(markIn , that._scrubberElement);
                    var width = Math.round((that._scrubberElement.clientWidth * clipWidthPct));
                    that._scrubberMarkFillElement.style.left = left + 'px';
                    that._scrubberMarkFillElement.style.width = width + 'px';
                    that._scrubberMarkFillElement.style.display = 'block';
                } else {
                    that._scrubberMarkFillElement.style.display = 'none';
                }
            }

            /**
             * Interaction with the scrubber handle has started
             * 
             * @param  {evt} evt the associated pointer event
             */
            function onScrubberPointerDown(evt: Event): void {
                that._scrubberElement.style.cursor = 'pointer';
                that._isScrubbing = true;
                that._amveUX.isScrubbing = true;
            }

            /**
             * Interaction with the scrubber handle has stopped, sets the player time
             * 
             * @param  {evt} evt the associated pointer event
             */
            function onScrubberPointerUp(evt: Event): void {
                if (that._isScrubbing) {
                    that._scrubberElement.style.cursor = 'default';
                    that._isScrubbing = false;
                    var duration = that._amveUX.player.duration();
                    var newTime = that._amveUX.calculateDistanceX(evt, that._scrubberElement) * duration;
                    if (newTime != that._amveUX.player.currentTime()) {
                        // Don't let video end while scrubbing.
                        if (newTime == duration) { newTime = newTime - 0.1; }
                        that._amveUX.player.currentTime(newTime);
                    }
                    that._amveUX.isScrubbing = false;
                }
            }

            /**
             * Pointer has moved, See positionScrubber
             * 
             * @param  {evt} evt the associated pointer event
             */
            function onScrubberPointerMove(evt: Event): void {
                if (that._isScrubbing) {
                    positionScrubber(evt);
                }
            }

            /**
             * Positions the scrubber elements, fills the scrubber bar, 
             * sets a timeout to set the player time 
             * (There is an issue with AMP in setting layer time too frequently)
             * 
             * @param  {evt} evt the associated pointer event
             */
            function positionScrubber(evt: Event): void {
                var newTime = that._amveUX.player.currentTime();
                var duration = that._amveUX.player.duration();

                if (that._isScrubbing && evt) {
                    var newTime = that._amveUX.calculateDistanceX(evt, that._scrubberElement) * duration;

                    // Don't let video end while scrubbing.
                    if (newTime == duration) { newTime = newTime - 0.1; }
                }

                var rootBox = that._amveUX.findPosition(that._amveUX.containerElement);
                var seBox = that._amveUX.findPosition(that._scrubberElement);
                var cwp = that._amveUX.getCWPercentage(newTime, that._scrubberElement);
                var left = (seBox.left - rootBox.left - that._scrubberHandleElement.clientWidth) + 10 + cwp;
                that._scrubberHandleElement.style.left = left + 'px';
                that._scrubberProgressElement.style.width = cwp + 'px';
            }

            /**
             * Timeout callback for setting player time
             */
            function setScrubtimeTimeout() {
                that._amveUX.player.currentTime(that._lastTime);
                that._scrubbingTimeoutFlag = false;
            }
        }

        /**
         * The overall clientHeight of the AMVEScrubber 
         * 
         * @return {number} The overall clientHeight of the AMVEScrubber 
         */
        public get clientHeight(): number {
            return this._scrubberElement.clientHeight;
        }
    }
}

export = AMVE;
