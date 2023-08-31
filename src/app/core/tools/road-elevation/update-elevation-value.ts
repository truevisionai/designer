/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';

export class UpdateElevationValue extends BaseCommand {

	private oldValue: number;

	constructor ( private node: RoadElevationNode, private newValue: number, oldValue?: number ) {

		super();

		this.oldValue = oldValue || node.elevation.a;

	}

	execute (): void {

		this.node.elevation.a = this.newValue;

		this.node.updateValuesAndPosition();

		RoadFactory.rebuildRoad( this.node.road );

	}

	undo (): void {

		this.node.elevation.a = this.oldValue;

		this.node.updateValuesAndPosition();

		RoadFactory.rebuildRoad( this.node.road );

	}

	redo (): void {

		this.execute();

	}
}
