/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';

export class SetValueCommand extends BaseCommand {

	private oldValue: any;

	constructor ( private object: Object, private attributeName, private newValue: any ) {

		super();

		// store the old value
		this.oldValue = ( object !== undefined ) ? object[ attributeName ] : undefined;
	}

	execute (): void {

		this.object[ this.attributeName ] = this.newValue;

	}

	undo (): void {

		this.object[ this.attributeName ] = this.oldValue;

	}

	redo (): void {

		this.execute();

	}
}
