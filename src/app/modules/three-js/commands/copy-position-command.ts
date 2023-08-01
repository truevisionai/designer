/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from '../../../core/commands/base-command';
import { IHasPosition } from '../objects/i-has-position';

export class CopyPositionCommand extends BaseCommand {

	private oldPosition: THREE.Vector3;

	constructor (
		private object: IHasPosition,
		private newPosition: THREE.Vector3,
		oldPosition: THREE.Vector3 = null
	) {

		super();

		this.newPosition = newPosition.clone();

		this.oldPosition = oldPosition?.clone() || object.getPosition().clone();

	}

	execute (): void {

		this.object.copyPosition( this.newPosition );

		this.object.updateMatrixWorld( true );

		// this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo (): void {

		this.object.copyPosition( this.oldPosition );

		this.object.updateMatrixWorld( true );

		// this.editor.signals.objectChanged.dispatch( this.object );

	}

	redo (): void {

		this.object.copyPosition( this.newPosition );

		this.object.updateMatrixWorld( true );

	}
}
