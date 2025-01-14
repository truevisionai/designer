/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2, Vector3 } from 'app/core/maths';
import { TvConsole } from '../../core/utils/console';
import { Maths } from '../../utils/maths';
import { TvAbstractRoadGeometry } from '../models/geometries/tv-abstract-road-geometry';
import { TvLaneSide, TvLaneType } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneCoord } from '../models/tv-lane-coord';
import { TvCoord } from '../models/TvCoord';
import { TvRoadCoord } from '../models/TvRoadCoord';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvMap } from '../models/tv-map.model';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';
import { TvUtils } from '../models/tv-utils';
import { TvMapInstance } from '../services/tv-map-instance';

export abstract class TvBaseQueries {

	static get map () {
		return TvMapInstance.map;
	}

}

export class TvMapQueries extends TvBaseQueries {

	static findRoadById ( id: number ): TvRoad {
		return this.map.getRoad( id );
	}

	static findRoadCoord ( position: Vector3 ): TvRoadCoord {

		const posTheta = new TvPosTheta();

		const road = this.getRoadByCoords( position.x, position.y, posTheta );

		if ( !road ) return null;

		return posTheta.toRoadCoord( road );
	}

	static findNonJunctionRoadCoord ( position: Vector3 ): TvRoadCoord {

		const posTheta = new TvPosTheta();

		const road = this.getNonJunctionRoadByCoords( position.x, position.y, posTheta );

		if ( !road ) return null;

		return posTheta.toRoadCoord( road );
	}

	/**
	 * use RoadService.findNearestRoad
	 *
	 * @param x
	 * @param y
	 * @param posTheta
	 * @param roadIdsToIgnore
	 * @returns
	 * @deprecated use RoadService.findNearestRoad
	 */
	static getRoadByCoords ( x: number, y: number, posTheta?: TvPosTheta, ...roadIdsToIgnore: any[] ): TvRoad {

		// console.time( 'get-road' );

		const tmpPosTheta = new TvPosTheta();

		let nearestRoad: TvRoad = null;

		let nearestGeometry: TvAbstractRoadGeometry = null;

		let nearestPosition: Vector2 = null;

		let minDistance = Number.MAX_SAFE_INTEGER;

		const point = new Vector2( x, y );

		for ( const road of this.map.getRoads() ) {

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
	 * use RoadService.findNearestRoad
	 *
	 * @param x
	 * @param y
	 * @param posTheta
	 * @param roadIdsToIgnore
	 * @returns
	 * @deprecated use RoadService.findNearestRoad
	 */
	static getNonJunctionRoadByCoords ( x: number, y: number, posTheta?: TvPosTheta, ...roadIdsToIgnore: any[] ): TvRoad {

		// console.time( 'get-road' );

		const tmpPosTheta = new TvPosTheta();

		let nearestRoad: TvRoad = null;

		let nearestGeometry: TvAbstractRoadGeometry = null;

		let nearestPosition: Vector2 = null;

		let minDistance = Number.MAX_SAFE_INTEGER;

		const point = new Vector2( x, y );

		for ( const road of this.map.getRoads() ) {

			if ( road.isJunction ) continue;

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

	static getLanePosition ( roadId: number, laneId: number, sCoordinate: number, offset: number = 0, refPos?: TvPosTheta ): Vector3 {

		return this.getLaneCenterPosition( roadId, laneId, sCoordinate, offset, refPos );

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
	static getLaneCenterPosition ( roadId: number, laneId: number, sCoordinate: number, offset: number = 0, refPos?: TvPosTheta ): Vector3 {

		if ( sCoordinate < 0 ) {
			TvConsole.warn( 'S coordinate cannot be less than 0. Setting it to 0' );
			sCoordinate = 0;
		}

		const road = this.map.getRoad( roadId );

		if ( road === undefined ) {
			console.error( `Road with ID: ${ roadId } not found` );
			return new Vector3();
		}

		const posTheta = road.getRoadPosition( sCoordinate );

		const laneSection = road.getLaneProfile().getLaneSectionAt( sCoordinate );

		if ( !laneSection ) {
			console.error( `LaneSection not found for road: ${ roadId } at ${ sCoordinate }` );
			return new Vector3();
		}

		const lane = laneSection.getLaneById( laneId );

		if ( !lane ) {
			console.error( `Lane not found for road ${ roadId } at ${ sCoordinate } with id:${ laneId }` );
			return new Vector3();
		}

		const tDirection = laneId > 0 ? 1 : -1;

		const cumulativeWidth = laneSection.getWidthUptoCenter( lane, sCoordinate );

		const cosTheta = Math.cos( posTheta.hdg + Maths.PI2 ) * tDirection;
		const sinTheta = Math.sin( posTheta.hdg + Maths.PI2 ) * tDirection;

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
	static getLaneByCoords ( x: number, y: number, posTheta: TvPosTheta, ...roadIdsToIgnore: any[] ): {
		road: TvRoad,
		lane: TvLane
	} {

		let resultLane: TvLane = null;

		const resultRoad = TvMapQueries.getRoadByCoords( x, y, posTheta, roadIdsToIgnore );

		const s = posTheta.s;
		const t = posTheta.t;

		// find laneSection
		const laneSections = resultRoad.getLaneProfile().getLaneSections();

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

	static getMaxTrackPos (): void {
	}

	static getCurvature (): void {
	}

	static getLaneCurvature ( a: any, b: any, c: any, d: any ): void {
	}

	static getDeltaLaneDir (): void {
	}

	static getLaneWidth ( lane: TvLane, s: number ): void {
	}

	// static getLaneWidth2 ( lane: OdLane, s, a, b )

	static getLaneWidthAndRoadMark ( lane: TvLane, s: number ): void {

	}

	static getLaneHeight (): void {
	}

	static getNextJunction ( trackCoord: any, bool: any, juncHeader: any, double: any, roadHeader: any ): void {

	}

	static getObjects ( trackCoord: any, bool: any, double: any, resultInfostruct: [] ): void {

	}

	static getPitch ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getPitchAndZ ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getPitchAndPitchDot ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getPitchDot ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getRoll ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getRoll2 ( trackCoord: any, double: any ): void {
	}

	static getRollAndRollDot ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getRollDot ( road: TvRoad, trackCoord: any, double: any ): void {
	}

	static getSignals ( trackCoord: any, bool: any, double: any, resultInfostruct: [] ): void {
	}

	static getTrackAngles ( trackCoord: any, coord: TvCoord ): void {
	}

	static getTrackAnglesDot ( trackCoord: any, coord: TvCoord ): void {
	}

	static getTrackHeading ( trackCoord: any, double: any ): void {
	}

	static getTrackWidth ( trackCoord: any ): void {
	}

	static inTunnel ( laneCoord: any ): void {
	}

	static onBridge ( laneCoord: any ): void {
	}

	static lane2curvature ( laneCoord: any ): void {
	}

	static lane2laneHeight ( laneCoord: any ): void {
	}

	static lane2laneWidth ( laneCoord: any ): void {
	}

	static lane2roadMark ( laneCoord: any ): void {
	}

	static lane2track ( laneCoord: any ): void {
	}

	static lane2validLane ( laneCoord: any ): void {
	}

	static lane2validLane2 ( laneCoord: any, bool: any ): void {
	}

	static s2elevation ( road: any, s: any ): void {
	}

	static s2superelevation ( road: any, s: any ): void {
	}

	static s2surface ( road: any, s: any, ushort: any ): void {
	}

	static laneId2Node (): void {
	}

	static laneSpeedFromRoadType ( laneCoord: any, double: any ): void {
	}

	static getRoadMark ( lane: TvLane, double: any ): void {
	}

	static getRoadType ( laneCoord: any ): void {
	}

	static getFootPoint (): void {
	}

	static getTolerance (): void {
	}

	static setRoadData ( a: any ): void {
	}

	static getRoadData (): void {
	}

	static getLaneFromId ( laneSection: TvLaneSection, id: any ): void {
	}

	static getLaneOnNextRoad ( laneCoord: TvLaneCoord, road: TvRoad ): void {
	}

	static getLaneOnPreviousRoad ( laneCoord: TvLaneCoord, road: TvRoad ): void {
	}

	static getLaneSpeed (): void {
	}

}
