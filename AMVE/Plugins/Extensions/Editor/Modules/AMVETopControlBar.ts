import { EditorModes } from "../Modules/Common"
import { Tooltips } from "../Modules/Tooltips";
import { AMVEUX } from "../Modules/AMVEUX";


module AMVE {
    /**
     * Internal class used by AMVEUX to build the top control bar
     * Appears on top of the player
     */
    export class AMVETopControlBar {
        private _amveUX: AMVEUX;
        private _controlBarElement: HTMLElement;
        private _leftCol: HTMLElement;
        private _rightCol: HTMLElement;
        private _submitDialogTitle: HTMLElement;
        private _topMenu: HTMLElement;
        private _trimBtn: HTMLElement;
        private _virtualBtn: HTMLElement;
        private _renderedBtn: HTMLElement;
        private _settingsBtn: HTMLElement;
        private _submitDialog: HTMLElement;
        private _submitDialogDescription: HTMLTextAreaElement;
        private _submitDialogCustom: HTMLElement;
        private _submitDialogDisplayToggle: boolean = false;

        constructor(amveUX: AMVEUX) {
            var that = this;
            this._amveUX = amveUX;

            this._controlBarElement =
                this._amveUX.createElement(['amve-top-controlbar']);
            this._amveUX.appendChild(this._controlBarElement);

            this._leftCol =
                this._amveUX.createElement(['amve-left-column']);
            this._controlBarElement.appendChild(this._leftCol);

            this._rightCol =
                this._amveUX.createElement(['amve-right-column']);
            this._controlBarElement.appendChild(this._rightCol);

            this._submitDialogTitle =
                this._amveUX.createElement(['amve-submitdlg-title']);
            this._leftCol.appendChild(this._submitDialogTitle);

            this._topMenu =
                this._amveUX.createElement(['amve-top-menu']);
            this._rightCol.appendChild(this._topMenu);

            this._trimBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-trim-btn']);
            this._trimBtn.innerHTML = 'trim';
            this._trimBtn.title = Tooltips.Trim;
            this._topMenu.appendChild(this._trimBtn);

            this._virtualBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-virtual-btn']);
            this._virtualBtn.innerHTML = 'virtual';
            this._virtualBtn.title = Tooltips.Virtual;
            this._topMenu.appendChild(this._virtualBtn);

            this._renderedBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-text', 'amve-rendered-btn']);
            this._renderedBtn.innerHTML = 'rendered';
            this._renderedBtn.title = Tooltips.Rendered;
            this._topMenu.appendChild(this._renderedBtn);

            this._settingsBtn =
                this._amveUX.createElement(['amve-btn', 'amve-btn-control', 'amve-settings-btn']);
            this._topMenu.appendChild(this._settingsBtn);

            this._amveUX.addPropertyChangedListener('mode', checkMode);

            this._settingsBtn.addEventListener('click', function () {
                that._amveUX.toggleSettingsDlg();
            });

            checkMode();

            /**
             * Highlights the current mode button 
             */
            function checkMode(): void {
                switch (that._amveUX.mode) {
                    case EditorModes.Trim:
                        if (!that._trimBtn.classList.contains('amve-selected')) {
                            that._trimBtn.classList.add('amve-selected');
                        }
                        if (that._virtualBtn.classList.contains('amve-selected')) {
                            that._virtualBtn.classList.remove('amve-selected');
                        }
                        if (that._renderedBtn.classList.contains('amve-selected')) {
                            that._renderedBtn.classList.remove('amve-selected');
                        }
                        break;
                    case EditorModes.Virtual:
                        if (that._trimBtn.classList.contains('amve-selected')) {
                            that._trimBtn.classList.remove('amve-selected');
                        }
                        if (!that._virtualBtn.classList.contains('amve-selected')) {
                            that._virtualBtn.classList.add('amve-selected');
                        }
                        if (that._renderedBtn.classList.contains('amve-selected')) {
                            that._renderedBtn.classList.remove('amve-selected');
                        }
                        break;
                    case EditorModes.Rendered:
                        if (that._trimBtn.classList.contains('amve-selected')) {
                            that._trimBtn.classList.remove('amve-selected');
                        }
                        if (that._virtualBtn.classList.contains('amve-selected')) {
                            that._virtualBtn.classList.remove('amve-selected');
                        }
                        if (!that._renderedBtn.classList.contains('amve-selected')) {
                            that._renderedBtn.classList.add('amve-selected');
                        }
                        break;
                }
            }

            /**
             * Changes mode to EditorModes.Trim
             */
            this._trimBtn.addEventListener('click', function () {
                if (that._amveUX.mode != EditorModes.Trim) {
                    that._amveUX.mode = EditorModes.Trim;
                }
            });

            /**
             * Changes mode to EditorModes.Virtual
             */
            this._virtualBtn.addEventListener('click', function () {
                if (that._amveUX.mode != EditorModes.Virtual) {
                    that._amveUX.mode = EditorModes.Virtual;
                }
            });

            /**
             * Changes mode to EditorModes.Rendered
             */
            this._renderedBtn.addEventListener('click', function () {
                if (that._amveUX.mode != EditorModes.Rendered) {
                    that._amveUX.mode = EditorModes.Rendered;
                }
            });
        }

        /**
         * The overall clientHeight of the AMVETopControlBar 
         * 
         * @return {number} The overall clientHeight of the AMVETopControlBar 
         */
        public get clientHeight(): number {
            return this._controlBarElement.clientHeight;
        }
    }
}

export = AMVE;
