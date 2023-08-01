/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { BaseControlPoint } from '../objects/control-point';
import { Object3D } from 'three';
import { IHasUpdate } from './set-value-command';


export class RemoveArrayPointCommand<T extends IHasUpdate, K extends BaseControlPoint> extends BaseCommand {

	private index: number;

	private parent: Object3D;

	constructor ( private object: T, private array: K[], private point: K ) {

		super();

		this.index = this.array.indexOf( this.point );

		this.parent = point?.parent;

	}

	execute (): void {

		if ( this.index > -1 ) {

			this.array.splice( this.index, 1 );

			this.parent?.remove( this.point );

			this.object.update();

		}

	}

	undo (): void {

		if ( this.index > -1 ) {

			this.array.splice( this.index, 0, this.point );

			this.parent?.add( this.point );

			this.object.update();

		}

	}

	redo (): void {

		this.execute();

	}

}
