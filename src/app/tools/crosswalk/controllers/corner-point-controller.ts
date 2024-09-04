/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointController } from "app/core/controllers/point-controller";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { Log } from "app/core/utils/log";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { CrosswalkInspector } from "../crosswalk.inspector";
import { CornerControlPoint } from "../objects/corner-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class CornerControlPointController extends PointController<CornerControlPoint> {

	constructor (
		private roadObjectService: RoadObjectService,
		private roadGeometryService: RoadGeometryService
	) {
		super();
	}

	showInspector ( object: CornerControlPoint ): void {

		this.setInspector( new CrosswalkInspector( object.roadObject, object.roadObject.markings[ 0 ] ) );

	}

	onAdded ( point: CornerControlPoint ): void {

		this.roadObjectService.addCornerAndUpdateObject( point.roadObject, point.corner );

	}

	onUpdated ( point: CornerControlPoint ): void {

		const coord = this.roadGeometryService.findRoadPositionAt( point.road, point.position );

		if ( !coord ) {
			Log.error( 'CornerControlPointHandler', 'onUpdated', 'Could not find coordinate for position' );
			return;
		}

		point.corner.s = coord.s;

		point.corner.t = coord.t;

		this.roadObjectService.updateRoadObject( point.road, point.roadObject );

	}

	onRemoved ( point: CornerControlPoint ): void {

		this.roadObjectService.removeCornerAndUpdateObject( point.roadObject, point.corner );

	}

}

