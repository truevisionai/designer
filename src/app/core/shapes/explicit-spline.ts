/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline, SplineType } from './abstract-spline';
import { RoadControlPoint } from 'app/objects/road/road-control-point';

export class ExplicitSpline extends AbstractSpline {

	public type: SplineType = SplineType.EXPLICIT;

	constructor ( road?: TvRoad ) {

		super();

		if ( road ) this.addSegment( 0, road );

	}

	init (): void { }

	update (): void { }

	updateHeadings (): void {

		const controlPoints = this.getControlPoints() as RoadControlPoint[];

		for ( let i = 0; i < controlPoints.length - 1; i++ ) {

			const current = controlPoints[ i ];
			const next = controlPoints[ i + 1 ];

			// skip if heading is already set
			if ( current.hdg != 0 ) continue;

			const heading = Math.atan2( next.position.y - current.position.y, next.position.x - current.position.x );

			current.hdg = heading;

		}

		// last point

		const last = controlPoints[ controlPoints.length - 1 ];

		if ( last.hdg != 0 ) return;

		const secondLast = controlPoints[ controlPoints.length - 2 ];

		const heading = Math.atan2( last.position.y - secondLast.position.y, last.position.x - secondLast.position.x );

		last.hdg = heading;

	}

}
