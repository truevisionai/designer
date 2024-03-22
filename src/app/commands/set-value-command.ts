/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { MapEvents } from 'app/events/map-events';

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

		MapEvents.objectUpdated.emit( this.object );

	}

	undo (): void {

		this.object[ this.attributeName ] = this.oldValue;

		MapEvents.objectUpdated.emit( this.object );

	}

	redo (): void {

		this.execute();

	}
}
