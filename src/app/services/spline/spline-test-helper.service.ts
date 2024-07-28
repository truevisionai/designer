import { Injectable } from '@angular/core';
import { Vector3 } from "three";
import { SplineType } from "../../core/shapes/abstract-spline";
import { SplineService } from "./spline.service";
import { SplineFactory } from "./spline.factory";
import { RoadFactory } from "../../factories/road-factory.service";


@Injectable( {
	providedIn: 'root'
} )
export class SplineTestHelper {

	constructor (
		public splineService: SplineService,
		public roadFactory: RoadFactory
	) {
	}

	addStraightRoadSpline ( start: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		this.splineService.add( SplineFactory.createStraight( start, length, degrees, type ) );

	}

	addStraightRoadsFacingEachOther ( start: Vector3 ) {

		const splineA = SplineFactory.createStraight( start, 50 );
		const splineB = SplineFactory.createStraight( new Vector3( start.x + 150, start.y, start.z ), 50, 180 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );

		return { splineA, splineB };
	}

	addDefaultJunction () {

		this.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );
		this.addStraightRoadSpline( new Vector3( 0, -50, 0 ), 100, 90 );

	}

	addSixRoadJunction () {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 200, 90 );
		const splineC = SplineFactory.createStraight( new Vector3( -100, -100, 0 ), 200, 45 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );
		this.splineService.add( splineC );
	}

}
