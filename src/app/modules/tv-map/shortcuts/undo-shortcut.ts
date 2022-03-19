/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvBaseShortcut } from './tv-base-shortcut';
import { CommandHistory } from '../../../services/command-history';

export class UndoShortcut extends TvBaseShortcut {

    check ( e: KeyboardEvent ): boolean {
        // CMD + Z
        return ( e.metaKey == true && e.keyCode == 90 );
    }

    execute (): void {
        CommandHistory.undo();
    }

}
