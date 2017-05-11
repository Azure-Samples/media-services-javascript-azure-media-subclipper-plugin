import { AMVEUX } from "../Modules/AMVEUX";
import { EditorModes } from "../Modules/Common"

module AMVE {
    /**
     * Internal class used by AMVEUX to build the bottom control bar (set in/out, etc.)
     * Appears below the scrubber
     */
    export class AMVEBottomControlBar {
        private _amveUX: AMVEUX;
        private _controlBarElement: HTMLElement;
        private _controlBarTopElement: HTMLElement;
        private _leftCol: HTMLElement;
        private _centerCol: HTMLElement;
        private _rightCol: HTMLElement;
        private _centerColLeft: HTMLElement;
        private _centerColCenter: HTMLElement;
        private _centerColRight: HTMLElement;
        private _resetBtn: HTMLElement;
        private _thumbnailBtnContainer: HTMLElement;
        private _exportBtn: HTMLElement;
        private _exportIcon: HTMLElement;
        private _setMarkInBtn: HTMLElement;
        private _setMarkOutBtn: HTMLElement;
        private _clipLengthDisplay: HTMLElement;
        private _markInControlsContainer: HTMLElement;
        private _markOutControlsContainer: HTMLElement;
        private _markInControls: HTMLElement;
        private _markOutControls: HTMLElement;
        private _markInLeftArrow: HTMLElement;
        private _markInDisplayContainer: HTMLElement;
        private _markInDisplay: HTMLElement;
        private _markInRightArrow: HTMLElement;
        private _markOutLeftArrow: HTMLElement;
        private _markOutDisplayContainer: HTMLElement;
        private _markOutDisplay: HTMLElement;
        private _markOutRightArrow: HTMLElement;
        private _bottomControlBarContainer: HTMLElement;
        private _setMarksContainer: HTMLElement;
        private _setThumbnailsContainer: HTMLElement;
        private _setMarkInBtnContainer:HTMLElement;
        private _setMarkInIcon:HTMLElement;
        private _setMarkOutBtnContainer:HTMLElement;
        private _setMarkOutIcon:HTMLElement;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;

            this._controlBarElement =
                this._amveUX.createElement(['amve-bottom-controlbar']);
            this._amveUX.appendBottomChild(this._controlBarElement);

            this._controlBarTopElement =
                this._amveUX.createElement(['amve-bottom-controlbar-top']);
            this._controlBarElement.appendChild(this._controlBarTopElement);

            // this._leftCol =
            //     this._amveUX.createElement(['amve-left-column']);
            // this._controlBarTopElement.appendChild(this._leftCol);

            this._bottomControlBarContainer =
                this._amveUX.createElement(['amve-bottom-control-bar-container']);
            this._controlBarTopElement.appendChild(this._bottomControlBarContainer);

            this._setMarksContainer =
                this._amveUX.createElement(['amve-float-left']);
            this._bottomControlBarContainer.appendChild(this._setMarksContainer);

            this._setThumbnailsContainer =
                this._amveUX.createElement(['amve-float-right']);
            this._bottomControlBarContainer.appendChild(this._setThumbnailsContainer);

            this._centerCol =
                this._amveUX.createElement(['amve-center-column', 'amve-no-margin']);
            this._setMarksContainer.appendChild(this._centerCol);

            this._centerColLeft =
                this._amveUX.createElement(['amve-center-column-left']);
            this._centerCol.appendChild(this._centerColLeft);

            this._centerColCenter =
                this._amveUX.createElement(['amve-center-column-center']);
            this._centerCol.appendChild(this._centerColCenter);

            this._centerColRight =
                this._amveUX.createElement(['amve-center-column-right']);
            this._centerCol.appendChild(this._centerColRight);

            this._rightCol =
                this._amveUX.createElement(['amve-right-column']);
            this._setThumbnailsContainer.appendChild(this._rightCol);

            // this._resetBtn =
            // this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-reset-btn']);
            // this._resetBtn.innerHTML = 'reset';
            // this._leftCol.appendChild(this._resetBtn);

            this._thumbnailBtnContainer =
                this._amveUX.createElement(['amve-btn', 'amve-btn-parent']);
            this._rightCol.appendChild(this._thumbnailBtnContainer);

            this._exportBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-btn-disabled', 'amve-export-btn', 'amve-btn-child']);
            this._exportBtn.innerHTML = 'Thumbnails';
            this._thumbnailBtnContainer.appendChild(this._exportBtn);

            this._exportIcon =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-export-icon', 'amve-btn-child']);
            this._thumbnailBtnContainer.appendChild(this._exportIcon);

            // this._clipLengthDisplay =
            //     this._amveUX.createElement(['amve-cliplength-display']);
            // this._centerColCenter.appendChild(this._clipLengthDisplay);

            this._markInControlsContainer =
                this._amveUX.createElement(['amve-markin-controls-container']);
            this._centerColLeft.appendChild(this._markInControlsContainer);

            this._markInControls =
                this._amveUX.createElement(['amve-markin-controls']);
            this._markInControlsContainer.appendChild(this._markInControls);

            this._markOutControlsContainer =
                this._amveUX.createElement(['amve-markout-controls-container']);
            this._centerColRight.appendChild(this._markOutControlsContainer);

            this._markOutControls =
                this._amveUX.createElement(['amve-markout-controls']);
            this._markOutControlsContainer.appendChild(this._markOutControls);

            this._markInLeftArrow =
                this._amveUX.createElement(['amve-btn-control', 'amve-chevron-left', 'amve-markin-leftarrow']);
            this._markInControls.appendChild(this._markInLeftArrow);

            this._markInDisplayContainer =
                this._amveUX.createElement(['amve-markin-display-container']);
            this._markInControls.appendChild(this._markInDisplayContainer);

            this._setMarkInBtnContainer =
                this._amveUX.createElement(['amve-btn', 'amve-btn-parent']);
            this._markInDisplayContainer.appendChild(this._setMarkInBtnContainer);

            this._setMarkInBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-setmarkin-btn', 'amve-btn-child']);
            this._setMarkInBtn.innerHTML = 'Set start';
            this._setMarkInBtnContainer.appendChild(this._setMarkInBtn);

            this._setMarkInIcon =
                this._amveUX.createElement(['amve-btn', 'amve-setmarkin-icon', 'amve-btn-child']);
            this._setMarkInBtnContainer.appendChild(this._setMarkInIcon);

            this._markInDisplay =
                this._amveUX.createElement(['amve-markin-display']);
            this._markInDisplayContainer.appendChild(this._markInDisplay);

            this._markInRightArrow =
                this._amveUX.createElement(['amve-btn-control', 'amve-chevron-right', 'amve-markin-rightarrow']);
            this._markInControls.appendChild(this._markInRightArrow);

            this._markOutLeftArrow =
                this._amveUX.createElement(['amve-btn-control', 'amve-chevron-left', 'amve-markout-leftarrow']);
            this._markOutControls.appendChild(this._markOutLeftArrow);

            this._markOutDisplayContainer =
                this._amveUX.createElement(['amve-markout-display-container']);
            this._markOutControls.appendChild(this._markOutDisplayContainer);

            this._setMarkOutBtnContainer =
                this._amveUX.createElement(['amve-btn', 'amve-btn-parent']);
            this._markOutDisplayContainer.appendChild(this._setMarkOutBtnContainer);

            this._setMarkOutBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-setmarkout-btn', 'amve-btn-child']);
            this._setMarkOutBtn.innerHTML = 'Set end';
            this._setMarkOutBtnContainer.appendChild(this._setMarkOutBtn);

            this._setMarkOutIcon =
                this._amveUX.createElement(['amve-btn', 'amve-setmarkout-icon', 'amve-btn-child']);
            this._setMarkOutBtnContainer.appendChild(this._setMarkOutIcon);

            this._markOutDisplay =
                this._amveUX.createElement(['amve-markout-display']);
            this._markOutDisplayContainer.appendChild(this._markOutDisplay);

            this._markOutRightArrow =
                this._amveUX.createElement(['amve-btn-control', 'amve-chevron-right', 'amve-markout-rightarrow']);
            this._markOutControls.appendChild(this._markOutRightArrow);

            this._amveUX.addPropertyChangedListener('mode', function () {
                switch (that._amveUX.mode) {
                    case EditorModes.Trim:
                        that._markInLeftArrow.title = '-1 gop';
                        that._markInRightArrow.title = '+1 gop';
                        that._markOutLeftArrow.style.display = 'none';
                        that._markOutRightArrow.style.display = 'none';
                        that._markOutLeftArrow.style.display = 'none';
                        that._markOutDisplay.style.display = 'none';
                        that._setMarkOutBtn.style.display = 'none';
                        checkMark();
                        break;
                    case EditorModes.Virtual:
                        that._markInLeftArrow.title = '-1 gop';
                        that._markInRightArrow.title = '+1 gop';
                        that._markOutLeftArrow.title = '-1 gop';
                        that._markOutRightArrow.title = '+1 gop';
                        that._markOutRightArrow.style.display = 'block';
                        that._markOutLeftArrow.style.display = 'block';
                        that._markOutDisplay.style.display = 'block';
                        that._setMarkOutBtn.style.display = 'block';
                        checkMark();
                        break;
                    case EditorModes.Rendered:
                        that._markInLeftArrow.title = '-1 frame';
                        that._markInRightArrow.title = '+1 frame';
                        that._markOutLeftArrow.title = '-1 frame';
                        that._markOutRightArrow.title = '+1 frame';
                        that._markOutRightArrow.style.display = 'block';
                        that._markOutLeftArrow.style.display = 'block';
                        that._markOutDisplay.style.display = 'block';
                        that._setMarkOutBtn.style.display = 'block';
                        checkMark();
                        break;
                }
            });

            this._amveUX.player.addEventListener('timeupdate', function () {
                if (!that._amveUX.isScrubbing) {
                    checkMark();
                }
            });

            /**
             * Checks the markIn and markOut and enables the mark displays and exporting if the appropriate conditions are met
             */
            function checkMark() {
                if (that._amveUX.clipData.markInPT >= 0 && (that._amveUX.mode == EditorModes.Trim || that._amveUX.clipData.markOutPT > 0)) {
                    // that._clipLengthDisplay.innerHTML = that._amveUX.formatTimeWords(that._amveUX.checkClipDuration());
                    // that._clipLengthDisplay.style.display = 'block';
                    that._exportBtn.classList.remove('amve-btn-disabled');
                } else {
                    // that._clipLengthDisplay.style.display = 'none';
                    that._exportBtn.classList.add('amve-btn-disabled');
                }

                if (that._amveUX.clipData.markIn >= 0 && !that._amveUX.isThumbnailsGenerating) {
                    var time = that._amveUX.fromMediaTime(that._amveUX.clipData.markIn);
                    if (time >= 0) {
                        that._markInDisplay.innerHTML = that._amveUX.formatTime(time);
                        that._markInDisplay.style.display = 'block';
                    } else {
                        that._markInDisplay.style.display = 'none';
                    }
                } else {
                    that._markInDisplay.style.display = 'none';
                }

                if (that._amveUX.clipData.markOut > 0 && !that._amveUX.isThumbnailsGenerating) {
                    var time = that._amveUX.fromMediaTime(that._amveUX.clipData.markOut);
                    if (time >= 0) {
                        that._markOutDisplay.innerHTML = that._amveUX.formatTime(time);
                        that._markOutDisplay.style.display = 'block';
                    } else {
                        that._markInDisplay.style.display = 'none';
                    }
                } else {
                    that._markOutDisplay.style.display = 'none';
                }
            }

            /**
             * See clipData
             */
            this._amveUX.clipData.addEventListener('markInPT', function () {
                checkMark();
            });

            /**
             * See clipData
             */
            this._amveUX.clipData.addEventListener('markOutPT', function () {
                checkMark();
            });

            /**
             * Opens the submit dialog and generates the thumbnails when the export button is clicked
             */
            this._exportBtn.addEventListener('click', function () {
                if (!that._exportBtn.classList.contains('amve-btn-disabled')) {
                    that._amveUX.toggleSubmitDlg(1);
                }
            });

            /**
             * See AMVEUX.reset
             */
            // this._resetBtn.addEventListener('click', function () {
            //     that._amveUX.reset();
            // });

            /**
             * Sets the player time to the markIn value when the markIn display is clicked
             */
            this._markInDisplay.addEventListener('click', function () {
                if (that._amveUX.clipData.markInPT >= 0) {
                    that._amveUX.player.currentTime(that._amveUX.fromMediaTime(that._amveUX.clipData.markIn));
                }
            });

            var oldE;
            /**
             * Sets the player time to the markOut value when the markOut display is clicked
             */
            this._markOutDisplay.addEventListener('click', function () {
                if (that._amveUX.clipData.markOutPT >= 0) {
                    that._amveUX.player.currentTime(that._amveUX.fromMediaTime(that._amveUX.clipData.markOut));
                }
            });

            /**
             * Sets the markIn value to the current player time when the set in button is clicked
             */
            this._setMarkInBtn.addEventListener('click', function () {
                that._amveUX.clipData.markInPT = that._amveUX.player.currentTime();
                that._amveUX.player.currentTime(that._amveUX.clipData.markInPT);
            });

            /**
             * Sets the markOut value to the current player time when the set out button is clicked
             */
            this._setMarkOutBtn.addEventListener('click', function () {
                that._amveUX.clipData.markOutPT = that._amveUX.player.currentTime();
                that._amveUX.player.currentTime(that._amveUX.clipData.markOutPT);
            });

            /**
             * Sets the markIn value -1 frame or gop depending on the current editor mode
             */
            this._markInLeftArrow.addEventListener('click', function () {
                if (that._amveUX.clipData.markInPT > 0) {
                    var mark = that._amveUX.clipData.markInPT;
                    if (that._amveUX.player.isLive()) {
                        mark = that._amveUX.fromMediaTime(that._amveUX.clipData.markIn);
                    }
                    var newPlayerTime = arrowAction(mark, -1);
                    if (newPlayerTime >= 0 && newPlayerTime >= 0) {
                        that._amveUX.clipData.markInPT = newPlayerTime;
                        that._amveUX.player.currentTime(newPlayerTime);
                    }
                }
            });

            /**
             * Sets the markIn value +1 frame or gop depending on the current editor mode
             */
            this._markInRightArrow.addEventListener('click', function () {
                var mark = that._amveUX.clipData.markInPT;
                if (that._amveUX.player.isLive()) {
                    mark = that._amveUX.fromMediaTime(that._amveUX.clipData.markIn);
                }
                var newPlayerTime = arrowAction(mark);
                if (newPlayerTime >= 0) {
                    that._amveUX.clipData.markInPT = newPlayerTime;
                    that._amveUX.player.currentTime(newPlayerTime);
                }
            });

            /**
             * Sets the markOut value -1 frame or gop depending on the current editor mode
             */
            this._markOutLeftArrow.addEventListener('click', function () {
                if (that._amveUX.clipData.markOutPT > 0) {
                    var mark = that._amveUX.clipData.markOutPT;
                    if (that._amveUX.player.isLive()) {
                        mark = that._amveUX.fromMediaTime(that._amveUX.clipData.markOut);
                    }
                    var newPlayerTime = arrowAction(mark, -1);
                    if (newPlayerTime > 0) {
                        that._amveUX.clipData.markOutPT = newPlayerTime;
                        that._amveUX.player.currentTime(newPlayerTime);
                    }
                }
            });

            /**
             * Sets the markOut value +1 frame or gop depending on the current editor mode
             */
            this._markOutRightArrow.addEventListener('click', function () {
                var mark = that._amveUX.clipData.markOutPT;
                if (that._amveUX.player.isLive()) {
                    mark = that._amveUX.fromMediaTime(that._amveUX.clipData.markOut);
                }
                var newPlayerTime = arrowAction(mark);
                if (newPlayerTime > 0) {
                    that._amveUX.clipData.markOutPT = newPlayerTime;
                    that._amveUX.player.currentTime(newPlayerTime);
                }
            });

            /**
             * Given a mark value and a direction (< 0 for subtraction, > 0 for addition),
             * returns the previous or next frame or gop depending on the editor's current mode
             * 
             * @param  {number} mark the mark value to change
             * @param  {number} direction < 0 for subtraction, > 0 for addition
             * @return {number} The resultant mark value
             */
            function arrowAction(mark: number, direction: number = 1): number {
                var newTime = 0.0;

                switch (that._amveUX.mode) {
                    case EditorModes.Rendered:
                        if (direction < 0) {
                            newTime = that._amveUX.prevFrame(mark);
                        } else {
                            newTime = that._amveUX.nextFrame(mark);
                        }
                        break;
                    case EditorModes.Trim:
                        if (direction < 0) {
                            newTime = that._amveUX.prevGop(mark);
                        } else {
                            newTime = that._amveUX.nextGop(mark);
                        }
                        break;
                    case EditorModes.Virtual:
                        if (direction < 0) {
                            newTime = that._amveUX.prevGop(mark);
                        } else {
                            newTime = that._amveUX.nextGop(mark);
                        }
                        break;
                }

                if (newTime <= 0) {
                    newTime = 0.0;
                } else if (newTime >= that._amveUX.player.duration()) {
                    newTime = that._amveUX.player.duration();
                }

                return newTime;
            }
        }

        /**
         * The overall clientHeight of the AMVEBottomControlBar 
         * 
         * @return {number} The overall clientHeight of the AMVEBottomControlBar 
         */
        public get clientHeight(): number {
            return this._controlBarElement.clientHeight;
        }
    }
}

export = AMVE;
