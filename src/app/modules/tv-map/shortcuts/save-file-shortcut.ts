/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvBaseShortcut } from './tv-base-shortcut';

export class SaveShortcut extends TvBaseShortcut {

    check ( e: KeyboardEvent ): boolean {
        // CMD + S
        return ( e.keyCode == 83 && e.metaKey == true );
    }

    execute (): void {
        // save 
    }

}
