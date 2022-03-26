/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EditorService } from "../services/editor.service";
import { ShortcutService } from "../services/shortcut.service";
import { ShorcutFactory } from "./shortcut-factory";
import { AbstractKeyboardShortcut } from "./shortcuts";


export abstract class BaseShortcut extends AbstractKeyboardShortcut {

    abstract check ( e: KeyboardEvent ): boolean;

    abstract execute (): void;

    constructor () {

        super();

    }

}


