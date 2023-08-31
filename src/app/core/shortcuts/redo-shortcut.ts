/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { BaseShortcut } from './base-shortcut';

export class RedoShortcut extends BaseShortcut {

	check ( e: KeyboardEvent ): boolean {

		return this.metaKey( e ) && e.shiftKey && e.key == 'z'
			|| this.metaKey( e ) && e.key == 'y';

	}


	execute (): void {

		CommandHistory.redo();

	}

}
