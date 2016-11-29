/// <reference path='../Interfaces/IEventSource.ts' />
/// <reference path='../Modules/Common.ts' />
/// <reference path='../Modules/KeyboardShortcutConfig.ts' />
/// <reference path='../Modules/Box.ts' />
/// <reference path='../Modules/AMVETopControlBar.ts' />
/// <reference path='../Modules/AMVEPlayerControlBar.ts' />
/// <reference path='../Modules/AMVEMarkControlBar.ts' />
/// <reference path='../Modules/AMVEScrubber.ts' />
/// <reference path='../Modules/AMVEBottomControlBar.ts' />
/// <reference path='../Modules/AMVESubmitDialog.ts' />
/// <reference path='../Modules/AMVESettingsDialog.ts' />

"use strict";

module AMVE {
    /**
     * Used by AMVECore to build the UX for AMVE
     */
    export class AMVEUX implements IPropertyChangeEventSource {
        public player: amp.Player;
        private _amveCore: AMVECore;
        private _mode: EditorModes = EditorModes.Virtual;
        private _frameRate: AMVEFrameRates = AMVEFrameRates.ThirtyFPS;
        private _container: HTMLElement;
        private _playerContainer: HTMLElement;
        private _topControlBar: AMVETopControlBar;
        private _bottom: HTMLElement;
        private _playerControlBar: AMVEPlayerControlBar;
        private _markControlBar: AMVEMarkControlBar;
        private _scrubber: AMVEScrubber;
        private _isScrubbing: boolean;
        private _bottomControlBar: AMVEBottomControlBar;
        private _submitDlg: AMVESubmitDialog;
        private _settingsDlg: AMVESettingsDialog;
        public minClipDuration: number = 1.0;
        private _segmentBoundaries: number[];
        private _lastCT: number = 0;
        public dvrWindowThresholdBoundary: number = 30;
        private _playableWindow: Array<number>;
        private _thumbnailGeneratorContainer: HTMLElement;
        private _thumbnailGeneratorCanvas: HTMLCanvasElement;
        private _thumbnailWidth: number = 160;
        private _thumbnailCount: number = 5;
        public thumbnails: Array<ThumbnailData>;
        private _isThumbnailsGenerating: boolean;
        private _eventHandlers = {};
        private _keyboardShortcutMgr: KeyboardShortcutManager;
        private _settingsToggle: boolean = true;
        private _submitToggle: boolean = true;
        private _playerCoverImage: HTMLImageElement;
        private _animationsStyle: HTMLStyleElement;
        private _pauseFlag: boolean = false;
        private _markInLiveEdge: number = -1;
        private _markOutLiveEdge: number = -1;
        private _lastMediaTime: number = -1;
        private _lastAbsTime: number = -1;
        private _lastPlayerTime: number = -1;
        private _clipData: AMVEClipData;

        constructor(amveCore: AMVECore) {
            var that = this;
            this._amveCore = amveCore;
            if (this._amveCore && this._amveCore.player && this._amveCore.containerId) {
                this.player = this._amveCore.player;

                if (this.player.playerElement() && this._amveCore.containerId) {
                    this._container = document.getElementById(this._amveCore.containerId);

                    if (this._container) {
                        this._clipData = new AMVEClipData(this);
                        this._container.className = 'amve-container';
                        this._container.tabIndex = 0;

                        this._thumbnailGeneratorContainer = this.createElement(['amve-thumbnail-canvas-container']);
                        this._container.appendChild(this._thumbnailGeneratorContainer);

                        this._thumbnailGeneratorCanvas = <HTMLCanvasElement>this.createElement(['amve-thumbnail-canvas'], 'canvas');
                        this._thumbnailGeneratorCanvas.style.display = 'none';
                        this._thumbnailGeneratorContainer.appendChild(this._thumbnailGeneratorCanvas);

                        this._topControlBar = new AMVETopControlBar(this);

                        if (this.player.playerElement().parentElement) {
                            this._playerContainer = this.createElement(['amve-player-container']);
                            this._container.appendChild(this._playerContainer);
                            this.player.playerElement().parentElement.removeChild(this.player.playerElement());
                            this._playerContainer.appendChild(this.player.playerElement());
                        }

                        this._playerCoverImage = <HTMLImageElement>this.createElement(['amve-cover-image'], 'img');
                        this.appendChild(this._playerCoverImage);

                        this._bottom = this.createElement(['amve-bottom']);
                        this.appendChild(this._bottom);

                        this._playerControlBar = new AMVEPlayerControlBar(this);
                        this._markControlBar = new AMVEMarkControlBar(this);
                        this._scrubber = new AMVEScrubber(this);
                        this._bottomControlBar = new AMVEBottomControlBar(this);
                        this._submitDlg = new AMVESubmitDialog(this);
                        this._settingsDlg = new AMVESettingsDialog(this);
                        this._animationsStyle = <HTMLStyleElement>document.createElement('style');
                        document.getElementsByTagName('head')[0].appendChild(this._animationsStyle);

                        if (this._amveCore.customMetadataContainerId) {
                            this._submitDlg.customMetadataContainer = document.getElementById(this._amveCore.customMetadataContainerId);
                        }

                        window.addEventListener('resize', function () {
                            that.resize();
                        });

                        this.player.addEventListener('loadedmetadata', function () {
                            that._pauseFlag = false;
                            that.player.addEventListener('loadeddata', doReset);
                            function doReset() {
                                that._segmentBoundaries = that.player.segmentBoundaries();
                                that.reset(true);
                                that.player.removeEventListener('loadeddata', doReset);
                            }
                        });

                        this.player.addEventListener('play', function () {
                            if (that._pauseFlag == false) {
                                that._pauseFlag = true;
                                that.player.pause();
                            }
                        });

                        this.player.addEventListener('click', function () {
                            if (that.player.paused()) {
                                that.player.play();
                            } else {
                                that.player.pause();
                            }
                        });
                        
                        this._clipData.addPropertyChangedListener('isClipCompleted', function () { that.isClipCompletedChanged(); });

                        this.resize();

                        this.setupKeyboardShortcuts();

                        this.player.addEventListener('timeupdate', function () {
                            if (that.player.isLive() && that.player.currentPlayableWindow()) {
                                that._markInLiveEdge = that.player.currentPlayableWindow().endInSec;
                            }
                        });
                    }
                }
            }
        }

        /** PROPERTIES */

        /**
         * Returns the Current EditorMode
         */
        public get mode(): EditorModes {
            return this._mode;
        }

        /**
         * Sets the current EditorMode
         * Triggers a modechanged event
         */
        public set mode(modeIn: EditorModes) {
            if (modeIn != this._mode) {
                this._mode = modeIn;
                this.propertyChanged('mode');
            }
        }

        /**
         * Returns the container element assoicated with the configured containerId
         */
        public get containerElement(): HTMLElement {
            return this._container;
        }

        /**
         * Returns the conatiner's clientWidth
         */
        public get clientWidth(): number {
            return this._container.clientWidth;
        }

        /**
         * Returns the conatiner's clientHeight
         */
        public get clientHeight(): number {
            return this._container.clientHeight;
        }

        /**
         * Returns the configured frameRate
         */
        public get frameRate(): AMVEFrameRates {
            return this._frameRate;
        }

        /**
         * Sets the frameRate, triggers a frameratechanged event
         */
        public set frameRate(rate: AMVEFrameRates) {
            this._frameRate = rate;
            this.propertyChanged('frameRate');
        }

        /**
         * Returns the number of thumbnails to generate in the submit dialog
         */
        public get thumbnailCount(): number {
            return this._thumbnailCount;
        }

        /**
         * Sets the number of thumbnails to generate in the submit dialog
         */
        public set thumbnailCount(numThumbnails: number) {
            this._thumbnailCount = numThumbnails;
            this.propertyChanged('thumbnailCount');
        }

        /**
         * Gets the player's configured margins as a Box
         */
        private get playerMargin(): Box {
            var l =
                this.pxToNumber(window.getComputedStyle(this.player.playerElement(), null).getPropertyValue('margin-left'));
            var t =
                this.pxToNumber(window.getComputedStyle(this.player.playerElement(), null).getPropertyValue('margin-top'));
            var r =
                this.pxToNumber(window.getComputedStyle(this.player.playerElement(), null).getPropertyValue('margin-right'));
            var b =
                this.pxToNumber(window.getComputedStyle(this.player.playerElement(), null).getPropertyValue('margin-bottom'));

            return Box.buildBox(l, t, r, b);
        }

        /**
         * Returns the clipData
         */
        public get clipData(): AMVEClipData {
            return this._clipData;
        }

        /**
         * Returns the Live Edge from the time the Mark In point was set
         */
        public get markInLiveEdge(): number {
            return this._markInLiveEdge;
        }

        /**
         * Returns the Live Edge from the time the Mark Out point was set
         */
        public get markOutLiveEdge(): number {
            return this._markOutLiveEdge;
        }

        /**
         * Returns isScrubbing
         */
        public get isScrubbing(): boolean {
            return this._isScrubbing;
        }

        /**
         * Sets isScrubbing
         */
        public set isScrubbing(isScrubbing: boolean) {
            if (isScrubbing != this._isScrubbing) {
                this._isScrubbing = isScrubbing;
                this.propertyChanged('isScrubbing');
            }
        }

        /**
         * Returns isThumbnailsGenerating
         */
        public get isThumbnailsGenerating(): boolean {
            return this._isThumbnailsGenerating;
        }

        /**
         * Sets isThumbnailsGenerating
         */
        public set isThumbnailsGenerating(isThumbnailsGenerating: boolean) {
            if (isThumbnailsGenerating != this._isThumbnailsGenerating) {
                this._isThumbnailsGenerating = isThumbnailsGenerating;
                this.propertyChanged('isThumbnailsGenerating');
            }
        }

        /** METHODS */

        /** clipData Changed Handlers **/
        private isClipCompletedChanged() {
            this.toggleSubmitDlg(0);
            if (this.clipData.isClipCompleted) {
                this._amveCore.clipData = this.clipData;
            }
        }

        /**
         * Called when the page is resized to reposition the UX elements
         */
        private resize(): void {
            this.resizePlayer();
            this._submitDlg.resize();
            this._settingsDlg.resize();
        }

        /**
         * Resizes the player itself
         */
        private resizePlayer(): void {
            if (this.player) {
                var offset = this.playerMargin;

                var width = this._container.clientWidth -
                    offset.left -
                    offset.right - 2;

                var height = this._container.clientHeight -
                    this._topControlBar.clientHeight -
                    this._bottomControlBar.clientHeight -
                    offset.top -
                    offset.bottom;

                this.player.width(width);
                this.player.height(height);
                this.player.playerElement().width = width;
                this.player.playerElement().height = height;
            }
        }

        /**
         * Initializes the keyboard shorcuts if the AMVECore has a config
         */
        private setupKeyboardShortcuts(): void {
            if (this._amveCore.keyboardShortcutConfig) {
                var that = this;
                this._keyboardShortcutMgr = new KeyboardShortcutManager();
                if (this._amveCore.keyboardShortcutConfig.playPauseShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.playPauseShortcut, function () {
                        if (that.player.paused()) {
                            that.player.play();
                        } else {
                            that.player.pause();
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.markInShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.markInShortcut, function () {
                        that.clipData.markInPT = that.player.currentTime();
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.markOutShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.markOutShortcut, function () {
                        that.clipData.markOutPT = that.player.currentTime();
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.goToInShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.goToInShortcut, function () {
                        if (that.clipData.markInPT >= 0) {
                            that.player.currentTime(that.clipData.markInPT);
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.goToOutShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.goToOutShortcut, function () {
                        if (that.clipData.markOutPT >= 0) {
                            that.player.currentTime(that.clipData.markOutPT);
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.playInToOutShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.playInToOutShortcut, function () {
                        var processedFlag = false;
                        if (that.clipData.markInPT >= 0 && that.clipData.markOutPT > that.clipData.markInPT) {
                            that.player.pause();
                            that.player.currentTime(that.clipData.markInPT);
                            that.player.addEventListener('timeupdate', function () {
                                if (!processedFlag && that.player.currentTime() >= that.clipData.markOutPT) {
                                    that.player.pause();
                                    processedFlag = true;
                                }
                            });
                            that.player.play();
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.playToOutShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.playToOutShortcut, function () {
                        var processedFlag = false;
                        if (that.clipData.markOutPT > 0) {
                            if (that.player.currentAbsoluteTime() >= that.clipData.markOutPT) {
                                that.player.currentTime(that.clipData.markOutPT - 3);
                            }
                            that.player.pause();
                            that.player.addEventListener('timeupdate', function () {
                                if (!processedFlag && that.player.currentAbsoluteTime() >= that.clipData.markOutPT) {
                                    that.player.pause();
                                    processedFlag = true;
                                }
                            });
                            that.player.play();
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.rwdShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.rwdShortcut, function () {
                        that._playerControlBar.rwd();
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.ffwdShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.ffwdShortcut, function () {
                        that._playerControlBar.ffwd();
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.backOneFrameShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.backOneFrameShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            var time = that.player.currentTime();
                            if (time > 0) {
                                var newTime = that.prevFrame(time);
                                if (newTime <= 0) {
                                    newTime = 0;
                                }
                                that.player.currentTime(newTime);
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.backFiveFramesShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.backFiveFramesShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            var time = that.player.currentTime();
                            if (time > 0) {
                                var newTime = that.prevFrame(time);
                                for (var i = 0; i < 4; i++) {
                                    newTime = that.prevFrame(newTime);
                                    if (newTime <= 0) {
                                        newTime = 0;
                                        break;
                                    }
                                }
                                that.player.currentTime(newTime);
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.backOneSecondShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.backOneSecondShortcut, function () {
                        var time = that.player.currentTime();
                        if (time > 0) {
                            var newTime = time - 1;
                            if (newTime <= 0) {
                                newTime = 0;
                            }
                            that.player.currentTime(newTime);
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.fwdOneFrameShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.fwdOneFrameShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            var time = that.player.currentTime();
                            var duration = that.player.duration();
                            if (time < duration) {
                                var newTime = that.nextFrame(time);
                                if (newTime > duration) {
                                    newTime = duration;
                                }
                                that.player.currentTime(newTime);
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.fwdFiveFramesShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.fwdFiveFramesShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            var time = that.player.currentTime();
                            var duration = that.player.duration();
                            if (time < duration) {
                                var newTime = that.prevFrame(time);
                                for (var i = 0; i < 4; i++) {
                                    newTime = that.nextFrame(newTime);
                                    if (newTime > duration) {
                                        newTime = duration;
                                        break;
                                    }
                                }
                                that.player.currentTime(newTime);
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.fwdOneSecondShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.fwdOneSecondShortcut, function () {
                        var time = that.player.currentTime();
                        var duration = that.player.duration();
                        if (time < duration) {
                            var newTime = time + 1;
                            if (newTime > duration) {
                                newTime = duration;
                            }
                            that.player.currentTime(newTime);
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.backOneGopShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.backOneGopShortcut, function () {
                        if (that.mode == EditorModes.Virtual || that.mode == EditorModes.Trim) {
                            var time = that.player.currentTime();
                            if (time > 0) {
                                var newTime = that.prevGop(time);
                                if (newTime <= 0) {
                                    newTime = 0;
                                }
                                that.player.currentTime(newTime);
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.fwdOneGopShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.fwdOneGopShortcut, function () {
                        if (that.mode == EditorModes.Virtual || that.mode == EditorModes.Trim) {
                            var time = that.player.currentTime();
                            var duration = that.player.duration();
                            if (time < duration) {
                                var newTime = that.nextGop(time);
                                if (newTime > duration) {
                                    newTime = duration
                                }
                                that.player.currentTime(newTime);
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.markInOneFrameShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.markInOneFrameShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            if (that.clipData.markInPT > 0) {
                                var newPlayerTime = that.prevFrame(that.clipData.markInPT);
                                if (newPlayerTime <= 0) {
                                    newPlayerTime = 0;
                                }
                                that._clipData.markInPT = newPlayerTime;
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.markInFiveFramesShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.markInFiveFramesShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            if (that.clipData.markInPT > 0) {
                                var newPlayerTime = that.prevFrame(that.clipData.markInPT);
                                for (var i = 0; i < 4; i++) {
                                    newPlayerTime = that.prevFrame(that.clipData.markInPT);
                                    if (newPlayerTime <= 0) {
                                        newPlayerTime = 0;
                                        break;
                                    }
                                }
                                that._clipData.markInPT = newPlayerTime;
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.markOutOneFrameShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.markOutOneFrameShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            if (that.clipData.markOutPT > 0) {
                                var newPlayerTime = that.nextFrame(that.clipData.markOutPT);
                                var duration = that.player.duration();
                                if (newPlayerTime > duration) {
                                    newPlayerTime = duration;
                                }
                                that._clipData.markOutPT = newPlayerTime;
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.markOutFiveFramesShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.markOutFiveFramesShortcut, function () {
                        if (that.mode == EditorModes.Rendered) {
                            if (that.clipData.markOutPT > 0) {
                                var newPlayerTime = that.nextFrame(that.clipData.markOutPT);
                                var duration = that.player.duration();
                                for (var i = 0; i < 4; i++) {
                                    newPlayerTime = that.nextFrame(that.clipData.markOutPT);
                                    if (newPlayerTime > duration) {
                                        newPlayerTime = duration;
                                        break;
                                    }
                                }
                                that._clipData.markOutPT = newPlayerTime;
                            }
                        }
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.clearInShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.clearInShortcut, function () {
                        that._clipData.markInPT = -1;
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.clearOutShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.clearOutShortcut, function () {
                        that._clipData.markOutPT = -1;
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.clearBothShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.clearBothShortcut, function () {
                        that._clipData.markInPT = -1;
                        that._clipData.markOutPT = -1;
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.changeModeVirtualShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.changeModeVirtualShortcut, function () {
                        that.mode = EditorModes.Virtual;
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.changeModeRenderedShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.changeModeRenderedShortcut, function () {
                        that.mode = EditorModes.Rendered;
                    });
                }
                if (this._amveCore.keyboardShortcutConfig.changeModeTrimShortcut) {
                    this._keyboardShortcutMgr.addShortcut(this._amveCore.keyboardShortcutConfig.changeModeTrimShortcut, function () {
                        that.mode = EditorModes.Trim;
                    });
                }
            }
        }

        /**
         * Given a CSS style pixel value (100px), returns the root number (100)
         * Used for calculated layouts, etc.
         *
         * @param  {string} value CSS style pixel value (100px)
         * @return {number} The root number (100)
         */
        public pxToNumber(value: string): number {
            var padding: number = 0;


            if (value && value != '0' && value.indexOf('px') > 0) {
                padding = parseInt(value.substring(0, value.length - 2));
            }

            return padding;
        }

        /**
         * Given an element, returns its position on the screen as a ClientRect
         * Used for calculated layouts, etc.
         *
         * @param  {HTMLElement} element the target element
         * @return {ClientRect} element's position on the screen
         */
        public findPosition(element: HTMLElement): Box {
            var box: Box;
            var docEl, body, clientLeft, scrollLeft, left, clientTop, scrollTop, top;

            if (element.getBoundingClientRect && element.parentNode) {
                box = Box.fromClientRect(element.getBoundingClientRect());
            }

            if (!box) {
                box = new Box();
                return box;
            }

            docEl = document.documentElement;
            body = document.body;

            clientLeft = docEl.clientLeft || body.clientLeft || 0;
            scrollLeft = window.pageXOffset || body.scrollLeft;
            left = box.left + scrollLeft - clientLeft;

            clientTop = docEl.clientTop || body.clientTop || 0;
            scrollTop = window.pageYOffset || body.scrollTop;
            top = box.top + scrollTop - clientTop;

            // Android sometimes returns slightly off decimal values, so need to round
            box.left = Math.round(left);
            box.top = Math.round(top);
            return box;
        }

        /**
         * Given a time in seconds, returns its percentage of the player's current source duration
         * Used for filling the scrubber timeline, etc.
         *
         * @param  {number} time the target time in seconds
         * @return {number} percentage of player's current source duration
         */
        public getDurationPercentage(time: number): number {
            var duration = this.player.duration();
            if (time == 0 || duration == 0)
                return 0;

            if (time < 0)
                time = this.player.currentTime();

            if (time >= duration) {
                return 1;
            }

            return time / duration;
        }

        /**
         * Given an time and a target element, returns the time's percentage of the target element's width
         * Used for filling the scrubber timeline, etc.
         *
         * @param  {number} time the target time in seconds
         * @param  {HTMLElement} element the target element
         * @return {number} percentage of player's current source duration expressed as a percentage of the 
         * element's width
         */
        public getCWPercentage(time: number, element: HTMLElement): number {
            var pct = this.getDurationPercentage(time);
            return (element.clientWidth * pct);
        }

        /**
         * Given a pointer event and an element, returns the event's X distance from the element
         * Used for positioning timeline elements, etc.
         *
         * @param  {any} evt the target pointer event
         * @param  {HTMLElement} element the target element
         * @return {number} evt's X distance from the target element
         */
        public calculateDistanceX(evt, element: HTMLElement): number {
            var box, boxX, boxW, pageX;

            box = this.findPosition(element);

            // Workaround for IE bug, where offsetWidth is wrong in iFrame.
            boxW = Math.max(element.offsetWidth, element.clientWidth);
            boxX = box.left;

            if (evt) {
                if (evt.changedTouches && evt.changedTouches.length > 0) {
                    pageX = evt.changedTouches[0].pageX;
                } else {
                    pageX = evt.pageX;
                }
            } else {
                pageX = 0;
            }

            // Percent that the click is through the adjusted area
            var distance = Math.max(0, Math.min(1, (pageX - boxX) / boxW));
            return distance;
        }

        /**
         * Given a pointer event and an element, returns the event's Y distance from the element
         * Used for positioning timeline elements, etc.
         *
         * @param  {any} evt the target pointer event
         * @param  {HTMLElement} element the target element
         * @return {number} evt's Y distance from the target element
         */
        public calculateDistanceY(evt, element: HTMLElement): number {
            var box, boxY, boxH, pageY;

            box = this.findPosition(element);

            // Workaround for IE bug, where offsetWidth is wrong in iFrame.
            boxH = Math.max(element.offsetHeight, element.clientHeight);
            boxY = box.top;

            if (evt) {
                if (evt.changedTouches) {
                    pageY = evt.changedTouches[0].pageY;
                } else {
                    pageY = evt.pageY;
                }
            } else {
                pageY = 0;
            }

            // Percent that the click is through the adjusted area
            var distance = Math.max(0, Math.min(1, (pageY - boxY) / boxH));
            return distance;
        }

        /**
         * Given an element tag and an array of css claases, creates and returns the desired element with 
         * the class list added to the class attribute
         *
         * @param  [{string}] classList the list of classes to add to the class attr
         * @param  {string} elementTag the type of tag to create, default = 'div'
         * @return {HTMLElement} the resultant HTMLELement
         */
        public createElement(classList: string[], elementTag: string = 'div'): HTMLElement {
            var element = document.createElement(elementTag);
            if (classList) {
                classList.forEach(function (className) {
                    element.classList.add(className);
                });
            }
            element.tabIndex = 0;
            return element;
        }

        /**
         * Given an element, appends it as a child of the container
         *
         * @param  {HTMLElement} element the HTMLElement to append to the container
         */
        public appendChild(element: HTMLElement) {
            if (element) {
                this._container.appendChild(element);
            }
        }

        /**
         * Given an element, appends it as a child of the bottom container
         *
         * @param  {HTMLElement} element the HTMLElement to append to the bottom container
         */
        public appendBottomChild(element: HTMLElement) {
            if (element) {
                this._bottom.appendChild(element);
            }
        }

        /**
         * Shows/Hides the submit dialog
         *
         * @param  {boolean} flag if true shows the dialog otherwise hides it
         */
        public toggleSubmitDlg(flag: number = -1): void {
            var that = this;
            if (flag == 0) {
                this._submitToggle = false;
            } else if (flag == 1) {
                this._submitToggle = true;
            }
            if (this._submitToggle == true) {
                this._submitDlg.style.display = 'block';
                that._submitDlg.resize();
                var pt = this.player.currentTime();
                this.player.currentTime(this.clipData.markInPT);
                var playerWidth = that._playerContainer.clientWidth;
                var playerHeight = that._playerContainer.clientHeight;
                this.captureThumbnail(this.clipData.markInPT, function (thumbnail: ThumbnailData) {
                    if (thumbnail) {
                        that._playerCoverImage.src = thumbnail.dataUrl;
                        that._playerCoverImage.width = playerWidth;
                        that._playerCoverImage.height = playerHeight;
                        that._playerCoverImage.style.top = that._topControlBar.clientHeight + 'px';
                        that._playerCoverImage.style.display = 'block';
                    }
                    that._submitToggle = false;
                    that.player.currentTime(pt);
                    that.generateThumbnails();
                }, playerWidth, playerHeight);
            } else {
                this._playerCoverImage.style.display = 'none';
                this._submitDlg.style.display = 'none';
                this._submitToggle = true;
            }
        }

        /**
         * Shows/Hides the settings dialog
         *
         * @param  {boolean} flag if true shows the dialog otherwise hides it
         */
        public toggleSettingsDlg(flag: number = -1): void {
            if (flag == 0) {
                this._settingsToggle = false;
            } else if (flag == 1) {
                this._settingsToggle = true;
            }

            if (this._settingsToggle == true) {
                this._settingsDlg.style.display = 'block';
                this._settingsToggle = false;
            } else {
                this._settingsDlg.style.display = 'none';
                this._settingsToggle = true;
            }
        }

        /**
         * Ensures that the clip meets the minimum length.
         * If not, changes the markIn and/or markOut to meet the minimum requirements.
         * Returns the resultant clip duration 
         *
         * @return {number} the duration in seconds of the clip between markIn and markOut
         */
        public checkClipDuration(): number {
            if (this._clipData.markInPT >= 0 && (this.mode == EditorModes.Trim || this._clipData.markOutPT > 0)) {
                var clipDuration = this.player.duration() - this._clipData.markInPT;
                if (this.mode != EditorModes.Trim) {
                    clipDuration = this._clipData.markOutPT - this._clipData.markInPT;
                }

                if (clipDuration < this.minClipDuration) {
                    if (this._clipData.markOutPT >= (this.player.duration() - this.minClipDuration)) {
                        this._clipData.markInPT = this._clipData.markInPT - this.minClipDuration;
                    } else {
                        this._clipData.markOutPT = (this._clipData.markOutPT  + this.minClipDuration), true;
                    }
                }

                return clipDuration;
            } else if (this._clipData.markInPT >= 0) {
                return this.player.duration() - this._clipData.markInPT;
            } else {
                return this.player.duration();
            }
        }

        /**
         * Returns the PTO
         *
         * @return {number} the PTO
         */
        public currentPresentationTimeOffset(): number {
            return this.player.currentMediaTime() - this.player.currentAbsoluteTime();
        }

        /**
         * Given a player time, returns the associated media time
         *
         * @param  {number} playerTime the player time in seconds
         * @return {number} the associated media time in seconds
         */
        public toMediaTime(playerTime: number): number {
            if (playerTime > 0) {
                if (this.player.isLive()) {
                    return this.player.toPresentationTime(playerTime) + this.currentPresentationTimeOffset();
                } 
            }
             

            return playerTime;
        }

        /**
         * Given a media time, returns the associated media time
         *
         * @param  {number} mediaTime the media time in seconds
         * @return {number} the associated player time in seconds
         */
        public fromMediaTime(mediaTime: number): number {
            if (mediaTime > 0) {
                if (this.player.isLive()) {
                    var pto = this.currentPresentationTimeOffset();
                    var mt = this.player.fromPresentationTime(mediaTime - pto);
                    return mt;
                }
            }


            return mediaTime;
        }

        /**
         * Given a time, returns the closest frame using the configured frameRateVal
         *
         * @param  {number} time the target time in seconds
         * @return {number} time in seconds of the closest frame to the target time
         */
        public closestFrame(time: number, direction: number = 0): number {
            var frVal = this.frameRateVal();
            if ((time % frVal) != 0) {
                var frames = Math.round((time / frVal));
                time = frames * frVal;
            }

            if (time < 0) {
                time = 0;
            } else if (time > this.player.duration()) {
                time = this.player.duration();
            }

            return time;
        }

        /**
         * Given a time, returns the previous closest frame using the configured frameRateVal
         *
         * @param  {number} time the target time in seconds
         * @return {number} time in seconds of previous frame to the target time
         */
        public prevFrame(time: number): number {
            var frVal = this.frameRateVal();
            var prevFrame = this.closestFrame(time, -1) - frVal;
            if (prevFrame < 0) {
                prevFrame = 0;
            }
            return prevFrame;
        }

        /**
         * Given a time, returns the next closest frame using the configured frameRateVal
         *
         * @param  {number} time the target time in seconds
         * @return {number} time in seconds of next frame to the target time
         */
        public nextFrame(time: number): number {
            var frVal = this.frameRateVal();
            var nextFrame = this.closestFrame(time, 0) + frVal;
            var duration = this.player.duration();
            if (nextFrame > duration) {
                nextFrame = this.player.duration();
            }
            return nextFrame;
        }

        /**
         * Given a time, returns the closest GOP using the player.segmentBoundaries
         *
         * @param  {number} time the target time in seconds
         * @return {number} time in seconds of next gop to the target time
         */
        public closestGop(time: number, direction: number = 0): number {
            var segmentBoundaries = this.player.segmentBoundaries();
            var sanitizedTime = time;

            if (segmentBoundaries) {
                segmentBoundaries.sort((n1, n2) => n1 - n2);
                if (this.player.isLive()) {
                    sanitizedTime = this.player.toPresentationTime(sanitizedTime);
                }

                var index = segmentBoundaries.indexOf(sanitizedTime);
                if (index != -1 && direction == 0) {
                    if (this.player.isLive()) {
                        sanitizedTime = this.player.fromPresentationTime(sanitizedTime);
                    }
                    return sanitizedTime;
                } else {
                    var pushed = false;
                    if (sanitizedTime >= segmentBoundaries[0] && sanitizedTime <= segmentBoundaries[segmentBoundaries.length - 1]) {
                        if (index == -1) {
                            segmentBoundaries.push(sanitizedTime);
                            segmentBoundaries.sort((n1, n2) => n1 - n2);
                            pushed = true;
                            index = segmentBoundaries.indexOf(sanitizedTime);
                        }
                        var newIndex = (direction < 0) ? index - 1 : index + 1;
                        if (this.player.isLive()) {
                            newIndex = (direction < 0) ? newIndex - 1 : newIndex + 2;
                        }
                        if (newIndex < 0) {
                            newIndex = 0;
                        }
                        else if (newIndex > segmentBoundaries.length - 1) {
                            newIndex = segmentBoundaries.length - 1;
                        }
                        var st = segmentBoundaries[index];
                        var gop = segmentBoundaries[newIndex];
                        if (pushed) {
                            segmentBoundaries.splice(index, 1);
                        }
                    } else {
                        gop = (direction < 0) ? segmentBoundaries[0] : segmentBoundaries[segmentBoundaries.length - 1];
                    }

                    if (this.player.isLive()) {
                        gop = this.player.fromPresentationTime(gop);
                    }
                    return gop;
                }
            } else {
                return this.player.duration();
            }
        }

        /**
         * Given a time, returns the previous closest GOP using the player.segmentBoundaries
         *
         * @param  {number} time the target time in seconds
         * @return {number} time in seconds of previous gop to the target time
         */
        public prevGop(time: number): number {
            return this.closestGop(time, -1);
        }

        /**
         * Given a time, returns the next closest GOP using the player.segmentBoundaries
         *
         * @param  {number} time the target time in seconds
         * @return {number} time in seconds of next gop to the target time
         */
        public nextGop(time: number): number {
            return this.closestGop(time, 1);
        }

        /**
         * Given a startTime (-1 = start of stream), endTime (-1 = duration) and numberOfFrames, calculates and returns an array of times representing the keyframes 
         * between the startTime and endTime
         *
         * @param  {number} startTime the target start time in seconds, default is -1
         * @param  {number} endTime the target end time in seconds, default is -1
         * @param  {number} numFrames the number of keyframes to return, default is -1
         * @return  [{number}] the resultant keyframe times in seconds
         */
        private getKeyframes(startTime: number = -1, endTime: number = -1, numFrames: number = -1): Array<number> {
            if (startTime == -1) {
                startTime = 0;
            }

            if (endTime == -1) {
                endTime = this.player.duration();
            }

            if ((endTime - startTime) > this.frameRateVal()) {
                var keyFrames = new Array<number>();
                var lastFrame = this.closestFrame(startTime);
                keyFrames.push(lastFrame);
                var frameCount = 1;
                while (lastFrame < endTime && (numFrames < 1 || frameCount < numFrames)) {
                    frameCount++;
                    var nextFrame = this.nextFrame(lastFrame);
                    if (nextFrame > lastFrame) {
                        lastFrame = nextFrame;
                        keyFrames.push(lastFrame);
                    } else {
                        break;
                    }
                }
                keyFrames.sort((n1, n2) => n1 - n2);
                return keyFrames;
            }

            return null;
        }

        /**
         * Generates thumbnailCount thumbnails between the markIn and markOut points
         */
        public generateThumbnails(): void {
            this.isThumbnailsGenerating = true;
            this.thumbnails = new Array<ThumbnailData>();
            if (this.clipData.markInPT >= 0 && (this.mode == EditorModes.Trim || this.clipData.markOutPT > 0)) {

                var wasPaused = this.player.paused();
                var lastPosition = this.player.currentTime();
                this.player.pause();
                var that = this;
                var tnCount = 0;
                var lastTime = this.clipData.markInPT;
                var endTime = that.player.duration();
                if (that.mode != EditorModes.Trim) {
                    endTime = that.clipData.markOutPT;
                }

                var tnFreq = Math.round(that.checkClipDuration() / that.thumbnailCount);

                getTn();

                function getTn() {
                    if (tnCount < that._thumbnailCount && lastTime <= endTime) {
                        that.player.currentTime(lastTime);
                        that.captureThumbnail(lastTime, function (thumbnail: ThumbnailData) {
                            if (thumbnail) {
                                that.thumbnails.push(thumbnail);
                            }
                            lastTime += tnFreq;
                            tnCount++;
                            getTn();
                        });
                    } else {
                        that.thumbnails.sort((n1, n2) => n1.time - n2.time);
                        that.player.currentTime(lastPosition);
                        if (wasPaused == false) {
                            that.player.play();
                        }
                        that.isThumbnailsGenerating = false;
                    }
                }
            }
        }

        /**
         * Given a time and a callback, generates a thumbnail at the given time and passes a ThumbnailData to
         * the callback when complete
         * 
         * @param  {number} time the target time to capture a thumbnail for
         * @param  {(thumbnail: ThumbnailData) => any)} callback the callback to call when the thumbnail is generated
         * @param {number} optional scaleWidth defaults to 160
         * @param {number} optional scaleHeight defaults to 120
         */
        private captureThumbnail(time: number, callback: (thumbnail: ThumbnailData) => any, scaleWidth: number = 160, scaleHeight: number = 120): void {
            var that = this;
            this.player.currentTime(time);
            var captureCanvas = this._thumbnailGeneratorCanvas;
            var videoElm = this.player.playerElement().getElementsByTagName('video')[0];
            captureCanvas.width = scaleWidth;
            captureCanvas.height = scaleHeight;
            captureCanvas.style.width = scaleWidth + 'px';
            captureCanvas.style.height = scaleHeight + 'px';
            var context2d = captureCanvas.getContext('2d');

            var pauseInterval = setInterval(function () {
                if (!that.player.seeking()) {
                    clearInterval(pauseInterval);
                    context2d.drawImage(videoElm, 0, 0, scaleWidth, scaleHeight);
                    var thumbnail = null;
                    var dataUrl = captureCanvas.toDataURL('image/png', 0.5);
                    if (dataUrl) {
                        thumbnail = new ThumbnailData(time, dataUrl, scaleWidth, scaleHeight, 'image/png');
                    }
                    callback(thumbnail);
                }
            }, 100);
        }

        /**
         * Given the number of seconds formats and returns a time string as hh:mm:ss:ff
         * 
         * @param  {number} time the target time
         * @return {string} the resultant formatted time string hh:mm:ss:ff
         */
        public formatTime(time: number): string {
            var hs: number = Math.floor(time * 100) % 100,
                s: number = Math.floor(time % 60),
                m: number = Math.floor(time / 60) % 60,
                h: number = Math.floor(time / 3600) % 3600;

            var returnVal: string = '';

            returnVal = returnVal + (h < 10 ? ('0' + h) : ('' + h));
            returnVal = returnVal + ':' + (m < 10 ? ('0' + m) : ('' + m));
            returnVal = returnVal + ':' + (s < 10 ? ('0' + s) : ('' + s));

            return returnVal;
        }

        public formatTimeWords(time: number): string {
            var hs: number = Math.floor(time * 100) % 100,
                s: number = Math.floor(time % 60),
                m: number = Math.floor(time / 60) % 60,
                h: number = Math.floor(time / 3600) % 3600;

            var returnVal: string = '';

            returnVal = returnVal + (h > 0 ? (h + ' hours<br/>') : '');
            returnVal = returnVal + (m > 0 ? ((returnVal.length > 0 ? (' ') : '') + m + ' mins<br/>') : '');
            returnVal = returnVal + (s > 0 ? ((returnVal.length > 0 ? (' ') : '') + s + ' secs') : '');

            return returnVal;
        }

        /**
         * Parses the number of seconds reprensted in a time string hh:mm:ss:ff
         * 
         * @param  {string} timeVal the target time as a string hh:mm:ss:ff
         * @return {number} the resultant number of seconds in the parsed time string
         */
        public parseTime(timeVal: string): number {
            var seconds: number = -1;
            if (timeVal && timeVal.indexOf(':') > 0) {
                var newTimeVal = timeVal;
                var h: number = 0;
                var m: number = 0;
                var s: number = 0;
                var hs: number = 0;

                var parts = newTimeVal.split(':');

                if (parts.length == 4) {
                    h = parseInt(parts[0]);
                    m = parseInt(parts[1]);
                    s = parseInt(parts[2]);
                    hs = parseInt(parts[3]);

                    seconds = (h * 3600) + (m * 60) + s + (hs / 100);
                }
            }

            return seconds;
        }

        /**
         * Given a AMVEFrameRates, returns the FPS
         *
         * @param  {AMVEFrameRates} frameRate value
         * @return {number} The frameRate as a number (23.976, 25, 29.976, 30 or 60)
         */
        public frameRateBaseVal(frameRate: AMVEFrameRates): number {
            var val: number = 1;
            switch (frameRate) {
                case AMVEFrameRates.TwentyThreeNineSevenSixFPS:
                    val = 23.976;
                    break;
                case AMVEFrameRates.TwentyFiveFPS:
                    val = 25;
                    break;
                case AMVEFrameRates.TwentyNineNineSevenSixFPS:
                    val = 29.976;
                    break;
                case AMVEFrameRates.ThirtyFPS:
                    val = 30;
                    break;
                case AMVEFrameRates.SixtyFPS:
                    val = 60;
                    break;
            }
            return val;
        }

        /**
         * Given a AMVEFrameRates, returns the FPS as 1/value
         *
         * @param  {AMVEFrameRates} frameRate value (AMVEFrameRates.ThirtyFPS)
         * @return {number} The frameRate as a fraction (1/23.976, 1/25, 1/29.976, 1/30 or 1/60)
         */
        public frameRateVal(frameRate: AMVEFrameRates = null): number {
            if (!frameRate) {
                frameRate = this.frameRate;
            }
            return 1 / this.frameRateBaseVal(frameRate);
        }

        /**
         * Given a AMVEFrameRates, returns a formatted string (30 fps)
         * 
         * @param  {AMVEFrameRates} frameRate value (AMVEFrameRates.ThirtyFPS)
         * @return {string} the AMVEFrameRates as a string (30 fps) 
         */
        public frameRateToString(frameRate: AMVEFrameRates): string {
            return this.frameRateBaseVal(frameRate) + ' fps';
        }

        /**
         * Clears markIn, markOut and clipData
         * Closes all dialogs
         * Sets the player time to 0 (or live edge in live streams)
         * Triggers reset 
         * 
         * @param  {boolean} isNewStream tells the editor that a new stream has been loaded, default = false
         */
        public reset(isNewStream: boolean = false): void {
            this._clipData.src = this.player.currentSrc();
            this._clipData.markInPT = -1;
            this._clipData.markOutPT = -1;
            this._markInLiveEdge = -1;
            this._markOutLiveEdge = -1;
            this.toggleSubmitDlg(0);
            if (isNewStream) {
                if (this.player.isLive()) {
                    if (this.player.currentPlayableWindow()) {
                        this.player.currentTime(this.player.fromPresentationTime(this.player.currentPlayableWindow().endInSec));
                        this.trigger('liveedge');
                    }
                }
            } else {
                if (!this.player.isLive()) {
                    this.player.currentTime(0);
                }
            }
            this.trigger('reset');
        }

        /**
         * Adds an event listener to the container
         * 
         * @param  {string} event the name of the event to listen for
         * @param  {EventListener} eventListener the event listener to add
         */
        public addContainerEventListener(event: string, eventListener: EventListener) {
            this._container.addEventListener(event, eventListener);
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