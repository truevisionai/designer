/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ICommand, ICommandCallback } from './command';


export abstract class BaseCommand implements ICommand {

	abstract execute (): void;

	abstract undo (): void;

	abstract redo (): void;

}
