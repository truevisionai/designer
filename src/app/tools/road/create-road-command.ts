/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/commands/select-point-command';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { OdBaseCommand } from '../../commands/od-base-command';
import { RoadTool } from './road-tool';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';

export class CreateRoadCommand extends OdBaseCommand {

	private selectPointCommand: SelectPointCommand;
	private point: RoadControlPoint;

	constructor ( tool: RoadTool, private road: TvRoad, position: Vector3 ) {

		super();

		this.point = RoadFactory.createRoadControlPoint( road, position );

		this.selectPointCommand = new SelectPointCommand( tool, this.point, RoadInspector, {
			road: this.point.road,
			controlPoint: this.point
		} );
	}

	execute (): void {

		// this.road.showNodes();

		// this.road.spline.showLines();

		this.map.roads.set( this.road.id, this.road );

		this.road.addControlPoint( this.point );

		this.selectPointCommand.execute();

		MapEvents.roadCreated.emit( new RoadCreatedEvent( this.road, true ) );
	}

	undo (): void {

		// this.road.hideNodes();

		// this.road.spline.hideLines();

		this.map.roads.delete( this.road.id );

		this.road.removeControlPoint( this.point );

		this.selectPointCommand.undo();

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( this.road, true ) );
	}

	redo (): void {

		this.execute();

	}

}
