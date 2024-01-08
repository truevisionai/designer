import { TvLaneSection } from "../app/modules/tv-map/models/tv-lane-section";
import { Vector2, Vector3 } from "three";
import { RoadFactory } from "../app/factories/road-factory.service";
import { RoadService } from "../app/services/road/road.service";
import { IntersectionService } from "app/services/junction/intersection.service";


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

		points.forEach( point => road.spline.addControlPointAt( new Vector3( point.x, point.y, 0 ) ) );

		return road;

	}

	makeDefaultRoad ( roadFactory: RoadFactory, points: Vector2[] ) {

		const road = roadFactory.createDefaultRoad();

		points.forEach( point => road.spline.addControlPointAt( new Vector3( point.x, point.y, 0 ) ) );

		return road;

	}

	createRoad ( roadService: RoadService, points: Vector2[], leftLaneCount = 1, rightLaneCount = 1, leftWidth = 3.6, rightWidth = 3.6 ) {

		const road = this.makeRoad( roadService.getRoadFactory(), points, leftLaneCount, rightLaneCount, leftWidth, rightWidth );

		roadService.addRoad( road );

		return road;

	}

	createDefaultRoad ( roadService: RoadService, points: Vector2[] ) {

		const road = this.makeDefaultRoad( roadService.getRoadFactory(), points );

		roadService.addRoad( road );

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

		roadService.addRoad( horizontalRoad );

		roadService.addRoad( verticalRoad );

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

		roadService.addRoad( horizontal );

		roadService.addRoad( vertical );

		intersectionService.checkSplineIntersections( vertical.spline );

	}
}
