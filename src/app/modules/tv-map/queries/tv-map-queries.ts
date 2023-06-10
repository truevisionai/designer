/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvAbstractRoadGeometry } from '../models/geometries/tv-abstract-road-geometry';
import { TvLaneSide, TvLaneType } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvCoord, TvLaneCoord } from '../models/tv-lane-coord';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvMap } from '../models/tv-map.model';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';
import { TvUtils } from '../models/tv-utils';
import { TvMapInstance } from '../services/tv-map-source-file';

export abstract class TvBaseQueries {

	static get map () {
		return TvMapInstance.map;
	}

	static get roads () {
		return this.map.roads;
	}

}

export class TvMapQueries extends TvBaseQueries {

	static getRoadWidthAt ( roadId: number, s: number ) {

		let leftWidth = 0, rightWidth = 0;

		this.findRoadById( roadId )
			.getLaneSectionAt( s )
			.getLeftLanes()
			.forEach( lane => leftWidth += lane.getWidthValue( s ) );

		this.findRoadById( roadId )
			.getLaneSectionAt( s )
			.getRightLanes()
			.forEach( lane => rightWidth += lane.getWidthValue( s ) );

		return {
			totalWidth: leftWidth + rightWidth,
			leftSideWidth: leftWidth,
			rightSideWidth: rightWidth,
		};
	}

	static findRoadById ( id: number ): TvRoad {

		return this.map.roads.get( id );

	}

	static getSignalById ( id: number ) {

		let res = null;

		for ( const road of this.roads ) {

			for ( const signal of road[ 1 ].signals ) {

				if ( signal[ 1 ].id === id ) {

					res = signal;
					break;

				}

			}

			if ( res ) break;
		}

		return res;
	}

	static getRoadPosition ( roadId: number, s: number, t: number ): TvPosTheta {

		return this.findRoadById( roadId ).getPositionAt( s, t );

	}

	static getRoadByCoords ( x: number, y: number, posTheta?: TvPosTheta, ...roadIdsToIgnore ): TvRoad {

		// console.time( 'get-road' );

		const tmpPosTheta = new TvPosTheta();

		let nearestRoad: TvRoad = null;

		let nearestGeometry: TvAbstractRoadGeometry = null;

		let nearestPosition: Vector2 = null;

		let minDistance = Number.MAX_SAFE_INTEGER;

		const point = new Vector2( x, y );

		const roadCount = this.roads.size;

		let road: TvRoad;

		for ( const keyValue of this.roads ) {

			road = keyValue[ 1 ];

			if ( roadIdsToIgnore.includes( road.id ) ) continue;

			for ( const geometry of road.geometries ) {

				const nearestPoint = geometry.getNearestPointFrom( x, y, tmpPosTheta );

				const distance = point.distanceTo( nearestPoint );

				if ( distance < minDistance ) {

					minDistance = distance;
					nearestRoad = road;
					nearestGeometry = geometry;
					nearestPosition = nearestPoint;

					if ( posTheta ) posTheta.copy( tmpPosTheta );
				}
			}
		}

		// console.timeEnd( 'get-road' );

		return nearestRoad;

	}

	/**
	 * this will return a road only if the x,y fall on the road
	 * currently on approximation does not work correctly
	 * @param x
	 * @param y
	 * @param posTheta
	 * @param roadIdsToIgnore
	 */
	static getStrictRoadByCoords ( x: number, y: number, posTheta?: TvPosTheta, ...roadIdsToIgnore ): TvRoad {

		const tmpPosTheta = new TvPosTheta();

		let nearestRoad: TvRoad = null;

		let nearestGeometry: TvAbstractRoadGeometry = null;

		let nearestPosition: Vector2 = null;

		let minDistance = Number.MAX_SAFE_INTEGER;

		const point = new Vector2( x, y );

		let road: TvRoad;

		for ( const keyValue of this.roads ) {

			road = keyValue[ 1 ];

			let geometry: TvAbstractRoadGeometry;

			if ( roadIdsToIgnore.includes( road.id ) ) continue;

			for ( let j = 0; j < road.geometries.length; j++ ) {

				geometry = road.geometries[ j ];

				const nearestPoint = geometry.getNearestPointFrom( x, y, tmpPosTheta );

				const distance = point.distanceTo( nearestPoint );

				if ( distance < minDistance ) {

					minDistance = distance;
					nearestRoad = road;
					nearestGeometry = geometry;
					nearestPosition = nearestPoint;

					if ( posTheta ) {
						posTheta.copy( tmpPosTheta );
					}
				}
			}
		}

		if ( !nearestRoad || !tmpPosTheta ) return null;

		const distanceStart = point.distanceToSquared( nearestGeometry.getPositionAt( nearestGeometry.s ).toVector2() );
		const distanceEnd = point.distanceToSquared( nearestGeometry.getPositionAt( nearestGeometry.endS ).toVector2() );
		const distanceMin = point.distanceToSquared( nearestPosition );

		if ( distanceStart < distanceMin ) {
			nearestPosition = road.getPositionAt( nearestGeometry.s ).toVector2();
		} else if ( distanceEnd < distanceMin ) {
			nearestPosition = road.getPositionAt( nearestGeometry.endS ).toVector2();
		}

		if ( point.distanceTo( nearestPosition ) > 1 ) {

			return nearestRoad;

		} else {

			return null;

		}


		// const width = nearestRoad.getRoadWidthAt( tmpPosTheta.s );
		// const t = tmpPosTheta.t;
		//
		// if ( tmpPosTheta.s > 0 && t > 0 && Math.abs( t ) <= width.leftSideWidth ) {
		// 	return nearestRoad;
		// } else if ( tmpPosTheta.s > 0 && t < 0 && Math.abs( t ) <= width.rightSideWidth ) {
		// 	return nearestRoad;
		// } else {
		// 	return null;
		// }
	}

	static getLaneStartPosition ( roadId: number, laneId: number, sCoordinate: number, offset: number = 0, refPos?: TvPosTheta ): Vector3 {

		const road = this.roads.get( roadId );

		if ( road === undefined ) throw new Error( `Road with ID: ${ roadId } not found` );

		let posTheta = road.getRoadCoordAt( sCoordinate );

		const laneSection = road.getLaneSectionAt( sCoordinate );

		const lane = laneSection.getLaneById( laneId );

		const tDirection = laneId > 0 ? 1 : -1;

		const cumulativeWidth = laneSection.getWidthUptoStart( lane, sCoordinate );

		const cosTheta = Math.cos( posTheta.hdg + Maths.M_PI_2 ) * tDirection;
		const sinTheta = Math.sin( posTheta.hdg + Maths.M_PI_2 ) * tDirection;

		posTheta.x += cosTheta * ( cumulativeWidth + offset );
		posTheta.y += sinTheta * ( cumulativeWidth + offset );

		if ( refPos ) refPos.copy( posTheta );

		return posTheta.toVector3();

	}

	/**
	 *
	 * @param roadId
	 * @param laneId
	 * @param sCoordinate s coordinate on road
	 * @param offset
	 * @param refPos
	 * @returns
	 * @deprecated
	 */
	static getLanePosition ( roadId: number, laneId: number, sCoordinate: number, offset: number = 0, refPos?: TvPosTheta ): Vector3 {

		const road = this.roads.get( roadId );

		if ( road === undefined ) throw new Error( `Road with ID: ${ roadId } not found` );

		const posTheta = road.getRoadCoordAt( sCoordinate );

		const laneSection = road.getLaneSectionAt( sCoordinate );

		if ( !laneSection || laneSection == null ) {
			throw new Error( `LaneSection not found for road: ${ roadId } at ${ sCoordinate }` );
		}

		const lane = laneSection.getLaneById( laneId );

		if ( !lane || lane === undefined || lane == null ) {
			throw new Error( `Lane not found for road ${ roadId } at ${ sCoordinate } with id:${ laneId }` );
		}

		const tDirection = laneId > 0 ? 1 : -1;

		const cumulativeWidth = laneSection.getWidthUptoCenter( lane, sCoordinate );

		const cosTheta = Math.cos( posTheta.hdg + Maths.M_PI_2 ) * tDirection;
		const sinTheta = Math.sin( posTheta.hdg + Maths.M_PI_2 ) * tDirection;

		posTheta.x += cosTheta * ( cumulativeWidth + offset );
		posTheta.y += sinTheta * ( cumulativeWidth + offset );

		if ( refPos ) refPos.copy( posTheta );

		return posTheta.toVector3();

	}

	/**
	 *
	 * @param x
	 * @param y
	 * @param posTheta
	 * @param roadIdsToIgnore
	 * @deprecated
	 */
	static getLaneByCoords ( x: number, y: number, posTheta: TvPosTheta, ...roadIdsToIgnore ): { road: TvRoad, lane: TvLane } {

		let resultLane: TvLane = null;

		const resultRoad = TvMapQueries.getRoadByCoords( x, y, posTheta, roadIdsToIgnore );

		const s = posTheta.s;
		const t = posTheta.t;

		// find laneSection
		const laneSections = resultRoad.getLaneSections();

		for ( const laneSection of laneSections ) {

			// TODO: Fix this, checkInteral does not check properly
			if ( laneSection.checkInterval( s ) ) {

				// t is positive of left
				// left lanes are positive int
				// right lanes are negative int

				let lanes: TvLane[] = [];

				// positive t means left side
				if ( t > 0 ) {

					lanes = laneSection.getLeftLanes().reverse();

				} else if ( t < 0 ) {

					lanes = laneSection.getRightLanes();

				} else if ( Maths.approxEquals( t, 0 ) ) {

					lanes = laneSection.getCenterLanes();

				}

				let cumulativeWidth = 0;

				for ( const lane of lanes ) {

					const width = lane.getWidthValue( s );

					cumulativeWidth += width;

					if ( cumulativeWidth >= Math.abs( t ) ) {

						resultLane = lane;
						break;

					}

				}

				break;
			}

		}

		return {
			road: resultRoad,
			lane: resultLane
		};
	}

	static getMaxTrackPos () {
	}

	static getCurvature () {
	}

	static getLaneCurvature ( a, b, c, d ) {
	}

	static getDeltaLaneDir () {
	}

	static getLaneWidth ( lane: TvLane, s: number ) {
	}

	// static getLaneWidth2 ( lane: OdLane, s, a, b )

	static getLaneWidthAndRoadMark ( lane: TvLane, s: number ) {

	}

	static getLaneHeight () {
	}

	static getNextJunction ( trackCoord, bool, juncHeader, double, roadHeader ) {

	}

	static getObjects ( trackCoord, bool, double, resultInfostruct: [] ) {

	}

	static getPitch ( road: TvRoad, trackCoord, double ) {
	}

	static getPitchAndZ ( road: TvRoad, trackCoord, double ) {
	}

	static getPitchAndPitchDot ( road: TvRoad, trackCoord, double ) {
	}

	static getPitchDot ( road: TvRoad, trackCoord, double ) {
	}

	static getRoll ( road: TvRoad, trackCoord, double ) {
	}

	static getRoll2 ( trackCoord, double ) {
	}

	static getRollAndRollDot ( road: TvRoad, trackCoord, double ) {
	}

	static getRollDot ( road: TvRoad, trackCoord, double ) {
	}

	static getSignals ( trackCoord, bool, double, resultInfostruct: [] ) {
	}

	static getTrackAngles ( trackCoord, coord: TvCoord ) {
	}

	static getTrackAnglesDot ( trackCoord, coord: TvCoord ) {
	}

	static getTrackHeading ( trackCoord, double ) {
	}

	static getTrackWidth ( trackCoord ) {
	}

	static inTunnel ( laneCoord ) {
	}

	static onBridge ( laneCoord ) {
	}

	static lane2curvature ( laneCoord ) {
	}

	static lane2laneHeight ( laneCoord ) {
	}

	static lane2laneWidth ( laneCoord ) {
	}

	static lane2roadMark ( laneCoord ) {
	}

	static lane2track ( laneCoord ) {
	}

	static lane2validLane ( laneCoord ) {
	}

	static lane2validLane2 ( laneCoord, bool ) {
	}

	static s2elevation ( road, s ) {
	}

	static s2superelevation ( road, s ) {
	}

	static s2surface ( road, s, ushort ) {
	}

	static laneId2Node () {
	}

	static laneSpeedFromRoadType ( laneCoord, double ) {
	}


	static getRoadMark ( lane: TvLane, double ) {
	}

	static getRoadType ( laneCoord ) {
	}

	static getFootPoint () {
	}

	static getTolerance () {
	}

	static setRoadData ( a ) {
	}

	static getRoadData () {
	}

	static getLaneFromId ( laneSection: TvLaneSection, id ) {
	}

	static getLaneOnNextRoad ( laneCoord: TvLaneCoord, road: TvRoad ) {
	}

	static getLaneOnPreviousRoad ( laneCoord: TvLaneCoord, road: TvRoad ) {
	}

	static getLaneSpeed () {
	}

	static getRandomRoad ( map: TvMap ): TvRoad {

		return TvUtils.getRandomArrayItem( [ ...map.roads.values() ] ) as TvRoad;

	}

	static getRandomLaneSection ( road: TvRoad ): TvLaneSection {

		return TvUtils.getRandomArrayItem( road.getLaneSections() ) as TvLaneSection;

	}

	static getRandomLane ( laneSection: TvLaneSection, laneType: TvLaneType ): TvLane {

		const lanes = [ ...laneSection.lanes.values() ];

		const filteredLanes = lanes.filter( lane => {
			if ( lane.type === laneType && lane.side !== TvLaneSide.CENTER ) return true;
		} );

		return TvUtils.getRandomArrayItem( filteredLanes ) as TvLane;
	}

	static getRandomLocationOnRoads ( roads: TvRoad[], laneType: TvLaneType ) {

		const road = TvUtils.getRandomArrayItem( roads ) as TvRoad;

		const laneSection = this.getRandomLaneSection( road );

		const lane = this.getRandomLane( laneSection, laneType );

		// get random s on lane-section
		const s = Maths.randomNumberBetween( laneSection.s + 1, laneSection.endS - 1 );

		return new TvLaneCoord( road.id, laneSection.id, lane.id, s, 0 );
	}
}
