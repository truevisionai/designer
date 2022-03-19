/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvBaseShortcut } from './tv-base-shortcut';

export class NewFileShortcut extends TvBaseShortcut {

    check ( e: KeyboardEvent ): boolean {
        // CMD + N
        return ( e.metaKey == true && e.keyCode == 78 );
    }

    execute (): void {

        // createNewFile();

    }

}
