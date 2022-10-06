/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NewFileShortcut } from './new-file-shortcut';
import { RedoShortcut } from './redo-shortcut';
import { SaveAsShortcut } from './save-as-shortcut';
import { SaveShortcut } from './save-file-shortcut';
import { UndoShortcut } from './undo-shortcut';

export class ShorcutFactory {

    static shortcuts: Array<any> = [
        NewFileShortcut,
        SaveAsShortcut,
        SaveShortcut,
        RedoShortcut,
        UndoShortcut,
    ];


}
