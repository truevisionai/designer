/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface ICommand {

	execute (): void;

	undo (): void;

	redo (): void;

}
