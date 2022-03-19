/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvBaseShortcut } from './tv-base-shortcut';

export class SaveAsShortcut extends TvBaseShortcut {

    check ( e: KeyboardEvent ): boolean {
        // CMD + shift + S
        return ( e.metaKey && e.shiftKey && e.keyCode == 83 );
    }

    execute (): void {

        // saveFileAs();

    }

}
