/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractKeyboardShortcut } from 'app/core/interfaces/shortcuts';

export abstract class TvBaseShortcut extends AbstractKeyboardShortcut {

    abstract check ( e: KeyboardEvent ): boolean;

    abstract execute (): void;

    constructor () {

        super();

    }

}


