/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppService } from '../services/app.service';
import { BaseShortcut } from './base-shortcut';

export class SaveShortcut extends BaseShortcut {

    check ( e: KeyboardEvent ): boolean {

        return e.ctrlKey && e.key == 's';

    }

    execute (): void {

        AppService.editor.save();

    }

}
