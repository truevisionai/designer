/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Object3D } from 'three';
import { BaseCommand } from './base-command';

export class SetRotationCommand extends BaseCommand {

	private readonly oldRotation: Euler;

	constructor (
		private object: Object3D,
		private newRotation: Euler,
		private optionalOldRotation: Euler = null
	) {

		super();

		if ( object !== null && newRotation !== null ) {

			this.oldRotation = object.rotation.clone();
			this.newRotation = newRotation.clone();

		}

		if ( optionalOldRotation !== null ) {

			this.oldRotation = optionalOldRotation.clone();

		}

	}

	execute (): void {

		this.object.rotation.copy( this.newRotation );
		this.object.updateMatrixWorld( true );

	}

	undo (): void {

		this.object.rotation.copy( this.oldRotation );
		this.object.updateMatrixWorld( true );

	}

	redo (): void {

		this.execute();

	}

}
