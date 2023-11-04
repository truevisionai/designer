/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
import { TvSurface } from '../../modules/tv-map/models/tv-surface.model';
import { BaseCommand } from '../../commands/base-command';

export class UpdateSurfacePointCommand extends BaseCommand {

	private readonly oldPosition: Vector3;

	constructor ( private point: DynamicControlPoint<TvSurface>, private newPosition: Vector3, oldPosition?: Vector3 ) {

		super();

		this.oldPosition = oldPosition || this.point.position.clone();

	}

	execute () {

		this.point.copyPosition( this.newPosition );

		this.point.mainObject.update();

	}

	undo (): void {

		this.point.copyPosition( this.oldPosition );

		this.point.mainObject.update();
	}

	redo (): void {

		this.execute();

	}

}
