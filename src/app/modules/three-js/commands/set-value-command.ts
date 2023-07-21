/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';

export interface IHasUpdate {
	update (): void;
}

export class SetValueCommand<T, K extends keyof T> extends BaseCommand {

	private oldValue: T[ K ];

	constructor ( private object: T, private attributeName: K, private newValue: T[ K ], oldValue?: T[ K ] ) {

		super();

		// store the old value
		this.oldValue = ( oldValue !== undefined ) ? oldValue : object[ attributeName ];
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


export class UpdateValueCommand<T extends IHasUpdate, K extends keyof T> extends BaseCommand {

	private oldValue: T[ K ];

	constructor ( private object: T, private attributeName: K, private newValue: T[ K ], oldValue?: T[ K ] ) {

		super();

		// store the old value
		this.oldValue = ( oldValue !== undefined ) ? oldValue : object[ attributeName ];
	}

	execute (): void {

		this.object[ this.attributeName ] = this.newValue;

		this.object?.update();

	}

	undo (): void {

		this.object[ this.attributeName ] = this.oldValue;

		this.object?.update();
	}

	redo (): void {

		this.execute();

	}
}
