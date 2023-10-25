/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/commands/select-point-command';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from '../../commands/od-base-command';
import { RoadTool } from './road-tool';
import { MapEvents } from 'app/events/map-events';

export class AddRoadPointCommand extends OdBaseCommand {

	private point: RoadControlPoint;
	private selectPointCommand: SelectPointCommand;

	constructor ( tool: RoadTool, private road: TvRoad, position: Vector3 ) {

		super();

		this.point = RoadFactory.createRoadControlPoint( road, position );

		this.selectPointCommand = new SelectPointCommand( tool, this.point, RoadInspector, {
			road: road,
			controlPoint: this.point
		} );
	}

	execute (): void {

		this.selectPointCommand.execute();

		this.road.addControlPoint( this.point );

		// this.rebuildRoad( this.road );

		MapEvents.roadControlPointCreated.emit( {
			road: this.road,
			controlPoint: this.point
		} )
	}

	undo (): void {

		this.selectPointCommand.undo();

		this.road.removeControlPoint( this.point );

		// this.rebuildRoad( this.road );

		MapEvents.roadControlPointRemoved.emit( {
			road: this.road,
			controlPoint: this.point
		} )

	}

	redo (): void {

		this.execute();

	}

	// rebuildRoad ( road: TvRoad ) {

	// 	this.map.gameObject.remove( road.gameObject );

	// 	TvMapBuilder.buildRoad( this.map.gameObject, road );

	// 	if ( !road.isJunction ) road.updateRoadNodes();

	// }
}
