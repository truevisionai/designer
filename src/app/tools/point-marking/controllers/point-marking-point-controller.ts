/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointMarkingControlPoint } from "../objects/point-marking-object";
import { BaseController } from "app/core/controllers/base-controller";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { PointMarkingInspector } from "../point-marking.inspector";
import { RoadGeometryService } from "app/services/road/road-geometry.service";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingController extends BaseController<PointMarkingControlPoint> {

	constructor (
		private roadObjectService: RoadObjectService,
		private roadGeometryService: RoadGeometryService
	) {
		super();
	}

	onAdded ( object: PointMarkingControlPoint ): void {

		this.roadObjectService.addRoadObject( object.road, object.roadObject );

	}

	onUpdated ( point: PointMarkingControlPoint ): void {

		const coord = this.roadGeometryService.findRoadPositionAt( point.road, point.position );

		if ( !coord ) {
			return;
		}

		point.roadObject.s = coord.s;

		point.roadObject.t = coord.t;

		this.roadObjectService.updateRoadObject( point.road, point.roadObject );

	}

	onRemoved ( object: PointMarkingControlPoint ): void {

		this.roadObjectService.removeRoadObject( object.road, object.roadObject );

	}

	showInspector ( object: PointMarkingControlPoint ): void {

		this.setInspector( new PointMarkingInspector( object ) );

	}

}
