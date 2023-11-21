/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ICommand, ICommandCallback } from './i-command';


export abstract class BaseCommand implements ICommand {

	callbacks?: ICommandCallback;

	abstract execute (): void;

	abstract undo (): void;

	abstract redo (): void;

}
