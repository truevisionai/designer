import { TvLaneSection } from "../app/map/models/tv-lane-section";
import { Vector2, Vector3 } from "three";
import { RoadFactory } from "../app/factories/road-factory.service";
import { RoadService } from "../app/services/road/road.service";
import { IntersectionService } from "app/services/junction/intersection.service";
import { RoadNode } from "app/objects/road-node";
import { TvContactPoint, TvLaneType } from "app/map/models/tv-common";
import { RoadToolHelper } from "app/tools/road/road-tool-helper.service";
import { SplineControlPoint } from "app/objects/spline-control-point";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineUtils } from "../app/utils/spline.utils";
import { TvRoad } from "app/map/models/tv-road.model";
import { RoadUtils } from "app/utils/road.utils";
import { MapService } from "app/services/map/map.service";
import { TvRoadLink } from "app/map/models/tv-road-link";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Maths } from "app/utils/maths";

function formatMessage ( road: TvRoad, link: TvRoadLink ) {

	return 'Invalid Distance ' + road.toString() + ' ' + link.toString();

}

export function expectCorrectSegmentOrder ( spline: AbstractSpline ) {

	expect( SplineUtils.areLinksCorrect( spline ) ).toBe( true );

}

export function expectLinkDistanceToBeZero ( road: TvRoad ) {

	if ( road.successor ) {

		const distance = RoadUtils.distanceFromSuccessor( road, road.successor );

		if ( distance > 10 ) {
			// only for debugging
			// throw new Error( 'distance from successor is greater than 1' );
		}

		if ( road.isJunction ) {

			expect( distance ).toBeLessThan( 10, 'Successor ' + formatMessage( road, road.successor ) );

		} else {

			expect( distance ).toBeCloseTo( 0, Maths.Epsilon, 'Successor ' + formatMessage( road, road.successor ) );

		}

	}

	if ( road.predecessor ) {

		const distance = RoadUtils.distanceFromPredecessor( road, road.predecessor );

		if ( distance > 10 ) {
			// only for debugging
			// throw new Error( 'distance from predecessor is greater than 1' );
		}

		if ( road.isJunction ) {

			expect( distance ).toBeLessThan( 10, 'Predecessor ' + formatMessage( road, road.predecessor ) );

		} else {

			expect( distance ).toBeCloseTo( 0, Maths.Epsilon, 'Predecessor ' + formatMessage( road, road.predecessor ) );

		}

	}

}

export function expectToHaveJunctionConnections ( road: TvRoad ) {

	if ( road.successor?.element instanceof TvJunction ) {

		const hasConnection = road.successor.element.getIncomingRoads().includes( road );

		expect( hasConnection ).toBe( true, 'Successor' + formatMessage( road, road.successor ) );

	}

	if ( road.predecessor?.element instanceof TvJunction ) {

		const hasConnection = road.predecessor.element.getIncomingRoads().includes( road );

		expect( hasConnection ).toBe( true, 'Predecessor' + formatMessage( road, road.predecessor ) );

	}
}

export function expectValidLinks ( road: TvRoad ) {

	expectLinkDistanceToBeZero( road );

	expectToHaveJunctionConnections( road );

}

export function expectValidMap ( mapService: MapService ) {

	mapService.roads.forEach( road => {

		expectValidLinks( road );

	} );

	mapService.nonJunctionSplines.forEach( spline => {

		expectCorrectSegmentOrder( spline );

	} );

}

export class BaseTest {

	constructor () {
	}

	expectCorrectLaneOrder ( laneSection: TvLaneSection ) {

		// 3 2 1
		laneSection.getLeftLanes().forEach( ( lane, index, array ) => {
			expect( lane.id ).toBe( array.length - index );
		} );

		// -1, -2, -3
		laneSection.getRightLanes().forEach( ( lane, index ) => {
			expect( lane.id ).toBe( -1 - index );
		} );

	}

	makeRoad ( roadFactory: RoadFactory, points: Vector2[], leftLaneCount = 1, rightLaneCount = 1, leftWidth = 3.6, rightWidth = 3.6 ) {

		const road = roadFactory.createRoadWithLaneCount( leftLaneCount, rightLaneCount, leftWidth, rightWidth );

		points.forEach( point => road.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( point.x, point.y, 0 ) ) ) );

		return road;

	}

	makeDefaultRoad ( roadFactory: RoadFactory, points: Vector2[] ) {

		return roadFactory.createFromControlPoints( points );

	}

	createRoad ( roadService: RoadService, points: Vector2[], leftLaneCount = 1, rightLaneCount = 1, leftWidth = 3.6, rightWidth = 3.6 ) {

		const road = this.makeRoad( roadService.getRoadFactory(), points, leftLaneCount, rightLaneCount, leftWidth, rightWidth );

		roadService.add( road );

		return road;

	}

	createDefaultRoad ( roadService: RoadService, points: Vector2[] ) {

		const road = this.makeDefaultRoad( roadService.getRoadFactory(), points );

		roadService.add( road );

		return road;

	}

	createOneWayRoad ( roadService: RoadService, points: Vector2[] ) {

		const road = this.createRoad( roadService, points, 1, 2 );

		// --------------------------------
		// 1 - sidewalk on left
		// -------------------------------->
		// -1 - driving road
		// --------------------------------
		// -2 - sidewalk on right
		// --------------------------------

		road.laneSections[ 0 ].lanes.get( 1 ).type = TvLaneType.sidewalk;
		road.laneSections[ 0 ].lanes.get( -2 ).type = TvLaneType.sidewalk;
		road.laneSections[ 0 ].lanes.get( -1 ).type = TvLaneType.driving;

		roadService.add( road );

		return road;

	}

	createFourWayJunction (
		roadService: RoadService,
		intersectionService: IntersectionService,
		leftLaneCount = 1,
		rightLaneCount = 1,
		leftWidth = 3.6,
		rightWidth = 3.6
	) {

		// x-axis
		const horizontalRoad = this.makeRoad( roadService.getRoadFactory(), [ new Vector2( -100, 0 ), new Vector2( 100, 0 ) ],
			leftLaneCount,
			rightLaneCount,
			leftWidth,
			rightWidth
		);

		// y-axis
		const verticalRoad = this.makeRoad( roadService.getRoadFactory(), [ new Vector2( 0, -100 ), new Vector2( 0, 100 ) ],
			leftLaneCount,
			rightLaneCount,
			leftWidth,
			rightWidth
		);

		roadService.add( horizontalRoad );

		roadService.add( verticalRoad );

		intersectionService.checkSplineIntersections( verticalRoad.spline );

	}

	createTJunction (
		roadService: RoadService,
		intersectionService: IntersectionService,
		leftLaneCount = 1,
		rightLaneCount = 1,
		leftWidth = 3.6,
		rightWidth = 3.6
	) {

		/**
		 *
		 * T junction
		 *
		 * | |
		 * | |- - - -
		 * | |- - - -
		 * | |
		 *
		 */

		const horizontal = this.makeRoad( roadService.getRoadFactory(), [ new Vector2( 0, 0 ), new Vector2( 100, 0 ) ],
			leftLaneCount,
			rightLaneCount,
			leftWidth,
			rightWidth
		);

		const vertical = this.makeRoad( roadService.getRoadFactory(), [ new Vector2( 0, -100 ), new Vector2( 0, 100 ) ],
			leftLaneCount,
			rightLaneCount,
			leftWidth,
			rightWidth
		);

		roadService.add( horizontal );

		roadService.add( vertical );

		intersectionService.checkSplineIntersections( vertical.spline );

	}

	createConnectedRoads ( roadToolService: RoadToolHelper ) {

		/**

		 * -------------------------------
		 *  	1 	|	  3	 	| 		2
		 * -------------------------------

		 */

		const leftRoad = this.createDefaultRoad( roadToolService.roadService, [ new Vector2( 0, 0 ), new Vector2( 100, 0 ) ] );
		const rightRoad = this.createDefaultRoad( roadToolService.roadService, [ new Vector2( 200, 0 ), new Vector2( 300, 0 ) ] );

		const leftNode = new RoadNode( leftRoad, TvContactPoint.END );
		const rightNode = new RoadNode( rightRoad, TvContactPoint.START );

		const joiningRoad = roadToolService.createJoiningRoad( leftNode, rightNode );
		roadToolService.roadService.add( joiningRoad );

	}

}
