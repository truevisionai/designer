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

}


