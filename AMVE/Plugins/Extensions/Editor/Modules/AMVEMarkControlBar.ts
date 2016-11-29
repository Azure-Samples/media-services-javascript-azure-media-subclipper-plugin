/// <reference path='../Modules/Common.ts' />
/// <reference path='../Modules/AMVEUX.ts' />

"use strict";

module AMVE {
    /**
     * Internal class used by AMVEUX to build the mark timeline with the marin/out handles
     */
    export class AMVEMarkControlBar {
        private _amveUX: AMVEUX;
        private _markControlElement: HTMLElement;
        private _markFillElement: HTMLElement;
        private _markInElement: HTMLElement;
        private _markOutElement: HTMLElement;
        private _markInWarning: HTMLElement;
        private _markOutWarning: HTMLElement;
        private _isMarkInClipping: boolean = false;
        private _isMarkOutClipping: boolean = false;
        private _preModeChangeMarkOutPlayerTime: number = -1;
        private _preModeChangeMarkOutMediaTime: number = -1;
        private _normalMarkForeground: string = 'rgb(255,255,255)';
        private _warnTimeout: number = 5000;
        private _warnMarkInLastShown: number = -1;
        private _warnMarkOutLastShown: number = -1;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;

            this._markControlElement =
                this._amveUX.createElement(['amve-mark-controlbar']);
            this._amveUX.appendBottomChild(this._markControlElement);

            this._markFillElement =
                this._amveUX.createElement(['amve-mark-fill']);
            this._markControlElement.appendChild(this._markFillElement);

            this._markInElement =
                this._amveUX.createElement(['amve-mark-in']);
            this._markControlElement.appendChild(this._markInElement);

            this._markOutElement =
                this._amveUX.createElement(['amve-mark-out']);
            this._markControlElement.appendChild(this._markOutElement);

            this._markInWarning =
                this._amveUX.createElement(['amve-mark-in-warning']);
            this._markControlElement.appendChild(this._markInWarning);

            this._markOutWarning =
                this._amveUX.createElement(['amve-mark-in-warning']);
            this._markControlElement.appendChild(this._markOutWarning);

            this._amveUX.addPropertyChangedListener('mode', function () {
                switch (that._amveUX.mode) {
                    case EditorModes.Trim:
                        that._preModeChangeMarkOutPlayerTime = that._amveUX.clipData.markOutPT;
                        that._amveUX.clipData.markOutPT = -1;
                        that._markOutElement.style.display = 'none';
                        that.onMark();
                        break;
                    case EditorModes.Virtual:
                        if (that._amveUX.clipData.markOutPT <= 0) {
                            var time = that._amveUX.player.currentTime();
                            that._amveUX.clipData.markOutPT = that._preModeChangeMarkOutPlayerTime;
                            that._amveUX.player.currentTime(time);
                        }
                        break;
                    case EditorModes.Rendered:
                        if (that._amveUX.clipData.markOutPT <= 0) {
                            var time = that._amveUX.player.currentTime();
                            that._amveUX.clipData.markOutPT = that._preModeChangeMarkOutPlayerTime;
                            that._amveUX.player.currentTime(time);
                        }
                        break;
                }
            });

            /**
             * Once the first segment has loaded, wires upthe mark elements
             */
            this._amveUX.player.addEventListener('loadedmetadata', function () {
                that._amveUX.player.addEventListener('loadeddata', doAddListeners);
                function doAddListeners() {
                    that._markInElement.addEventListener('mousedown', onMarkInPointerDown);
                    that._markInElement.addEventListener('touchstart', onMarkInPointerDown);
                    that._markInElement.addEventListener('pointerdown', onMarkInPointerDown);

                    that._amveUX.addContainerEventListener('mouseup', onMarkInPointerUp);
                    that._amveUX.addContainerEventListener('touchend', onMarkInPointerUp);
                    that._amveUX.addContainerEventListener('pointerup', onMarkInPointerUp);

                    that._markOutElement.addEventListener('mousedown', onMarkOutPointerDown);
                    that._markOutElement.addEventListener('touchstart', onMarkOutPointerDown);
                    that._markOutElement.addEventListener('pointerdown', onMarkOutPointerDown);

                    that._amveUX.addContainerEventListener('mouseup', onMarkOutPointerUp);
                    that._amveUX.addContainerEventListener('touchend', onMarkOutPointerUp);
                    that._amveUX.addContainerEventListener('pointerup', onMarkOutPointerUp);

                    that._markControlElement.addEventListener('mousemove', onMarkPointerMove);
                    that._markControlElement.addEventListener('touchmove', onMarkPointerMove);
                    that._markControlElement.addEventListener('pointermove', onMarkPointerMove);

                    /**
                     * See onMark
                     */
                    that._amveUX.clipData.addPropertyChangedListener('markInPT', function () {
                        that.onMark();
                    });

                    /**
                     * See onMark
                     */
                    that._amveUX.clipData.addPropertyChangedListener('markOutPT', function () {
                        that.onMark();
                    });

                    /**
                     * See onMark
                     */
                    that._amveUX.player.addEventListener('resize', function () {
                        that.onMark();
                    });


                    that._amveUX.player.addEventListener('timeupdate', function () {
                        that.positionMarkIn(true, null);
                        if (that._amveUX.mode != EditorModes.Trim) {
                            that.positionMarkOut(true, null);
                        }
                        that.positionMarkFill();
                    });
                }
            });

            /**
             * Interaction with the markIn handle element has started
             */
            function onMarkInPointerDown(evt: Event): void {
                that._amveUX.player.pause();
                that._markControlElement.style.cursor = 'pointer';
                that._isMarkInClipping = true;
                that._isMarkOutClipping = false;
            }

            /**
             * Interaction with the markIn handle element has stopped, get the new markIn time value associated 
             * with the X distance the pointer has traveled and set markIn
             */
            function onMarkInPointerUp(evt: Event): void {
                if (that._isMarkInClipping) {
                    that._markControlElement.style.cursor = 'default';
                    that._isMarkInClipping = false;
                    var duration = that._amveUX.player.duration();
                    var time = that._amveUX.player.currentTime();
                    var durationX = that._amveUX.calculateDistanceX(evt, that._markControlElement);
                    var newTime = durationX * duration;

                    // Don't let video end while scrubbing.
                    if (newTime == duration) { newTime = newTime - 0.1; }

                    that._amveUX.player.currentTime(newTime);
                }
            }

            /**
             * Interaction with the markIn handle element has started
             */
            function onMarkOutPointerDown(evt: Event): void {
                that._amveUX.player.pause();
                that._markControlElement.style.cursor = 'pointer';
                that._isMarkInClipping = false;
                that._isMarkOutClipping = true;
            }

            /**
             * Interaction with the markOut handle element has stopped, get the new markOut time value associated 
             * with the X distance the pointer has traveled and set markOut
             */
            function onMarkOutPointerUp(evt: Event): void {
                if (that._isMarkOutClipping) {
                    that._markControlElement.style.cursor = 'default';
                    that._isMarkOutClipping = false;
                    var duration = that._amveUX.player.duration();
                    var newTime = that._amveUX.calculateDistanceX(evt, that._markControlElement) * duration;

                    // Don't let video end while scrubbing.
                    if (newTime == duration) { newTime = newTime - 0.1; }

                    that._amveUX.player.currentTime(newTime);
                }
            }

            /**
             * When a mark pointer has moved, reposition the associated mark handle
             */
            function onMarkPointerMove(evt: Event): void {
                document.body.focus();
                if (that._isMarkInClipping) {
                    that.positionMarkIn(false, evt);
                }
                else if (that._isMarkOutClipping) {
                    that.positionMarkOut(false, evt);
                }
            }
        }

        /**
         * When marking has occured, reposition the handles and refill the bar in-between
         */
        private onMark(): void {
            this.positionMarkIn(true, null);
            if (this._amveUX.mode != EditorModes.Trim) {
                this.positionMarkOut(true, null);
            }
            this.positionMarkFill();
        }

        /**
         * Positions the markIn elements based on either a resize event or a pointer event
         *
         * @param  {boolean} isResize is this a resize event?
         * @param  {evt} evt the associated pointer event
         */
        private positionMarkIn(isResize: boolean, evt: Event): void {
            var markIn = this._amveUX.fromMediaTime(this._amveUX.clipData.markIn);
            var markOut = this._amveUX.fromMediaTime(this._amveUX.clipData.markOut);
            if (!isResize) {
                var duration = this._amveUX.player.duration();
                var newPlayerTime = this._amveUX.calculateDistanceX(evt, this._markControlElement) * duration;
                var timeDiff = 0;
                if (markIn >= 0) {
                    timeDiff = newPlayerTime - markIn;
                }

                // Don't let video end while scrubbing.
                if (newPlayerTime <= 0.0) { newPlayerTime = 0.0; }
                if (newPlayerTime >= duration) { newPlayerTime = duration; }

                if (markOut <= 0 || (newPlayerTime <= (markOut - this._amveUX.minClipDuration))) {
                    this._markInElement.style.left = this._amveUX.getCWPercentage(newPlayerTime, this._markControlElement) + 'px';
                    this._markInElement.style.display = 'block';
                    this._amveUX.clipData.markInPT = newPlayerTime;
                }
            } else if (markIn >= 0) {
                var left = this._amveUX.getCWPercentage(markIn, this._markControlElement);
                if (left < 0)
                    left = 0;
                this._markInElement.style.left = left + 'px';
                this._markInElement.style.display = 'block';
            } else {
                this._markInElement.style.left = '0px';
                this._markInElement.style.display = 'none';
                this._markInWarning.innerText = '';
                this._markInWarning.style.display = 'none';
            }
        }

        /**
         * Positions the markOut elements based on either a resize event or a pointer event
         *
         * @param  {boolean} isResize is this a resize event?         *
         * @param  {evt} evt the associated pointer event
         */
        private positionMarkOut(isResize: boolean, evt: Event): void {
            var markIn = this._amveUX.fromMediaTime(this._amveUX.clipData.markIn);
            var markOut = this._amveUX.fromMediaTime(this._amveUX.clipData.markOut);
            if (!isResize) {
                var duration = this._amveUX.player.duration();
                var newPlayerTime = this._amveUX.calculateDistanceX(evt, this._markControlElement) * duration;
                var timeDiff = 0;
                if (markIn >= 0) {
                    timeDiff = newPlayerTime - markOut;
                }

                // Don't let video end while scrubbing.
                if (newPlayerTime <= 0.0) { newPlayerTime = 0.0; }
                if (newPlayerTime >= duration) { newPlayerTime = duration; }

                if (markIn < 0 || (newPlayerTime >= (markIn + this._amveUX.minClipDuration))) {
                    var left = this._amveUX.getCWPercentage(newPlayerTime, this._markControlElement);
                    if (left > this._markControlElement.clientWidth) {
                        left = this._markControlElement.clientWidth;
                    }
                    this._markOutElement.style.left = (left - (this._markOutElement.clientWidth / 2)) + 'px';
                    this._markOutElement.style.display = 'block';
                    this._amveUX.clipData.markOutPT = newPlayerTime;
                }
            } else if (this._amveUX.clipData.markOutPT > 0) {
                var left = this._amveUX.getCWPercentage(markOut, this._markControlElement);
                if (left > this._markControlElement.clientWidth) {
                    left = this._markControlElement.clientWidth;
                }
                this._markOutElement.style.left = (left - 20) + 'px';
                this._markOutElement.style.display = 'block';
            } else {
                this._markOutElement.style.left = this._markControlElement.clientWidth + 'px';
                this._markOutElement.style.display = 'none';
                this._markOutWarning.innerText = '';
                this._markOutWarning.style.display = 'none';
            }
        }

        /**
         * Fills the div inbetween the mark elements representing the clip length
         */
        public positionMarkFill(): void {
            var markIn = this._amveUX.fromMediaTime(this._amveUX.clipData.markIn);
            var markOut = this._amveUX.fromMediaTime(this._amveUX.clipData.markOut);
            if (markIn >= 0 && (this._amveUX.mode == EditorModes.Trim || markOut > 0)) {
                var markInPct = this._amveUX.getDurationPercentage(markIn);
                var markOutPct = this._amveUX.getDurationPercentage(markOut);
                if (this._amveUX.mode == EditorModes.Trim) {
                    markOutPct = this._amveUX.getDurationPercentage(this._amveUX.player.duration());
                }
                var clipWidthPct = markOutPct - markInPct;
                var left = this._amveUX.getCWPercentage(markIn, this._markControlElement);
                var width = Math.round((this._markControlElement.clientWidth * clipWidthPct));
                this._markFillElement.style.left = left + 'px';
                this._markFillElement.style.width = width + 'px';
                this._markInElement.style.left = left + 'px';
                this._markOutElement.style.left = (left + width - (this._markOutElement.clientWidth / 2)) + 'px';
                this._markFillElement.style.display = 'block';
            } else {
                this._markFillElement.style.display = 'none';
            }
        }

        /**
         * The overall clientHeight of the AMVEMarkControlBar 
         * 
         * @return {number} The overall clientHeight of the AMVEMarkControlBar 
         */
        public get clientHeight(): number {
            return this._markControlElement.clientHeight;
        }
    }
} 