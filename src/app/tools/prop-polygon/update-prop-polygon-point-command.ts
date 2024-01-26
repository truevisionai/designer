/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { DynamicControlPoint } from '../../objects/dynamic-control-point';
import { PropPolygon } from '../../map/models/prop-polygons';
import { BaseCommand } from '../../commands/base-command';

export class UpdatePropPolygonPointCommand extends BaseCommand {

	constructor ( private point: DynamicControlPoint<PropPolygon>, private newPosition: Vector3, private oldPosition: Vector3 ) {
		super();
	}

	execute (): void {
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
