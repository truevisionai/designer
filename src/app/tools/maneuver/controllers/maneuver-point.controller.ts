/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseController } from "app/core/controllers/base-controller";
import { Log } from "app/core/utils/log";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineControlPoint } from "app/objects/road/spline-control-point";
import { SplineService } from "app/services/spline/spline.service";
import { ManeuverControlPointInspector } from "../maneuver.inspector";
import { RoadTangentPoint } from "app/objects/road/road-tangent-point";

function markAsDirty ( junction: TvJunction, connectingRoad: TvRoad ): void {

	const connection = junction.getConnections().find( c => c.connectingRoad === connectingRoad );

	if ( connection ) {

		connection.getLaneLinks().forEach( laneLink => {

			laneLink.dirty = true;

		} );

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverPointController extends BaseController<SplineControlPoint> {

	constructor (
		private splineService: SplineService
	) {
		super();
	}

	showInspector ( object: SplineControlPoint ): void {

		this.setInspector( new ManeuverControlPointInspector( object ) );

	}

	onAdded ( object: SplineControlPoint ): void {

		Log.info( 'Control point added' );

	}

	onUpdated ( point: SplineControlPoint ): void {

		this.splineService.update( point.spline );

		const road = point.spline.getRoadSegments()[ 0 ];

		markAsDirty( road.junction, road );

	}

	onRemoved ( object: SplineControlPoint ): void {

		Log.info( 'Control point removed' );

	}

}


@Injectable( {
	providedIn: 'root'
} )
export class ManeuverRoadTangentPointController extends BaseController<RoadTangentPoint> {

	constructor (
		private splineService: SplineService
	) {
		super();
	}

	onAdded ( point: RoadTangentPoint ): void {

		// tangent are not added

	}

	onUpdated ( point: RoadTangentPoint ): void {

		point.update();

		point.controlPoint.update();

		this.splineService.update( point.getSpline() );

		point.getSpline().getRoadSegments().forEach( road => {

			markAsDirty( road.junction, road );

		} );

	}

	onRemoved ( point: RoadTangentPoint ): void {

		// tangent are not removed

	}

	showInspector ( point: RoadTangentPoint ): void {

		// TODO: add inspector for tangent

	}

}
