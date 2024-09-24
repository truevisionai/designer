/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from "../../map/models/tv-road.model";
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { Vector3 } from 'three';
import { Maths } from 'app/utils/maths';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { InvalidArgumentException, NoGeometriesFound } from 'app/exceptions/exceptions';
import { TvRoadLink } from "../../map/models/tv-road-link";
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { RoadWidthService } from './road-width.service';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';

@Injectable( {
	providedIn: 'root'
} )
export class RoadGeometryService {

	private static _instance: RoadGeometryService;

	static get instance (): RoadGeometryService {

		if ( !RoadGeometryService._instance ) {
			RoadGeometryService._instance = new RoadGeometryService();
		}

		return RoadGeometryService._instance;
	}

	constructor () {
	}

	findContactPosition ( road: TvRoad, contact: TvContactPoint ): TvPosTheta {

		if ( contact === TvContactPoint.START ) {

			return this.findStartPosition( road );

		} else if ( contact === TvContactPoint.END ) {

			return this.findEndPosition( road );

		} else {

			throw new InvalidArgumentException( 'Invalid contact point' );

		}

	}

	findNearestContactPoint ( road: TvRoad, position: Vector3 ): TvContactPoint {

		const distanceFromStart = this.findStartPosition( road ).distanceTo( position );
		const distanceFromEnd = this.findEndPosition( road ).distanceTo( position );

		if ( distanceFromStart < distanceFromEnd ) {

			return TvContactPoint.START;

		} else {

			return TvContactPoint.END

		}

	}

	findEndPosition ( road: TvRoad ): TvPosTheta {

		return this.findRoadPosition( road, road.length );

	}

	findStartPosition ( road: TvRoad ): TvPosTheta {

		return this.findRoadPosition( road, 0 );

	}

	findRoadCoord ( road: TvRoad, s: number, t: number = 0 ): TvRoadCoord {

		return this.findRoadPosition( road, s, t ).toRoadCoord( road );

	}

	findRoadPositionAt ( road: TvRoad, position: Vector3 ): TvPosTheta {

		return road.getPosThetaByPosition( position );

	}

	findRoadCoordAt ( road: TvRoad, position: Vector3 ): TvRoadCoord {

		return this.findRoadPositionAt( road, position ).toRoadCoord( road );

	}

	findLaneCoordAt ( road: TvRoad, position: Vector3 ): TvLaneCoord | undefined {

		const coord = this.findRoadCoordAt( road, position );

		if ( !coord ) return;

		const laneSection = coord.road.getLaneProfile().getLaneSectionAt( coord.s );

		const t = coord.t;

		const shouldSearchLeft = t > 0;

		const lanes = shouldSearchLeft ? laneSection.getLeftLanes() : laneSection.getRightLanes();

		for ( const lane of lanes ) {

			const startT = laneSection.getWidthUptoStart( lane, coord.s );

			const endT = laneSection.getWidthUptoEnd( lane, coord.s );

			if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {

				const laneSOffset = coord.s - laneSection.s;

				return new TvLaneCoord( coord.road, laneSection, lane, laneSOffset, 0 );

			}

		}
	}

	findRoadCoordStrict ( road: TvRoad, position: Vector3 ): TvRoadCoord | undefined {

		const roadCoord = this.findRoadCoordAt( road, position );

		const width = roadCoord.t > 0 ?
			RoadWidthService.instance.findLeftWidthAt( roadCoord.road, roadCoord.s ) :
			RoadWidthService.instance.findRightWidthAt( roadCoord.road, roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) return;

		if ( Math.abs( roadCoord.s ) < 0.01 ) return;

		if ( Math.abs( roadCoord.s ) > road.getLength() ) return;

		return roadCoord;

	}

	findWidthUptoStart ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ): number {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let width = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			const currentLane = lanes[ i ];

			if ( currentLane.id == lane.id ) break;

			width += currentLane.getWidthValue( sOffset );

		}

		return width;
	}

	findLaneStartPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, tOffset: number = 0, withLaneHeight: boolean = true ) {

		const t = this.findWidthUptoStart( road, laneSection, lane, sOffset );

		const sign = lane.id >= 0 ? 1 : -1;

		const posTheta = this.findRoadPosition( road, laneSection.s + sOffset, t * sign );

		if ( !posTheta ) return;

		if ( withLaneHeight ) {
			const laneHeight = lane.getHeightValue( sOffset );
			posTheta.z += laneHeight.getLinearValue( 0 );
		}

		return posTheta;
	}

	findLaneCenterPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, tOffset: number = 0, withLaneHeight: boolean = true ) {

		const t = this.findWidthUptoCenter( road, laneSection, lane, sOffset );

		const sign = lane.id >= 0 ? 1 : -1;

		const posTheta = this.findRoadPosition( road, laneSection.s + sOffset, t * sign );

		if ( withLaneHeight ) {
			const laneHeight = lane.getHeightValue( sOffset );
			posTheta.z += laneHeight.getLinearValue( 1 );
		}

		return posTheta;

	}

	findWidthUptoCenter ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let totalWidth = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			const currentLane = lanes[ i ];

			const laneWidth = currentLane.getWidthValue( sOffset );

			totalWidth += laneWidth;

			if ( currentLane.id == lane.id ) {

				totalWidth -= laneWidth / 2;
				break;
			}
		}

		return totalWidth;

	}

	findWidthUpto ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let width = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			var element = lanes[ i ];

			width += element.getWidthValue( sOffset );

			if ( element.id == lane.id ) break;
		}

		return width;
	}

	findLaneEndPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, tOffset: number = 0, withLaneHeight: boolean = true ) {

		const t = this.findWidthUpto( road, laneSection, lane, sOffset ) + tOffset;

		const sign = lane.id > 0 ? 1 : -1;

		const posTheta = this.findRoadPosition( road, laneSection.s + sOffset, t * sign );

		if ( withLaneHeight ) {
			const laneHeight = lane.getHeightValue( sOffset );
			posTheta.z += laneHeight.getLinearValue( 1 );
		}

		return posTheta;
	}

	findRoadPosition ( road: TvRoad, s: number, t: number = 0 ): TvPosTheta {

		this.validateSOffset( road, s );

		const geometry = this.findGeometry( road, s );

		const odPosTheta = geometry.getRoadCoord( s );

		const laneOffset = road.getLaneProfile().getLaneOffsetValue( s );

		odPosTheta.addLateralOffset( laneOffset );

		odPosTheta.addLateralOffset( t );

		odPosTheta.z = road.getElevationProfile().getElevationValue( s );

		const superElevation = road.getLateralProfile().getSuperElevationValue( s );

		if ( t > 0 || t < 0 ) odPosTheta.z += t * Math.tan( superElevation || 0 ); // Adjust z based on superelevation

		odPosTheta.t = t;

		return odPosTheta;

	}

	findGeometry ( road: TvRoad, s: number ): TvAbstractRoadGeometry {

		if ( road.geometries.length == 0 ) {
			throw new NoGeometriesFound();
		}

		return road.getPlanView().getGeometryAt( s );

	}

	findContactCoord ( roadA: TvRoad, contactA: TvContactPoint ): TvRoadCoord {

		return contactA == TvContactPoint.START ? this.findStartPosition( roadA ).toRoadCoord( roadA ) : this.findEndPosition( roadA ).toRoadCoord( roadA );

	}

	findLinkCoord ( link: TvRoadLink ): TvRoadCoord {

		if ( link.isJunction ) {
			throw new Error( 'Junction link does not have position' );
		}

		return this.findContactCoord( link.element as TvRoad, link.contact );

	}

	findLinkPosition ( link: TvRoadLink ): TvPosTheta {

		if ( link.isJunction ) {
			throw new Error( 'Junction link does not have position' );
		}

		return this.findContactPosition( link.element as TvRoad, link.contact );

	}

	findCoordPosition ( coord: TvRoadCoord ): TvPosTheta {

		return this.findRoadPosition( coord.road, coord.s, coord.t );

	}

	private validateSOffset ( road: TvRoad, s: number ): void {

		if ( s == null ) {
			throw new InvalidArgumentException( 's is null' );
		}

		if ( s > road.length ) {
			throw new InvalidArgumentException( `s: ${ s } is greater than ${ road.toString() } length: ${ road.length }` );
		}

		if ( s < 0 ) {
			throw new InvalidArgumentException( `s: ${ s } is less than 0, ${ road.toString() } length: ${ road.length }` );
		}

	}
}
