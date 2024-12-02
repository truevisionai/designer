import { TvLaneSection } from "../app/map/models/tv-lane-section";
import { Vector2, Vector3 } from "three";
import { RoadFactory, RoadMakeOptions } from "../app/factories/road-factory.service";
import { RoadService } from "../app/services/road/road.service";
import { RoadNode } from "app/objects/road/road-node";
import { TvContactPoint, TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { RoadToolHelper } from "app/tools/road/road-tool-helper.service";
import { SplineControlPoint } from "app/objects/road/spline-control-point";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineUtils } from "../app/utils/spline.utils";
import { TvRoad } from "app/map/models/tv-road.model";
import { RoadUtils } from "app/utils/road.utils";
import { MapService } from "app/services/map/map.service";
import { TvLink } from "app/map/models/tv-link";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Maths } from "app/utils/maths";

function formatMessage ( road: TvRoad, link: TvLink, distance?: number ) {

	return road.toString() + ' Invalid Distance with ' + link.toString() + ' distance:' + distance;

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

export function expectLinkedConnections ( road: TvRoad ) {

	if ( road.successor?.element instanceof TvJunction ) {

		const hasConnection = road.successor.element.getIncomingRoads().includes( road );

		expect( hasConnection ).toBe( true, `${ road.toString() } successor link with junction has no connections` );

	}

	if ( road.predecessor?.element instanceof TvJunction ) {

		const hasConnection = road.predecessor.element.getIncomingRoads().includes( road );

		expect( hasConnection ).toBe( true, `${ road.toString() } predecessor link with junction has no connections` );

	}
}

export function expectValidLinks ( road: TvRoad ) {

	expectLinkDistanceToBeZero( road );

	expectLinkedConnections( road );

}

export function expectValidMap ( mapService: MapService ) {

	mapService.roads.forEach( road => {

		expectValidLinks( road );

	} );

	mapService.nonJunctionSplines.forEach( spline => {

		expectCorrectSegmentOrder( spline );

	} );

}

export function exportCorrectLaneOrder ( laneSection: TvLaneSection ) {
	// 3 2 1
	laneSection.getLeftLanes().forEach( ( lane, index, array ) => {
		expect( lane.id ).toBe( array.length - index );
	} );

	// -1, -2, -3
	laneSection.getRightLanes().forEach( ( lane, index ) => {
		expect( lane.id ).toBe( -1 - index );
	} );
}


export function createDefaultRoad ( options?: RoadMakeOptions ): TvRoad {

	const road = RoadFactory.createDefaultRoad( options?.id || -1 );

	const position = options?.position ?? new Vector3( 0, 0, 0 );
	const hdg = options?.hdg ?? 0;
	const length = options?.length ?? 10;

	road.getPlanView().addGeometryLine( 0, position.x, position.y, hdg, length );

	return road;

}

export function createOneWayRoad ( options?: RoadMakeOptions ): TvRoad {

	const road = RoadFactory.makeRoad( { id: options?.id, leftLaneCount: 0, rightLaneCount: 0 } );

	const laneSection = road.getLaneProfile().getFirstLaneSection();

	laneSection.createCenterLane( 0, TvLaneType.none, false, true );
	laneSection.createRightLane( -1, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, 2.0, 0, 0, 0 );
	laneSection.createRightLane( -2, TvLaneType.shoulder, false, true ).addWidthRecord( 0, 0.5, 0, 0, 0 );
	laneSection.createRightLane( -3, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.6, 0, 0, 0 );
	laneSection.createRightLane( -4, TvLaneType.shoulder, false, true ).addWidthRecord( 0, 0.5, 0, 0, 0 );
	laneSection.createRightLane( -5, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, 2.0, 0, 0, 0 );

	return road;

}

export function createFreewayOneWayRoad ( options: RoadMakeOptions ): TvRoad {

	const road = RoadFactory.makeRoad( options );

	const laneSection = road.getLaneProfile().getFirstLaneSection();

	laneSection.createCenterLane( 0, TvLaneType.none, false, true );
	laneSection.createRightLane( -1, TvLaneType.shoulder, false, true ).addDefaultWidth();
	laneSection.createRightLane( -2, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -3, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -4, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -5, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -6, TvLaneType.shoulder, false, true ).addDefaultWidth();

	return road;

}

export function createFreewayRoad ( options: RoadMakeOptions ): TvRoad {

	const road = RoadFactory.makeRoad( options );

	const laneSection = road.getLaneProfile().getFirstLaneSection();

	laneSection.createLeftLane( 6, TvLaneType.shoulder, false, true ).addDefaultWidth();
	laneSection.createLeftLane( 5, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createLeftLane( 4, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createLeftLane( 3, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createLeftLane( 2, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createLeftLane( 1, TvLaneType.shoulder, false, true ).addDefaultWidth();
	laneSection.createCenterLane( 0, TvLaneType.none, false, true );
	laneSection.createRightLane( -1, TvLaneType.shoulder, false, true ).addDefaultWidth();
	laneSection.createRightLane( -2, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -3, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -4, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -5, TvLaneType.driving, false, true ).addDefaultWidth();
	laneSection.createRightLane( -6, TvLaneType.shoulder, false, true ).addDefaultWidth();

	return road;

}

