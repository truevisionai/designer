/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/commands/select-point-command';
import { Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { OdBaseCommand } from '../../commands/od-base-command';
import { RoadTool } from './road-tool';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";

export class CreateRoadCommand extends OdBaseCommand {

	private selectPointCommand: SelectPointCommand;
	private point: AbstractControlPoint;

	constructor ( tool: RoadTool, private road: TvRoad, position: Vector3 ) {

		super();

		this.point = ControlPointFactory.createControl( road.spline, position );

		// this.selectPointCommand = new SelectPointCommand( tool, this.point, RoadInspector, {
		// 	road: this.point.mainObject,
		// 	controlPoint: this.point
		// } );
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
