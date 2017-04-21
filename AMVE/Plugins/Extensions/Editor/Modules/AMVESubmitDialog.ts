import { AMVEUX } from "../Modules/AMVEUX";

module AMVE {
    /**
     * Internal class used by AMVEUX to build the submit dialog
     */
    export class AMVESubmitDialog {
        private _amveUX: AMVEUX;
        private _submitDialogContainer: HTMLElement;
        private _submitDialogContent: HTMLElement;
        private _submitDialogTop: HTMLElement;
        private _submitDialogThumbnailsSpinner: HTMLElement;
        private _submitDialogThumbnailsContainer: HTMLElement;
        private _submitDialogThumbnailsLeftArrow: HTMLElement;
        private _submitDialogThumbnails: Array<HTMLImageElement>;
        private _submitDialogThumbnailsRightArrow: HTMLElement;
        // private _submitDialogMiddle: HTMLElement;
        private _submitDialogBottom: HTMLElement;
        private _leftColTop: HTMLElement;
        private _rightColTop: HTMLElement;
        private _submitDialogTitle: HTMLElement;
        private _submitDialogBottomMargin: HTMLElement;
        private _submitDialogCloseBtn: HTMLElement;
        // private _submitDialogEntryTitle: HTMLInputElement;
        // private _submitDialogDescription: HTMLTextAreaElement;
        private _submitDialogCustom: HTMLElement;
        private _submitDialogCancelBtn: HTMLElement;
        private _submitDialogSubmitBtn: HTMLElement;
        private _numThumbnailsToDisplay: number = 3;
        private _currentThumbnailIndex: number = 0;
        private _selectedThumbnailIndex: number = 0;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;

            this._submitDialogContainer =
                this._amveUX.createElement(['amve-modal', 'amve-submitdlg-entry']);
            this._amveUX.appendChild(this._submitDialogContainer);

            this._submitDialogContent =
                this._amveUX.createElement(['amve-modal-content', 'amve-submitdlg-entry-content']);
            this._submitDialogContainer.appendChild(this._submitDialogContent);

            this._submitDialogTop =
                this._amveUX.createElement(['amve-submitdlg-entry-top']);
            this._submitDialogContent.appendChild(this._submitDialogTop);

            this._submitDialogThumbnailsSpinner =
                this._amveUX.createElement(['amve-submitdlg-entry-thumbnails-spinner']);
            this._submitDialogContent.appendChild(this._submitDialogThumbnailsSpinner);

            this._submitDialogThumbnailsContainer =
                this._amveUX.createElement(['amve-submitdlg-entry-thumbnails']);
            this._submitDialogContent.appendChild(this._submitDialogThumbnailsContainer);

            /*
            this._submitDialogMiddle =
                this._amveUX.createElement(['amve-submitdlg-entry-middle']);
            this._submitDialogContent.appendChild(this._submitDialogMiddle);
            */

            this._submitDialogBottom =
                this._amveUX.createElement(['amve-submitdlg-entry-bottom']);
            this._submitDialogContent.appendChild(this._submitDialogBottom);

            this._leftColTop =
                this._amveUX.createElement(['amve-left-column']);
            this._submitDialogTop.appendChild(this._leftColTop);

            this._rightColTop =
                this._amveUX.createElement(['amve-right-column']);
            this._submitDialogTop.appendChild(this._rightColTop);

            this._submitDialogTitle =
                this._amveUX.createElement(['amve-submitdlg-title']);
            this._submitDialogTitle.innerHTML = 'select poster'
            this._leftColTop.appendChild(this._submitDialogTitle);

            this._submitDialogCloseBtn =
                this._amveUX.createElement(['amve-btn-control', 'amve-close-btn']);
            this._rightColTop.appendChild(this._submitDialogCloseBtn);

            this._submitDialogThumbnailsLeftArrow =
                this._amveUX.createElement(['amve-btn-control', 'amve-chevron-left', 'amve-thumbnails-leftarrow', 'amve-btn-disabled']);
            this._submitDialogThumbnailsContainer.appendChild(this._submitDialogThumbnailsLeftArrow);

            this._submitDialogThumbnails = new Array<HTMLImageElement>();

            for (var i = 0; i < this._numThumbnailsToDisplay; i++) {
                var _thumbnail = <HTMLImageElement>this._amveUX.createElement(['amve-thumbnail'], 'img');
                this._submitDialogThumbnailsContainer.appendChild(_thumbnail);
                this._submitDialogThumbnails.push(_thumbnail);

                if (i === 0){
                    _thumbnail.classList.add('amve-selected');
                    that._selectedThumbnailIndex = 0;
                }

                /**
                 * Selects the thumbnail and deselects the others if appropriate
                 */
                _thumbnail.addEventListener('click', function (evt: Event) {
                    var targetTn = <HTMLImageElement>evt.currentTarget;
                    that._submitDialogThumbnails.forEach(function (tn: HTMLImageElement, index: number, thumnails: Array<HTMLImageElement>) {
                        if (tn != targetTn) {
                            tn.classList.remove('amve-selected');
                        }
                    });
                    if (targetTn.classList.contains('amve-selected')) {
                        that._selectedThumbnailIndex = -1;
                        _thumbnail.classList.remove('amve-selected');
                    } else {
                        targetTn.classList.add('amve-selected');
                        that._selectedThumbnailIndex = that._currentThumbnailIndex;
                    }
                });
            }

            this._submitDialogThumbnailsRightArrow =
                this._amveUX.createElement(['amve-btn-control', 'amve-chevron-right', 'amve-thumbnails-rightarrow', 'amve-btn-disabled']);
            this._submitDialogThumbnailsContainer.appendChild(this._submitDialogThumbnailsRightArrow);

            /*
            this._submitDialogEntryTitle =
                <HTMLInputElement>this._amveUX.createElement(['amve-submitdlg-entry-title'], 'input');
            this._submitDialogEntryTitle.setAttribute('type', 'text');
            this._submitDialogEntryTitle.value = 'Title...';
            this._submitDialogMiddle.appendChild(this._submitDialogEntryTitle);

            var submitDialogEntryTitleFirstFocus = function () {
                that._submitDialogEntryTitle.removeEventListener('focus', submitDialogEntryTitleFirstFocus);
                that._submitDialogEntryTitle.value = '';
            };

            this._submitDialogEntryTitle.addEventListener('focus', submitDialogEntryTitleFirstFocus);

            this._submitDialogDescription =
                <HTMLTextAreaElement>this._amveUX.createElement(['amve-submitdlg-entry-description'], 'textarea');
            this._submitDialogDescription.value = 'Description...';
            this._submitDialogMiddle.appendChild(this._submitDialogDescription);

            var submitDialogDescriptionFirstFocus = function () {
                that._submitDialogDescription.removeEventListener('focus', submitDialogDescriptionFirstFocus);
                that._submitDialogDescription.value = '';
            };

            this._submitDialogDescription.addEventListener('focus', submitDialogDescriptionFirstFocus);
            

            this._submitDialogCustom =
                this._amveUX.createElement(['amve-submitdlg-entry-custom']);
            this._submitDialogMiddle.appendChild(this._submitDialogCustom);
            */

            this._submitDialogBottomMargin =
                this._amveUX.createElement(['amve-margin']);
            this._submitDialogBottom.appendChild(this._submitDialogBottomMargin);

            this._submitDialogCancelBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-cancel-btn']);
            this._submitDialogCancelBtn.innerHTML = 'cancel';
            this._submitDialogBottom.appendChild(this._submitDialogCancelBtn);

            this._submitDialogSubmitBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-submit-btn']);
            this._submitDialogSubmitBtn.innerHTML = 'confirm';
            this._submitDialogBottom.appendChild(this._submitDialogSubmitBtn);

            /**
             * Closes the submit dialog when the close button X is clicked
             */
            this._submitDialogCloseBtn.addEventListener('click', function () {
                that._amveUX.toggleSubmitDlg(0);
            });

            /**
             * Closes the submit dialog when the cancel button is clicked
             */
            this._submitDialogCancelBtn.addEventListener('click', function () {
                that._amveUX.clipData.isClipCompleted = false;
            });

            /**
             * Shifts the range of thumnails displayed to the left when the left arrow is clicked
             */
            this._submitDialogThumbnailsLeftArrow.addEventListener('click', function () {
                if (!that._submitDialogThumbnailsLeftArrow.classList.contains('amve-btn-disabled') && that._currentThumbnailIndex > 0) {
                    that._currentThumbnailIndex--;
                    renderThumbnails();
                }
            });

            /**
             * Shifts the range of thumnails displayed to the right when the right arrow is clicked
             */
            this._submitDialogThumbnailsRightArrow.addEventListener('click', function () {
                if (!that._submitDialogThumbnailsRightArrow.classList.contains('amve-btn-disabled') && that._currentThumbnailIndex < (that._amveUX.thumbnails.length - 3)) {
                    that._currentThumbnailIndex++;
                    renderThumbnails();
                }
            });

            /**
             * Submits the clip
             */
            this._submitDialogSubmitBtn.addEventListener('click', function () {
                // that._amveUX.clipData.title = that._submitDialogEntryTitle.value;
                // that._amveUX.clipData.description = that._submitDialogDescription.value;
                if (that._amveUX.thumbnails && that._amveUX.thumbnails.length > 0 && that._selectedThumbnailIndex < that._amveUX.thumbnails.length) {
                    that._amveUX.clipData.thumbnail = that._amveUX.thumbnails[that._selectedThumbnailIndex];
                }
                that._amveUX.clipData.isClipCompleted = true;
            });

            /**
             * Shows the spinner while thumbnails are being generated,
             * Once the thumbnails are generated, renders them in the dialog
             */
            this._amveUX.addPropertyChangedListener('isThumbnailsGenerating', function () {
                if (that._amveUX.isThumbnailsGenerating) {
                    //resetThumbnails();
                    that.resize();
                } else {
                    that._currentThumbnailIndex = 0;
                    // resetThumbnails();
                    renderThumbnails();
                    that.resize();
                }
            });

            /**
             * Resets the thumnail display
             */
            function resetThumbnails() {
                that._submitDialogThumbnailsContainer.style.display = 'none';
                that._submitDialogThumbnailsSpinner.style.display = 'block';
                that._currentThumbnailIndex = 0;
                that._selectedThumbnailIndex = -1;

                if (that._submitDialogThumbnails) {
                    that._submitDialogThumbnails.forEach(function (tn: HTMLImageElement, index: number, thumnails: Array<HTMLImageElement>) {
                        if (tn !== that._submitDialogThumbnails[0]) {
                            tn.style.display = 'none';
                            tn.classList.remove('amve-selected');
                        }
                    });
                }
            }

            /**
             * Given an image element and an index for the amveux.thumbails, 
             * sets the image element's src to the dataUrl from the associated AMVEUX.thumbail
             * and displays the image element.  If the given index is outside the range of amveux.thumbails,
             * hides the image element.
             * 
             * @param  {HTMLImageElement} thumbnailElm the target image element
             * @param  {number} thumbnailIndex the target AMVEUX thumbnail index
             */
            function renderThumbnail(thumbnailElm: HTMLImageElement, thumbnailIndex: number) {
                if (that._amveUX.thumbnails && thumbnailIndex < that._amveUX.thumbnails.length) {
                    var thumbnailData = that._amveUX.thumbnails[thumbnailIndex];
                    if (thumbnailData) {
                        var time = that._amveUX.formatTime(thumbnailData.time);
                        thumbnailElm.alt = time;
                        thumbnailElm.title = time;
                        thumbnailElm.setAttribute('src', thumbnailData.dataUrl);
                        thumbnailElm.style.display = 'block';
                        if (that._selectedThumbnailIndex == thumbnailIndex) {
                            thumbnailElm.classList.add('amve-selected');
                        } else {
                            thumbnailElm.classList.remove('amve-selected');
                        }
                    } else {
                        thumbnailElm.classList.remove('amve-selected');
                        thumbnailElm.style.display = 'none';
                    }
                } else {
                    thumbnailElm.classList.remove('amve-selected');
                    thumbnailElm.style.display = 'none';
                }
            }

            /**
             * Renders a set of the AMVEUX.thumbails 
             */
            function renderThumbnails() {
                if (that._amveUX.thumbnails && that._amveUX.thumbnails.length > 0) {
                    if (that._currentThumbnailIndex < 0) {
                        that._currentThumbnailIndex = 0;
                    } else if (that._currentThumbnailIndex > (that._amveUX.thumbnails.length - 3)) {
                        that._currentThumbnailIndex = (that._amveUX.thumbnails.length - 3);
                    }

                    if (that._submitDialogThumbnails) {
                        that._submitDialogThumbnails.forEach(function (tn: HTMLImageElement, index: number, thumnails: Array<HTMLImageElement>) {

                            var tnIndex = (that._currentThumbnailIndex + index);
                            if (tnIndex < that._amveUX.thumbnails.length) {
                                renderThumbnail(tn, tnIndex);
                            } else {
                                tn.style.display = 'none';
                            }
                        });
                    }

                    that._submitDialogThumbnailsLeftArrow.classList.add('amve-btn-disabled');
                    that._submitDialogThumbnailsRightArrow.classList.add('amve-btn-disabled');

                    if (that._amveUX.thumbnails.length > 3) {
                        if (that._currentThumbnailIndex > 0) {
                            that._submitDialogThumbnailsLeftArrow.classList.remove('amve-btn-disabled');
                        }
                        if (that._currentThumbnailIndex < (that._amveUX.thumbnails.length - 3)) {
                            that._submitDialogThumbnailsRightArrow.classList.remove('amve-btn-disabled');
                        }
                    }
                }

                that._submitDialogThumbnailsSpinner.style.display = 'none';
                that._submitDialogThumbnailsContainer.style.display = 'block';
            }
        }

        /**
         * Resizes the submit dialog
         */
        public resize(): void {
            var top = ((this._amveUX.clientHeight - this.clientHeight) / 2) + 30; // EK Custom fix
            this._submitDialogContent.style.top = top + 'px';
        }

        /**
         * Used for adding a custom DOM fragment to the submit dialog.  Given a container element, 
         * removes it from its parent (if exists) and adds it to the submit dialog.
         * 
         * @param  {HTMLElement} container the target DOM fragment
         */
        public set customMetadataContainer(container: HTMLElement) {
            if (container) {
                if (container.parentElement) {
                    container.parentElement.removeChild(container);
                }

                this._submitDialogCustom.appendChild(container);
                this._submitDialogCustom.style.display = 'none';
            }
        }

        /**
         * The overall clientWidth of the AMVESubmitDialog 
         * 
         * @return {number} The overall clientWidth of the AMVESubmitDialog 
         */
        public get clientWidth(): number {
            return this._submitDialogContent.clientWidth;
        }

        /**
         * The overall clientHeight of the AMVESubmitDialog 
         * 
         * @return {number} The overall clientHeight of the AMVESubmitDialog 
         */
        public get clientHeight(): number {
            return this._submitDialogContent.clientHeight;
        }

        /**
         * The style attribute for the submitDialogContainer
         * 
         * @return {MSStyleCSSProperties} The style attribute for the submitDialogContainer 
         */
        public get style(): CSSStyleDeclaration {
            return this._submitDialogContainer.style;
        }
    }
}

export = AMVE;
