/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface IKeyboardShortcut {

	check ( e: KeyboardEvent ): boolean;

	execute (): void;
}

export abstract class AbstractKeyboardShortcut implements IKeyboardShortcut {

	abstract check ( e: KeyboardEvent ): boolean;

	abstract execute (): void;

}
