/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/commands/command-history';
import { BaseShortcut } from './base-shortcut';

export class UndoShortcut extends BaseShortcut {

	check ( e: KeyboardEvent ): boolean {

		return this.metaKey( e ) && e.key === 'z';

	}

	execute (): void {

		CommandHistory.undo();

	}

}
