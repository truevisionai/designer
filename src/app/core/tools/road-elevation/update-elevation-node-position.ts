/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { MapEvents } from 'app/events/map-events';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { Vector3 } from 'three';

export class UpdateElevationNodePosition extends BaseCommand {

	constructor ( private node: RoadElevationNode, private newPosition: Vector3, private oldPosition: Vector3 ) {

		super();

	}

	execute (): void {

		this.node.updateByPosition( this.newPosition );

		MapEvents.roadUpdated.emit( this.node.road );

	}

	undo (): void {

		this.node.updateByPosition( this.oldPosition );

		MapEvents.roadUpdated.emit( this.node.road );

	}

	redo (): void {

		this.execute();

	}
}
