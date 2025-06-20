/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PointController } from 'app/core/controllers/point-controller';
import { PropPolygonInspector } from 'app/map/prop-polygon/prop-polygon.inspector';
import { PropPolygonService } from 'app/map/prop-polygon/prop-polygon.service';
import { PropPolygonPoint } from '../objects/prop-polygon-point';
import { SplineService } from 'app/services/spline/spline.service';

@Injectable()
export class PropPolygonPointController extends PointController<PropPolygonPoint> {

	constructor ( private service: PropPolygonService, private splineService: SplineService ) {

		super();

	}

	showInspector ( point: PropPolygonPoint ): void {

		this.setInspector( new PropPolygonInspector( point.polygon, point ) );

	}

	onAdded ( point: PropPolygonPoint ): void {

		const index = this.splineService.findIndex( point.polygon.spline, point.position );

		point.polygon.spline.insertControlPoint( index, point );

		this.splineService.updatePointHeading( point.polygon.spline, point, index );

		this.splineService.updateIndexes( point.polygon.spline );

		this.service.update( point.polygon );

	}

	onUpdated ( point: PropPolygonPoint ): void {

		this.service.update( point.polygon );

	}

	onRemoved ( point: PropPolygonPoint ): void {

		point.polygon.spline.removeControlPoint( point );

		this.service.update( point.polygon );

	}

}
