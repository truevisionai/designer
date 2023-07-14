/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "app/core/commands/base-command";
import { RoadFactory } from "app/core/factories/road-factory.service";
import { RoadElevationNode } from "app/modules/three-js/objects/road-elevation-node";
import { Vector3 } from "three";

export class UpdateElevationNodePosition extends BaseCommand {

	constructor ( private node: RoadElevationNode, private newPosition: Vector3, private oldPosition: Vector3 ) {

		super();

	}

	execute (): void {

		this.node.updateByPosition( this.newPosition );

		RoadFactory.rebuildRoad( this.node.road );

	}

	undo (): void {

		this.node.updateByPosition( this.oldPosition );

		RoadFactory.rebuildRoad( this.node.road );

	}

	redo (): void {

		this.execute();

	}
}
