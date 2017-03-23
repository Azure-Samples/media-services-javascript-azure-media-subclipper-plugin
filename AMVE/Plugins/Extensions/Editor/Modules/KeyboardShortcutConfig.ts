/**
 * Used for creating keyboard shorcuts
 */
export class KeyboardShortcut {
    public shortcutTxt: string;
    public callback: Function;
    public shouldPropagate: boolean = false;
    private _keydownListener: EventListener;

    constructor(shortcutTxt: string, callback: Function, keydownListener: EventListener, shouldPropagate: boolean = false) {
        if (shortcutTxt && shortcutTxt.length > 0) {
            this.shortcutTxt = shortcutTxt.toLowerCase();
            this.callback = callback;
            this._keydownListener = keydownListener;
            this.shouldPropagate = shouldPropagate;
        }
    }

    public get keydownListener(): EventListener {
        return this._keydownListener;
    }
}

/**
 * Internal class used managing keyboard shortcuts
 */
export class KeyboardShortcutManager {
    private _shortcuts: Array<KeyboardShortcut> = new Array<KeyboardShortcut>();

    private specialKeys = {
        'esc': 27,
        'escape': 27,
        'tab': 9,
        'space': 32,
        'return': 13,
        'enter': 13,
        'backspace': 8,
        'scrolllock': 145,
        'scroll': 145,
        'capslock': 20,
        'caps': 20,
        'numlock': 144,
        'num': 144,
        'pause': 19,
        'break': 19,
        'insert': 45,
        'home': 36,
        'delete': 46,
        'end': 35,
        'pageup': 33,
        'pagedown': 34,
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,
        'f1': 112,
        'f2': 113,
        'f3': 114,
        'f4': 115,
        'f5': 116,
        'f6': 117,
        'f7': 118,
        'f8': 119,
        'f9': 120,
        'f10': 121,
        'f11': 122,
        'f12': 123,
        '\=': 187,
        '\,': 188,
        '\.': 190,
        '\`': 192
    };

    public addShortcut(shortcutTxt: string, callback: Function, shouldPropagate: boolean = false): void {
        // TODO fix Array.findFirst
        // if (shortcutTxt && shortcutTxt.length > 0 && callback) {
        //     if (!this._shortcuts.findFirst(function (sc) {
        //         return sc.shortcutTxt == shortcutTxt;
        //     })) {
        //         var that = this;

        //         var keydownListener = function (e: any): void {
        //             //Ignore shorcuts from within inputs and textareas
        //             var element;
        //             if (e.target) {
        //                 element = e.target;
        //             }
        //             else if (e.srcElement) {
        //                 element = e.srcElement;
        //             }
        //             if (element && element.nodeType == 3) {
        //                 element = element.parentNode;
        //             }

        //             if (!element || element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') { return };

        //             var combos = shortcutTxt.split('||');
        //             for (var i = 0; i < combos.length; i++) {
        //                 var combo = combos[i].split('+');

        //                 var inputCode = e.keyCode || e.which;

        //                 if (inputCode) {
        //                     var requirements = {
        //                         ctrl: false,
        //                         shift: false,
        //                         alt: false,
        //                         meta: false,
        //                         targetChar: ''
        //                     };

        //                     if (combo.length == 3) {
        //                         requirements.ctrl = (combo[0] == 'ctrl' || combo[1] == 'ctrl');
        //                         requirements.shift = (combo[0] == 'shift' || combo[1] == 'shift');
        //                         requirements.alt = (combo[0] == 'alt' || combo[1] == 'alt');
        //                         requirements.meta = (combo[0] == 'meta' || combo[1] == 'meta');
        //                         requirements.targetChar = combo[2];
        //                     } else if (combo.length == 2) {
        //                         requirements.ctrl = (combo[0] == 'ctrl');
        //                         requirements.shift = (combo[0] == 'shift');
        //                         requirements.alt = (combo[0] == 'alt');
        //                         requirements.meta = (combo[0] == 'meta');
        //                         requirements.targetChar = combo[1];
        //                     } else {
        //                         requirements.targetChar = combo[0];
        //                     }

        //                     var comboMatch =
        //                         (((requirements.ctrl && e.ctrlKey) || (!requirements.ctrl && !e.ctrlKey)) &&
        //                         ((requirements.shift && e.shiftKey) || (!requirements.shift && !e.shiftKey)) &&
        //                         ((requirements.alt && e.altKey) || (!requirements.alt && !e.altKey)) &&
        //                         ((requirements.meta && e.metaKey) || (!requirements.meta && !e.metaKey)));

        //                     if (comboMatch) {
        //                         if (that.specialKeys[requirements.targetChar]) {
        //                             comboMatch = (that.specialKeys[requirements.targetChar] == inputCode);
        //                         } else {
        //                             var inputChar = String.fromCharCode(inputCode).toLowerCase();
        //                             comboMatch = (requirements.targetChar == inputChar);
        //                         }

        //                         if (comboMatch) {
        //                             callback(e);

        //                             if (!shouldPropagate) {
        //                                 //Stop the event
        //                                 e.cancelBubble = true;
        //                                 e.returnValue = false;

        //                                 if (e.preventDefault) {
        //                                     e.preventDefault();
        //                                 }

        //                                 if (e.stopPropagation) {
        //                                     e.stopPropagation();
        //                                 }
        //                                 return;
        //                             }
        //                             break;
        //                         }
        //                     }
        //                 }
        //             }
        //         }

        //         var shortcut = new KeyboardShortcut(shortcutTxt, callback, keydownListener, shouldPropagate);
        //         this._shortcuts.push(shortcut);

        //         document.addEventListener('keydown', keydownListener, false);
        //     } else {
        //         throw new Error('There is already a shortcut registered for: ' + shortcutTxt);
        //     }
        // }
    }

    public removeShortcut(shortcutTxtIn: string): void {
        // TODO fix Array.findFirst
        // var shortcut = this._shortcuts.findFirst(function (sc) {
        //     return sc.shortcutTxt == shortcutTxtIn;
        // });
        // if (shortcut) {
        //     document.removeEventListener('keydown', shortcut.keydownListener, false);
        //     this._shortcuts.splice(this._shortcuts.indexOf(shortcut), 1);
        // }
    }
}

/**
 * Base class for keyboard shortcut configurations
 */
export class KeyboardShortcutConfig {
    public playPauseShortcut: string = 'space';
    public markInShortcut: string = 'i';
    public markOutShortcut: string = 'o';
    public goToInShortcut: string = 'shift+i';
    public goToOutShortcut: string = 'shift+o';
    public clearInShortcut: string = 'ctrl+shift+i';
    public clearOutShortcut: string = 'ctrl+shift+o';
    public clearBothShortcut: string = 'ctrl+shift+x';
    public playInToOutShortcut: string = 'ctrl+shift+space';
    public playToOutShortcut: string = 'ctrl+space';
    public ffwdShortcut: string = 'ctrl+right';
    public rwdShortcut: string = 'ctrl+left';
    public backOneFrameShortcut: string = 'left';
    public backFiveFramesShortcut: string = 'shift+left';
    public backOneSecondShortcut: string = 'alt+shift+left';
    public backOneGopShortcut: string = 'ctrl+shift+left';
    public fwdOneFrameShortcut: string = 'right';
    public fwdFiveFramesShortcut: string = 'shift+right';
    public fwdOneSecondShortcut: string = 'alt+shift+right';
    public fwdOneGopShortcut: string = 'ctrl+shift+right';
    public markInOneFrameShortcut: string = 'alt+,';
    public markInFiveFramesShortcut: string = 'alt+shift+,';
    public markOutOneFrameShortcut: string = 'alt+.';
    public markOutFiveFramesShortcut: string = 'alt+shift+.';
    public undoShortcut: string = 'ctrl+z';
    public redoShortcut: string = 'ctrl+y';
    public exportShortcut: string = 's';
    public changeModeVirtualShortcut: string = 'shift+v';
    public changeModeRenderedShortcut: string = 'shift+r';
    public changeModeTrimShortcut: string = 'shift+t';
}

/**
 * Adobe Premier Pro keyboard shortcut configuration
 */
export class AdobePremierProShortcutConfig extends KeyboardShortcutConfig {
}

/**
 * Avid keyboard shortcut configuration
 */
export class AvidShortcutConfig extends KeyboardShortcutConfig {
    public playPauseShortcut: string = 'space||`';
    public markInShortcut: string = 'f1||alt+q';
    public markOutShortcut: string = 'f2||alt+w';
    public goToInShortcut: string = 'alt+e';
    public goToOutShortcut: string = 'alt+r';
    public clearInShortcut: string = 'd';
    public clearOutShortcut: string = 'f';
    public clearBothShortcut: string = 'g';
    public playInToOutShortcut: string = '6';
    public playToOutShortcut: string = '5';
    public ffwdShortcut: string = 'ctrl+right';
    public rwdShortcut: string = 'ctrl+left';
    public backOneFrameShortcut: string = 'left';
    public backFiveFramesShortcut: string = 'alt+left||1';
    public backOneSecondShortcut: string = 'alt+shift+left';
    public backOneGopShortcut: string = 'ctrl+shift+left';
    public fwdOneFrameShortcut: string = 'right||4';
    public fwdFiveFramesShortcut: string = 'alt+right||2';
}
