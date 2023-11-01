import { Injectable } from '@angular/core';
import { RoadFactory } from 'app/factories/road-factory.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseService } from '../base.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

@Injectable( {
	providedIn: 'root'
} )
export class RoadCutterService extends BaseService {

	splitRoadAt ( road: TvRoad, sStart: number ) {

		return this.splitRoadOld( road, sStart );

		// const clonedSpline = road.spline.clone();

		// const leftRoad = road.clone( sStart );
		// const rightRoad = road.clone( sStart );

		// leftRoad.spline = rightRoad.spline = clonedSpline;

		// rightRoad.id = RoadFactory.getNextRoadId();

		// // this if the segment of the road to cu
		// const segment = clonedSpline.getRoadSegments().find( i => i.roadId == road.id );
		// if ( !segment ) throw new Error( 'Road segment not found' );

		// // this is the start of the road in the spline
		// // this could be 0 if the road is the first road in the spline
		// const segmentStart = segment.start;

		// const leftRoadStart = segment.start;
		// const leftRoadLength = segment.length = sStart;

		// const rightRoadStart = segmentStart + sStart;
		// const rightRoadLength = road.length - sStart;

		// // set this spline on all segments
		// clonedSpline.getRoadSegments().forEach( segment => {
		// 	this.map.getRoadById( segment.roadId ).spline = clonedSpline;
		// } );

		// // add new segment to the original road
		// clonedSpline.addRoadSegment( leftRoadStart, leftRoadLength, leftRoad.id );
		// clonedSpline.addRoadSegment( rightRoadStart, rightRoadLength, rightRoad.id );

		// return [ leftRoad, rightRoad ];
	}

	splitRoad ( road: TvRoad, roadCoord: TvRoadCoord ) {

		return this.splitRoadOld( road, roadCoord.s );

	}

	cutRoadFromTo ( road: TvRoad, from: number, to: number ) {

		const clonedSpline = road.spline.clone();

		const fromRoad = road.clone( from );
		fromRoad.id = RoadFactory.getNextRoadId();

		const roadSegment = road.spline.getRoadSegments().find( i => i.roadId == road.id );
		if ( !roadSegment ) throw new Error( 'Road segment not found' );

		const roadSplineStart = roadSegment.start;

		// const newRoadStart = roadSplineStart + s;
		// const newRoadLength = road.length - s;

		// spline.addRoadSegment( newRoadStart, newRoadLength, fromRoad.id );

		// const currentRoadLength = s;

		// roadSegment.length = currentRoadLength;

		// return fromRoad;

	}

	private splitRoadOld ( road: TvRoad, s: number ) {

		const originalLength = road.length;

		const spline = road.spline.clone();

		const left = road.clone( s );

		const right = road.clone( s );
		right.id = RoadFactory.getNextRoadId();

		this.addNewRoadSegment( spline, left, right, originalLength, s );

		return [ left, right ];
	}

	private addNewRoadSegment ( spline: AbstractSpline, currentRoad: TvRoad, newRoad: TvRoad, originalLength: number, s: number ) {

		currentRoad.spline = newRoad.spline = spline;

		const currentSegment = spline.getRoadSegments().find( i => i.roadId == currentRoad.id );

		if ( !currentSegment ) throw new Error( 'Road segment not found' );

		const roadSplineStart = currentSegment.start;
		const newRoadStart = roadSplineStart + s;
		const newRoadLength = originalLength - s;

		// update this before adding new segment
		// to make sure correct geometries are constructed
		currentSegment.length = s;

		spline.addRoadSegment( newRoadStart, newRoadLength, newRoad.id );

	}

}
