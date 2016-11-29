/// <reference path='../Modules/Common.ts' />
/// <reference path='../Modules/AMVEUX.ts' />

"use strict";

module AMVE {
    /**
     * Internal class used by AMVEUX to build the settings dialog
     */
    export class AMVESettingsDialog {
        private _amveUX: AMVEUX;
        private _settingsContainer: HTMLElement;
        private _settingsDialogContent: HTMLElement;
        private _settingsTitleBar: HTMLElement;
        private _leftColTop: HTMLElement;
        private _rightColTop: HTMLElement;
        private _settingsTitle: HTMLElement;
        private _settingsCloseBtn: HTMLElement;
        private _settingsFrameRateLabel: HTMLElement;
        private _settingsFrameRateInput: HTMLSelectElement;
        private _settingsThumbnailCountLabel: HTMLElement;
        private _settingsThumbnailCount: HTMLElement;
        private _settingsThumbnailCountInput: HTMLInputElement;
        private _settingsThumbnailCountDisplay: HTMLElement;
        private _settingsBtnBar: HTMLElement;
        private _settingsBtnBarMargin: HTMLElement;
        private _settingsCancelBtn: HTMLElement;
        private _settingsSaveBtn: HTMLElement;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;

            this._settingsContainer =
                this._amveUX.createElement(['amve-modal', 'amve-settings']);
            this._amveUX.appendChild(this._settingsContainer);

            this._settingsDialogContent =
                this._amveUX.createElement(['amve-modal-content', 'amve-settings-content']);
            this._settingsContainer.appendChild(this._settingsDialogContent);

            this._settingsTitleBar =
                this._amveUX.createElement(['amve-settings-title-bar']);
            this._settingsDialogContent.appendChild(this._settingsTitleBar);

            this._leftColTop =
                this._amveUX.createElement(['amve-left-column']);
            this._settingsTitleBar.appendChild(this._leftColTop);

            this._rightColTop =
                this._amveUX.createElement(['amve-right-column']);
            this._settingsTitleBar.appendChild(this._rightColTop);

            this._settingsTitle =
                this._amveUX.createElement(['amve-settings-title']);
            this._settingsTitle.innerHTML = 'settings'
            this._leftColTop.appendChild(this._settingsTitle);

            this._settingsCloseBtn =
                this._amveUX.createElement(['amve-btn-control', 'amve-close-btn']);
            this._rightColTop.appendChild(this._settingsCloseBtn);

            this._settingsFrameRateLabel =
                this._amveUX.createElement(['amve-settings-framerate-label']);
            this._settingsFrameRateLabel.innerHTML = 'frame rate:';
            this._settingsDialogContent.appendChild(this._settingsFrameRateLabel);

            /**
             * Given the AMVEFrameRates value, creates an option element and adds it the the 
             * settings dialog's frame rate selection element
             * 
             * @param  {AMVEFrameRates} rate the target AMVEFrameRates value
             * @param  {boolean} selected should the option be marked as selected, default is false
             */
            function buildFrameRateOption(rate: AMVEFrameRates, selected: boolean = false): HTMLOptionElement {
                var option = <HTMLOptionElement>that._amveUX.createElement(null, 'option');
                option.innerText = that._amveUX.frameRateToString(rate);
                option.value = '' + rate;
                option.selected = selected;
                return option;
            }

            this._settingsFrameRateInput =
                <HTMLSelectElement>this._amveUX.createElement(['amve-settings-framerate-input'], 'select');
            this._settingsFrameRateInput.add(buildFrameRateOption(AMVEFrameRates.TwentyThreeNineSevenSixFPS));
            this._settingsFrameRateInput.add(buildFrameRateOption(AMVEFrameRates.TwentyFiveFPS));
            this._settingsFrameRateInput.add(buildFrameRateOption(AMVEFrameRates.TwentyNineNineSevenSixFPS));
            this._settingsFrameRateInput.add(buildFrameRateOption(AMVEFrameRates.ThirtyFPS, true));
            this._settingsFrameRateInput.add(buildFrameRateOption(AMVEFrameRates.SixtyFPS));

            this._settingsDialogContent.appendChild(this._settingsFrameRateInput);

            this._settingsThumbnailCountLabel =
                this._amveUX.createElement(['amve-settings-thumbnailcount-label']);
            this._settingsThumbnailCountLabel.innerHTML = '# of thumbnail choices:';
            this._settingsDialogContent.appendChild(this._settingsThumbnailCountLabel);

            this._settingsThumbnailCount =
                this._amveUX.createElement(['amve-settings-thumbnailcount']);
            this._settingsDialogContent.appendChild(this._settingsThumbnailCount);

            this._settingsThumbnailCountInput =
                <HTMLInputElement>this._amveUX.createElement(['amve-settings-thumbnailcount-input'], 'input');
            this._settingsThumbnailCountInput.setAttribute('type', 'range');
            this._settingsThumbnailCountInput.min = '1';
            this._settingsThumbnailCountInput.max = '10';
            this._settingsThumbnailCountInput.step = '1';
            this._settingsThumbnailCountInput.value = '' + this._amveUX.thumbnailCount;
            this._settingsThumbnailCount.appendChild(this._settingsThumbnailCountInput);

            this._settingsThumbnailCountDisplay =
                this._amveUX.createElement(['amve-settings-thumbnailcount-display']);
            this._settingsThumbnailCountDisplay.innerHTML = '' + this._amveUX.thumbnailCount;
            this._settingsThumbnailCount.appendChild(this._settingsThumbnailCountDisplay);

            /**
             * Closes the settings dialog
             */
            this._settingsCloseBtn.addEventListener('click', function () {
                that._amveUX.toggleSettingsDlg(0);
            });

            /**
             * When the settingsThumbnailCount range input value changes, updates AMVEUX.thumbnailCount with the value
             */
            this._settingsThumbnailCountInput.addEventListener('change', function () {
                that._settingsThumbnailCountDisplay.innerHTML = that._settingsThumbnailCountInput.value;
                if (that._settingsThumbnailCountInput.valueAsNumber && that._settingsThumbnailCountInput.valueAsNumber != that._amveUX.thumbnailCount) {
                    that._amveUX.thumbnailCount = that._settingsThumbnailCountInput.valueAsNumber;
                }
            });

            /**
             * When the settingsFrameRateInput selected option changes, updates AMVEUX.frameRate with the selected 
             * AMVEFrameRates value
             */
            this._settingsFrameRateInput.addEventListener('change', function () {
                var selectedFrameRateOption = <HTMLOptionElement>that._settingsFrameRateInput.options[that._settingsFrameRateInput.selectedIndex];
                if (selectedFrameRateOption) {
                    var frameRate = parseInt(selectedFrameRateOption.value);
                    if (!isNaN(frameRate)) {
                        that._amveUX.frameRate = frameRate;
                    }
                }
            });
        }

        /**
         * Resizes the settings dialog
         */
        public resize(): void {
            var top = (this._amveUX.clientHeight - this.clientHeight) / 2;
            this._settingsDialogContent.style.top = top + 'px';
        }

        /**
         * The overall clientWidth of the AMVESettingsDialog 
         * 
         * @return {number} The overall clientWidth of the AMVESettingsDialog 
         */
        public get clientWidth(): number {
            return this._settingsDialogContent.clientWidth;
        }

        /**
         * The overall clientHeight of the AMVESettingsDialog 
         * 
         * @return {number} The overall clientHeight of the AMVESettingsDialog 
         */
        public get clientHeight(): number {
            return this._settingsDialogContent.clientHeight;
        }

        /**
         * The style attribute for the settingsContainer
         * 
         * @return {MSStyleCSSProperties} The style attribute for the settingsContainer 
         */
        public get style(): CSSStyleDeclaration {
            return this._settingsContainer.style;
        }
    }
}   