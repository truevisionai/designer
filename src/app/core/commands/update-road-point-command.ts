/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/core/factories/road-factory.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { OdBaseCommand } from './od-base-command';
import { SnackBar } from 'app/services/snack-bar.service';

export class UpdateRoadPointCommand extends OdBaseCommand {

	constructor (
		private road: TvRoad,
		private point: RoadControlPoint,
		private newPosition: Vector3,
		private oldPosition: Vector3
	) {

		super();

		this.newPosition = this.newPosition.clone();

		this.oldPosition = this.oldPosition.clone();
	}

	execute (): void {

		// chanhe position of point
		this.point.copyPosition( this.newPosition );

		// update spline
		this.road.spline.update();

		// update geometry
		this.road.updateGeometryFromSpline();

		// build road
		RoadFactory.rebuildRoad( this.road );

		if ( this.road.successor && this.road.successor.elementType !== 'junction' ) {

			const successor = this.map.getRoadById( this.road.successor.elementId );

			if ( successor ) {

				successor.updateGeometryFromSpline();

				RoadFactory.rebuildRoad( successor );

			} else {

				SnackBar.warn( 'successor not found' );

			}

		}

		if ( this.road.predecessor && this.road.predecessor.elementType !== 'junction' ) {

			const predecessor = this.map.getRoadById( this.road.predecessor.elementId );

			if ( predecessor ) {

				predecessor.updateGeometryFromSpline();

				RoadFactory.rebuildRoad( predecessor );

			} else {

				SnackBar.warn( 'predecessor not found' );

			}



		}

	}

	undo (): void {

		// chanhe position of point
		this.point.copyPosition( this.oldPosition );

		// update spline
		this.road.spline.update();

		// update geometry
		this.road.updateGeometryFromSpline();

		// build road
		RoadFactory.rebuildRoad( this.road );

		if ( this.road.successor && this.road.successor.elementType !== 'junction' ) {

			const successor = this.map.getRoadById( this.road.successor.elementId );

			successor.updateGeometryFromSpline();

			RoadFactory.rebuildRoad( successor );

		}

		if ( this.road.predecessor && this.road.predecessor.elementType !== 'junction' ) {

			const predecessor = this.map.getRoadById( this.road.predecessor.elementId );

			predecessor.updateGeometryFromSpline();

			RoadFactory.rebuildRoad( predecessor );

		}

	}

	redo (): void {

		this.execute();

	}

}
