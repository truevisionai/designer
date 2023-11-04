/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { MapEvents } from 'app/events/map-events';
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

		MapEvents.roadUpdated.emit( this.node.road );

	}

	undo (): void {

		this.node.elevation.a = this.oldValue;

		this.node.updateValuesAndPosition();

		MapEvents.roadUpdated.emit( this.node.road );

	}

	redo (): void {

		this.execute();

	}
}
