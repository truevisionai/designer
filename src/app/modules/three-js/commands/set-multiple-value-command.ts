/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';

export class SetMultipleValuesCommand<T> extends BaseCommand {

	private oldValues: Partial<T> = {};

	constructor (
		private object: T,
		private attributes: Partial<T>
	) {
		super();

		// Store the old values
		for ( const attributeName in attributes ) {
			if ( attributes.hasOwnProperty( attributeName ) ) {
				this.oldValues[ attributeName ] = object[ attributeName ];
			}
		}
	}

	execute (): void {
		Object.assign( this.object, this.attributes );
	}

	undo (): void {
		Object.assign( this.object, this.oldValues );
	}

	redo (): void {
		this.execute();
	}
}
