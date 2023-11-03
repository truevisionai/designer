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
import { RoadFactory } from 'app/factories/road-factory.service';

export class CreateRoadCommand extends OdBaseCommand {

	private point: AbstractControlPoint;
	private road: TvRoad;

	constructor ( position: Vector3 ) {

		super();

		this.road = RoadFactory.createDefaultRoad();

		this.point = ControlPointFactory.createControl( this.road.spline, position );

		this.road.spline.addControlPoint( this.point );

	}

	execute (): void {

		this.map.addSpline( this.road.spline );

		this.map.addRoad( this.road );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( this.road ) );

	}

	undo (): void {

		this.map.removeSpline( this.road.spline );

		this.map.removeRoad( this.road );

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( this.road ) );

	}

	redo (): void {

		this.execute();

	}

}
