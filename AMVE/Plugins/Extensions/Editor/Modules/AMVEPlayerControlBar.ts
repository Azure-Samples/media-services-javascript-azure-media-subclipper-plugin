import { AMVEUX } from "../Modules/AMVEUX";

module AMVE {
    /**
     * Internal class used by AMVEUX to build the player control bar (play/pause, etc.)
     * Appears on bottom of the player
     */
    export class AMVEPlayerControlBar {
        private _amveUX: AMVEUX;
        private _controlBarElement: HTMLElement;
        private _leftCol: HTMLElement;
        private _rightCol: HTMLElement;
        private _rightColElements: HTMLElement;
        private _centerCol: HTMLElement;
        private _playBtn: HTMLElement;
        private _rwdBtn: HTMLElement;
        private _fwdBtn: HTMLElement;
        private _liveBtn: HTMLElement;
        private _timeDisplay: HTMLElement;
        private _volumeButton: HTMLElement;
        private _fullscreenButton: HTMLElement;
        private _volumeBar: HTMLElement;
        private _volumeTrack: HTMLElement;
        private _volumeFill: HTMLElement;
        private _volumeHandle: HTMLElement;
        private _fwdRwdTimeoutInterval: number = 25;
        private _maxFwdRwdMultiplier: number = 8;
        private _fwdRwdStep: number = 0.3;
        private _fwdRwdMultiplier: number = 1;
        private _rwdFlag: boolean = false;
        private _fwdFlag: boolean = false;
        private _rwdInterval;
        private _fwdInterval;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;
            this._fwdRwdStep = this._amveUX.frameRateVal();

            this._controlBarElement =
                this._amveUX.createElement(['amve-player-controlbar']);
            this._amveUX.appendBottomChild(this._controlBarElement);

            this._volumeBar =
            this._amveUX.createElement(['amve-volume-bar']);

            this._volumeTrack =
                this._amveUX.createElement(['amve-volume-track']);
            this._volumeBar.appendChild(this._volumeTrack);

            this._volumeFill =
                this._amveUX.createElement(['amve-volume-fill']);
            this._volumeBar.appendChild(this._volumeFill);

            this._volumeHandle =
                this._amveUX.createElement(['amve-volume-handle']);
            this._volumeBar.appendChild(this._volumeHandle);

            this._amveUX.appendChild(this._volumeBar);

            this._leftCol =
                this._amveUX.createElement(['amve-left-column']);
            this._controlBarElement.appendChild(this._leftCol);

            this._centerCol =
                this._amveUX.createElement(['amve-center-column']);
            this._controlBarElement.appendChild(this._centerCol);

            this._rightCol =
                this._amveUX.createElement(['amve-right-column']);
            this._controlBarElement.appendChild(this._rightCol);

            this._rightColElements =
                this._amveUX.createElement(['amve-right-column-elements']);
            this._rightCol.appendChild(this._rightColElements);

            this._playBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-play-btn']);
            this._leftCol.appendChild(this._playBtn);

            this._rwdBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-rwd-btn']);
            this._leftCol.appendChild(this._rwdBtn);

            this._fwdBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-fwd-btn']);
            this._leftCol.appendChild(this._fwdBtn);

            this._liveBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-live-btn']);
            this._liveBtn.innerHTML = 'LIVE';
            this._liveBtn.style.display = 'none';
            this._leftCol.appendChild(this._liveBtn);

            this._timeDisplay =
                this._amveUX.createElement(['amve-time-display']);
            this._centerCol.appendChild(this._timeDisplay);

            // this._volumeButton =
            //     this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-volume-btn']);
            // this._rightCol.appendChild(this._volumeButton);

            // this._fullscreenButton =
            //     this._amveUX.createElement(['amve-fullscreen-btn']);
            // this._rightCol.appendChild(this._fullscreenButton);

            this._volumeButton =
                this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-volume-btn', 'amve-right-column-element']);
            this._rightColElements.appendChild(this._volumeButton);

            this._fullscreenButton =
                this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-fullscreen-btn', 'amve-right-column-element']);
            this._rightColElements.appendChild(this._fullscreenButton);

            /**
             * Updates the player time display
             */
            this._amveUX.player.addEventListener('timeupdate', function () {
                // Check if at live edge and update UX according
                if (that._amveUX.player.isLive()) {
                    var ct = that._amveUX.player.currentTime();
                    // Bug in IE / Edge, Chrome keeps duration in synch
                    var edge = that._amveUX.player.duration() - 15;
                    if (ct >= edge) {
                        that._amveUX.trigger('liveedgeon');
                        that._timeDisplay.innerText = 'LIVE / ' +
                        that._amveUX.formatTime(that._amveUX.player.duration());
                    } else {
                        that._amveUX.trigger('liveedgeoff');
                        that._timeDisplay.innerText = that._amveUX.formatTime(that._amveUX.player.currentTime()) + ' / ' +
                        that._amveUX.formatTime(that._amveUX.player.duration());
                    }
                } else {
                    that._timeDisplay.innerText = that._amveUX.formatTime(that._amveUX.player.currentTime()) + ' / ' +
                    that._amveUX.formatTime(that._amveUX.player.duration());
                }
                that._timeDisplay.style.display = 'block';
            });

            /**
             * Stops rewinding or forwarding when the editor is reset
             */
            this._amveUX.addEventListener('reset', function () {
                that.resetFwdRwd();
            });

            /**
             * Updates UX to reflect live edge
             */
            this._amveUX.addEventListener('liveedgeon', function () {
                that._liveBtn.classList.add('amve-live-edge');
            });

            /**
             * Updates UX to reflect live edge
             */
            this._amveUX.addEventListener('liveedgeoff', function () {
                that._liveBtn.classList.remove('amve-live-edge');
            });

            /**
             * Play/Pause
             */
            this._playBtn.addEventListener('click', function () {
                that.resetFwdRwd();
                if (that._amveUX.player.paused()) {
                    that._amveUX.player.play();
                } else {
                    that._amveUX.player.pause();
                }
            });

            const showOrHideControls = () => {
                if (that._amveUX.player.controls()) {
                    that._amveUX.player.controls(false);
                } else {
                    that._amveUX.player.controls(true);
                }
            };

            that._amveUX.player.addEventListener(amp.eventName.fullscreenchange, showOrHideControls);
            
            /**
             * Enter / Exit fullscreen mode
             */
            this._fullscreenButton.addEventListener('click', function () {
                if (that._amveUX.player.isFullscreen()) {
                    that._amveUX.player.exitFullscreen();
                } else {
                    that._amveUX.player.enterFullscreen();
                }
            });

            /**
             * Once the manifest is loaded, checks if it is live and displays/hides the live btn accordingly
             */
            this._amveUX.player.addEventListener('loadedmetadata', function () {
                if (that._amveUX.player.isLive()) {
                    that._liveBtn.style.display = 'block';
                } else {
                    that._liveBtn.style.display = 'none';
                }
            });

            /**
             * Sets the player to the live edge and if paused, plays
             */
            this._liveBtn.addEventListener('click', function () {
                if (that._amveUX.player.paused()) {
                    that._amveUX.player.play();
                }
                that._amveUX.player.currentTime(that._amveUX.player.duration());
            });

            /**
             * Stops forwarding if forwarding, steps through rewinding otherwise
             */
            this._rwdBtn.addEventListener('click', function () {
                that.rwd();
            });

            /**
             * Stops rewinding if rewinding, steps through forwarding otherwise
             */
            this._fwdBtn.addEventListener('click', function () {
                that.ffwd();
            });

            this._volumeButton.addEventListener('pointerenter', volumeBtnHoverOn);
            this._volumeButton.addEventListener('mouseenter', volumeBtnHoverOn);
            this._volumeButton.addEventListener('touchenter', volumeBtnHoverOn);

            this._volumeButton.addEventListener('pointerleave', volumeBtnHoverOff);
            this._volumeButton.addEventListener('mouseleave', volumeBtnHoverOff);
            this._volumeButton.addEventListener('touchleave', volumeBtnHoverOff);

            this._volumeBar.addEventListener('pointerenter', volumeBarHoverOn);
            this._volumeBar.addEventListener('mouseenter', volumeBarHoverOn);
            this._volumeBar.addEventListener('touchenter', volumeBarHoverOn);

            this._volumeBar.addEventListener('pointerleave', volumeBarHoverOff);
            this._volumeBar.addEventListener('mouseleave', volumeBarHoverOff);
            this._volumeBar.addEventListener('touchleave', volumeBarHoverOff);

            this._volumeHandle.addEventListener('mousedown', volumeHandlePointerDown);
            this._volumeHandle.addEventListener('touchstart', volumeHandlePointerDown);
            this._volumeHandle.addEventListener('pointerdown', volumeHandlePointerDown);

            this._volumeBar.addEventListener('mouseup', volumeHandlePointerUp);
            this._volumeBar.addEventListener('touchend', volumeHandlePointerUp);
            this._volumeBar.addEventListener('pointerup', volumeHandlePointerUp);

            this._volumeBar.addEventListener('mousemove', volumeHandlePointerMove);
            this._volumeBar.addEventListener('touchmove', volumeHandlePointerMove);
            this._volumeBar.addEventListener('pointermove', volumeHandlePointerMove);

            this._volumeBar.addEventListener('pointerleave', volumeHandlePointerUp);
            this._volumeBar.addEventListener('mouseleave', volumeHandlePointerUp);
            this._volumeBar.addEventListener('touchleave', volumeHandlePointerUp);

            /**
             * Interaction on volume button
             */
            function volumeBtnHoverOn(): void {
                volumeBarToggle(true);
            }

            /**
             * Interaction on volume button
             */
            function volumeBtnHoverOff(): void {
                setTimeout(volumeBarToggle, 300);
            }

            /**
             * Interaction on volume bar
             */
            var volumeBarflag: boolean = false;
            function volumeBarHoverOn(): void {
                volumeBarflag = true;
            }

            /**
             * Interaction on volume bar
             */
            function volumeBarHoverOff(): void {
                volumeBarflag = false;
                volumeBarToggle(false);
            }

            /**
             * Positions and displays the volume control over the volume button
             */
            function positionAndDisplayVolume(): void {
                var box = that._amveUX.findPosition(that._controlBarElement);

                that._volumeBar.style.display = 'block';
                that._volumeBar.style.top = ((box.top - (that._volumeBar.clientHeight) - that._controlBarElement.clientHeight) - (that._volumeButton.clientHeight * 2) - 60) + 'px';
                // that._volumeBar.style.left = ((that._controlBarElement.clientWidth - that._volumeBar.clientWidth - (that._volumeButton.clientWidth / 2)) - 8) + 'px';
                that._volumeBar.style.left = ((that._controlBarElement.clientWidth - that._volumeBar.clientWidth - (that._volumeButton.clientWidth / 2)) - 68) + 'px';
                that._volumeButton.classList.remove('amve-muted');

                var volume = that._amveUX.player.volume();
                var height = that._volumeTrack.clientHeight * volume;
                var volumeTop = that._volumeTrack.clientHeight - height;

                that._volumeFill.style.height = height + 'px';
                that._volumeFill.style.top = volumeTop + 'px';
                that._volumeFill.style.display = 'block';
                that._volumeHandle.style.top = volumeTop + 'px';
                that._volumeHandle.style.display = 'block';
            }

            /**
             * Displays/hides the volume control
             */
            function volumeBarToggle(toggleFlag: boolean = false) {
                if (volumeBarflag == true || toggleFlag) {
                    positionAndDisplayVolume();
                } else {
                    that._volumeBar.style.display = 'none';
                }
            }

            /**
             * Interaction on volume handle
             */
            var volumeHandleFlag: boolean = false;
            function volumeHandlePointerDown(): void {
                volumeHandleFlag = true;
            }

            /**
             * Interaction on volume handle
             */
            function volumeHandlePointerUp(): void {
                volumeHandleFlag = false;
            }

            /**
             * Sets volume based on pointer position
             */
            function volumeHandlePointerMove(evt: Event): void {
                if (volumeHandleFlag) {
                    var distance = that._amveUX.calculateDistanceY(evt, that._volumeBar);
                    var newVolume = 1 - distance;
                    if (newVolume < 0) { newVolume = 0; }

                    if (newVolume > 0) {
                        that._amveUX.player.volume(newVolume);
                        var volume = that._amveUX.player.volume();
                        var x = 1;
                    } else {
                        that._amveUX.player.muted(true);
                    }
                }
            }

            /**
             * Sets the volume display / mute based on current volume level
             */
            that._amveUX.player.addEventListener('volumechange', function () {
                var muted = that._amveUX.player.muted();
                var volume = that._amveUX.player.volume();
                if (muted == true || volume == 0) {
                    var volumeTop = (that._volumeTrack.clientHeight * volume);
                    that._volumeButton.classList.add('amve-muted');
                    that._volumeFill.style.display = 'none';
                    that._volumeHandle.style.top = that._volumeTrack.clientHeight + 'px';
                } else {
                    positionAndDisplayVolume();
                }
            });

            /**
             * Interaction on volume button
             */
            that._volumeButton.addEventListener('click', function () {
                var muted = that._amveUX.player.muted();
                that._amveUX.player.muted(!muted);
            });

            /**
             * Sets play button to play
             */
            that._amveUX.player.addEventListener('play', function () {
                that.resetFwdRwd();
                that._playBtn.classList.add('amve-playing');
            });

            /**
             * Sets play button to pause
             */
            that._amveUX.player.addEventListener('pause', function () {
                that.resetFwdRwd();
                that._playBtn.classList.remove('amve-playing');
            });
        }

        /**
         * The overall height of the AMVEPlayerControlBar
         */
        public get clientHeight(): number {
            return this._controlBarElement.clientHeight;
        }

        /**
         * Steps through rewinding, starting at 2x ramps up to _maxFwdRwdMultiplier (8x)
         */
        public rwd(): void {
            var that = this;
            if (this._fwdFlag == true) {
                this.resetFwd();
            } else {
                if (this._rwdFlag == false) {
                    this.resetFwdRwd();
                    this._rwdFlag = true;
                    this.setFwdRwdIcon(this._rwdBtn, 2);
                    this._rwdInterval = setInterval(function () {
                        if (that._rwdFlag) {
                            var time = that._amveUX.player.currentTime() - (that._fwdRwdStep * that._fwdRwdMultiplier);
                            if (time >= 0) {
                                that._amveUX.player.currentTime(time);
                            }
                        }
                    }, this._fwdRwdTimeoutInterval);
                    this._fwdRwdMultiplier = 2;
                } else if (this._fwdRwdMultiplier < this._maxFwdRwdMultiplier) {
                    this._fwdRwdMultiplier *= 2;
                    this.setFwdRwdIcon(this._rwdBtn);
                }
            }
        }

        /**
         * Steps through forwarding, starting at 2x ramps up to _maxFwdRwdMultiplier (8x)
         */
        public ffwd(): void {
            var that = this;
            if (this._rwdFlag == true) {
                this.resetRwd();
            } else {
                if (this._fwdFlag == false) {
                    this.resetFwdRwd();
                    this._fwdFlag = true;
                    this.setFwdRwdIcon(this._fwdBtn, 2);
                    this._fwdInterval = setInterval(function () {
                        if (that._fwdFlag) {
                            var time = that._amveUX.player.currentTime() + (that._fwdRwdStep * that._fwdRwdMultiplier);
                            if (time <= that._amveUX.player.duration()) {
                                that._amveUX.player.currentTime(time);
                            }
                        }
                    }, this._fwdRwdTimeoutInterval);
                    this._fwdRwdMultiplier = 2;
                } else if (this._fwdRwdMultiplier < this._maxFwdRwdMultiplier) {
                    this._fwdRwdMultiplier *= 2;
                    this.setFwdRwdIcon(this._fwdBtn);
                }
            }
        }

        /**
         * Stops rwd/fwd, resets stepping
         */
        private resetFwdRwd(): void {
            this.resetRwd();
            this.resetFwd();
        }

        /**
         * Stops rewinding, resets stepping
         */
        private resetRwd(): void {
            this._rwdFlag = false;
            if (this._rwdInterval) {
                clearInterval(this._rwdInterval);
            }
            this._fwdRwdMultiplier = 1;
            this.setFwdRwdIcon(this._rwdBtn, 1);
        }

        /**
         * Stops forwarding, resets stepping
         */
        private resetFwd(): void {
            this._fwdFlag = false;
            if (this._fwdInterval) {
                clearInterval(this._fwdInterval);
            }
            this._fwdRwdMultiplier = 1;
            this.setFwdRwdIcon(this._fwdBtn, 1);

        }

        /**
         * Sets the rwd/fwd icon to the appropriate glyph based on the current steppiing level (2x, 4x, etc.)
         */
        private setFwdRwdIcon(target: HTMLElement, speed: number = -1): void {
            for (var i = 1; i <= this._maxFwdRwdMultiplier; i *= 2) {
                target.classList.remove('speed-' + i + 'x');
            }
            if (speed > 0) {
                target.classList.add('speed-' + speed + 'x');
            } else {
                target.classList.add('speed-' + this._fwdRwdMultiplier + 'x');
            }
        }
    }
}

export = AMVE;
