/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';

export class SetValueCommand<T, K extends keyof T> extends BaseCommand {

	private oldValue: T[ K ];

	constructor ( private object: T, private attributeName: K, private newValue: T[ K ] ) {

		super();

		// store the old value
		this.oldValue = object !== undefined ? object[ attributeName ] : undefined;
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
