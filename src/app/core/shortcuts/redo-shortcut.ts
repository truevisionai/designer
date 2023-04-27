/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { BaseShortcut } from './base-shortcut';

export class RedoShortcut extends BaseShortcut {

	check ( e: KeyboardEvent ): boolean {

		const isMac = process.platform === 'darwin';

		if ( isMac ) {
			// Use Cmd key for macOS
			return e.metaKey && e.shiftKey && e.key === 'z'
				|| e.metaKey && e.key === 'y';
		} else {
			// Use Ctrl key for Windows/Ubuntu
			return e.ctrlKey && e.shiftKey && e.key === 'z'
				|| e.ctrlKey && e.key === 'y';
		}
	}


	execute (): void {

		CommandHistory.redo();

	}

}
