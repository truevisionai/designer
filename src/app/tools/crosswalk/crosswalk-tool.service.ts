/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from "../base-tool.service";
import { RoadObjectService } from "../../map/road-object/road-object.service";
import { RoadObjectFactory } from 'app/services/road-object/road-object.factory';
import { TvRoad } from 'app/map/models/tv-road.model';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { Object3D, Vector3 } from 'three';
import { TvCornerRoad } from 'app/map/models/objects/tv-corner-road';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolService {

	private points = new Object3DArrayMap<TvRoad, Object3D[]>();

	constructor (
		public base: BaseToolService,
		public objectService: RoadObjectService,
		public factory: RoadObjectFactory,
		public controlPointFactory: ControlPointFactory
	) {
	}

	onDisabled () {

		this.points.clear();

	}

	hideRoad ( road: TvRoad ) {

		this.points.removeKey( road );

	}

	showRoad ( road: TvRoad ) {

		for ( const roadObject of road.objects.object ) {

			this.showRoadObject( road, roadObject );

		}

	}

	showRoadObject ( road: TvRoad, roadObject: TvRoadObject ) {

		for ( const outline of roadObject.outlines ) {

			for ( const corner of outline.cornerRoad ) {

				this.points.addItem( road, this.createControlPoint( corner ) );

			}

		}

	}

	updateControlPoints ( road: TvRoad ) {

		this.hideRoad( road );
		this.showRoad( road );

	}

	addRoadObject ( road: TvRoad, object: TvRoadObject ) {

		this.objectService.addRoadObject( road, object );

		this.showRoadObject( road, object );

	}

	updateRoadObject ( road: TvRoad, roadObject: TvRoadObject ) {

		this.objectService.updateRoadObject( road, roadObject );

		this.updateControlPoints( road );

	}

	addCornerRoad ( roadObject: TvRoadObject, point: SimpleControlPoint<TvCornerRoad> ) {

		this.objectService.addCornerRoad( roadObject, point.mainObject );

		this.showRoadObject( roadObject.road, roadObject );

	}

	removeCornerRoad ( roadObject: TvRoadObject, point: SimpleControlPoint<TvCornerRoad> ) {

		this.objectService.removeCornerRoad( roadObject, point.object );

		this.points.removeItem( roadObject.road, point );

	}

	removeRoadObject ( road: TvRoad, object: TvRoadObject ) {

		this.objectService.removeRoadObject( road, object );

		this.hideRoad( road );

	}

	updateCornerPointPosition ( roadObject: TvRoadObject, point: SimpleControlPoint<TvCornerRoad>, position: Vector3 ) {

		const coord = roadObject.road.getPosThetaByPosition( position );

		if ( !coord ) {
			return;
		}

		point.mainObject.s = coord.s;
		point.mainObject.t = coord.t;

		this.updateRoadObject( point.object.road, roadObject );

	}

	private createControlPoint ( corner: TvCornerRoad ) {

		return this.controlPointFactory.createSimpleControlPoint( corner, corner.getPosition() );

	}

}
