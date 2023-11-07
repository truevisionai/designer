// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

import { OdBaseCommand } from "app/commands/od-base-command";
import { MapEvents, RoadControlPointCreatedEvent, RoadControlPointRemovedEvent } from "app/events/map-events";
import { AbstractControlPoint } from "app/modules/three-js/objects/abstract-control-point";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

// import { Vector3 } from 'three';
// import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
// import { OdBaseCommand } from '../../commands/od-base-command';
// import { MapEvents, RoadControlPointCreatedEvent, RoadControlPointRemovedEvent, RoadSelectedEvent, RoadUnselectedEvent } from 'app/events/map-events';
// import { ControlPointFactory } from 'app/factories/control-point.factory';

// import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";

// export class AddRoadPointCommand extends OdBaseCommand {

// 	private point: AbstractControlPoint;

// 	constructor ( private road: TvRoad, position: Vector3 ) {

// 		super();

// 		this.point = ControlPointFactory.createControl( road.spline, position );

// 	}

// 	execute (): void {

// 		this.road.addControlPoint( this.point );

// 		MapEvents.roadControlPointCreated.emit( new RoadControlPointCreatedEvent(
// 			this.road,
// 			this.point
// 		) );
// 	}

// 	undo (): void {

// 		this.road.removeControlPoint( this.point );

// 		MapEvents.roadControlPointRemoved.emit( new RoadControlPointRemovedEvent(
// 			this.road,
// 			this.point
// 		) )

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }

export class AddRoadPointCommand extends OdBaseCommand {

	constructor ( private road: TvRoad, private point: AbstractControlPoint ) {

		super();

	}

	execute (): void {

		this.road.addControlPoint( this.point );

		MapEvents.roadControlPointCreated.emit( new RoadControlPointCreatedEvent(
			this.road,
			this.point
		) );

	}

	undo (): void {

		this.road.removeControlPoint( this.point );

		MapEvents.roadControlPointRemoved.emit( new RoadControlPointRemovedEvent(
			this.road,
			this.point
		) )

	}

	redo (): void {

		this.execute();

	}

}
