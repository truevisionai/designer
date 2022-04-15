/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SaveShortcut } from './save-file-shortcut';
import { NewFileShortcut } from './new-file-shortcut';
import { UndoShortcut } from './undo-shortcut';
import { RedoShortcut } from './redo-shortcut';
import { SaveAsShortcut } from './save-as-shortcut';

export class ShorcutFactory {

    static shortcuts: Array<any> = [
        NewFileShortcut,
        SaveAsShortcut,
        SaveShortcut,
        RedoShortcut,
        UndoShortcut,
    ];


}