/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractKeyboardShortcut } from './shortcuts';


export abstract class BaseShortcut extends AbstractKeyboardShortcut {

	constructor () {

		super();

	}

	abstract check ( e: KeyboardEvent ): boolean;

	abstract execute (): void;

	metaKey ( e: KeyboardEvent ): boolean {

		return process.platform === 'darwin' ?
			e.metaKey :  	// Use Cmd key for macOS
			e.ctrlKey; 		// Use Ctrl key for Windows/Ubuntu

	}

}


