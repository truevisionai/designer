/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';

export abstract class OdBaseCommand extends BaseCommand {

	abstract execute (): void;

	abstract undo (): void;

	abstract redo (): void;

}
