/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ShorcutFactory } from '../shortcuts/shortcut-factory';
import { IKeyboardShortcut } from '../shortcuts/shortcuts';

@Injectable( {
	providedIn: 'root'
} )
export class ShortcutService {

	private static shortcutInstances: IKeyboardShortcut[] = [];

	constructor () {

		this.init();

	}

	static get shortcuts (): IKeyboardShortcut[] {

		return ShortcutService.shortcutInstances;
	}

	static register ( shortcut: IKeyboardShortcut ): any {

		this.shortcutInstances.push( shortcut );

	}

	static handleKeyDown ( e: KeyboardEvent ): void {

		// todo: use simple for loop for faster iteration
		this.shortcuts.forEach( ( shortcut ) => {

			if ( shortcut.check( e ) ) {

				shortcut.execute();

			}

		} );

	}

	init () {

		ShorcutFactory.shortcuts.forEach( ( shortcut ) => {

			ShortcutService.shortcutInstances.push( new shortcut() );

		} );

	}


}
