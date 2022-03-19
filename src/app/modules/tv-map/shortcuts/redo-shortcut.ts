/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvBaseShortcut } from './tv-base-shortcut';
import { CommandHistory } from '../../../services/command-history';

export class RedoShortcut extends TvBaseShortcut {

    check ( e: KeyboardEvent ): boolean {
        // CMD + shift + Z 
        return ( e.metaKey && e.shiftKey && e.keyCode == 90 );
    }

    execute (): void {
        CommandHistory.redo();
    }

}
