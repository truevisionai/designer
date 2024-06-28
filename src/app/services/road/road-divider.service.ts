/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadService } from './road.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { SplineService } from '../spline/spline.service';
import { TvRoadCoord } from "../../map/models/TvRoadCoord";
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { TvRoadLinkChildType } from "../../map/models/tv-road-link-child";
import { RoadLinkService } from "./road-link.service";
import { RoadManager } from "../../managers/road/road-manager";
import { MapService } from "../map/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerService {

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private roadService: RoadService,
		private splineService: SplineService,
		private linkService: RoadLinkService,
	) {
	}

	divideRoadAt ( road: TvRoad, s: number ) {

		const newRoad = this.roadService.divideRoad( road, s );

		this.splineService.addRoadSegmentNew( road.spline, newRoad.sStart, newRoad );

		this.splineService.update( road.spline );

		return newRoad

	}

	clone ( road: TvRoad, s: number ) {

		const newRoad = this.roadService.clone( road, s );

		newRoad.sStart = road.sStart + s;

		this.splineService.addRoadSegmentNew( road.spline, newRoad.sStart, newRoad );

		return newRoad

	}

	cutRoadFromTo ( road: TvRoad, sStart: number, sEnd: number ): TvRoad {

		// TODO: Not used and might need fixes

		this.splineService.addEmptySegment( road.spline, road.sStart + sStart );

		if ( sEnd > road.length ) return;

		const newRoad = this.roadService.clone( road, sEnd );

		newRoad.sStart = road.sStart + sEnd;

		this.splineService.addRoadSegmentNew( road.spline, newRoad.sStart, newRoad );

		// update links

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			successor.setPredecessorRoad( newRoad, TvContactPoint.END );

			newRoad.successor = road.successor;

			// TODO: this will be junction and not null
			road.successor = null;

		}

		this.splineService.update( road.spline );

		newRoad.predecessor = null;

		return newRoad;

	}

	cutRoadForJunction ( center: TvRoadCoord, junction: TvJunction ): TvRoadCoord {

		const junctionWidth = center.road.getRoadWidthAt( center.s ).totalWidth;

		const sStartJunction = center.road.sStart + center.s - junctionWidth;

		const sEndJunction = center.road.sStart + center.s + junctionWidth;

		return this.cutRoadForJunctionFromTo( center, junction, sStartJunction, sEndJunction );

	}

	cutRoadForJunctionFromTo ( center: TvRoadCoord, junction: TvJunction, sStartJunction: number, sEndJunction: number ): TvRoadCoord {

		const junctionWidth = center.road.getRoadWidthAt( center.s ).totalWidth;

		let newRoad: TvRoad

		if ( !this.isNearRoadStartOrEnd( center, junctionWidth ) ) {

			this.splineService.addJunctionSegment( center.road.spline, sStartJunction, junction );

			if ( sEndJunction < this.splineService.getLength( center.road.spline ) ) {

				newRoad = this.roadService.clone( center.road, center.s + junctionWidth );

				newRoad.sStart = sEndJunction;

				this.splineService.addRoadSegmentNew( center.road.spline, newRoad.sStart, newRoad );

				// set junction as predecessor of new road
				// |ROAD====>|JUNCTIION|====>NEWROAD|
				newRoad.setPredecessor( TvRoadLinkChildType.junction, junction );

				center.road.setSuccessor( TvRoadLinkChildType.junction, junction );

				this.linkService.updateSuccessorRelationWhileCut( newRoad, newRoad.successor, center.road );

			}

			center.road.length = sStartJunction;

			center.s -= junctionWidth;

		} else {

			this.cutForTJunction( center, junction );

		}

		if ( newRoad ) {

			this.mapService.map.addRoad( newRoad );

			this.roadManager.addRoad( newRoad );

			this.roadManager.updateRoad( center.road );

			return newRoad.getStartPosTheta().toRoadCoord( newRoad );

		} else {

			this.roadManager.updateRoad( center.road );

		}
	}

	private cutForTJunction ( coord: TvRoadCoord, junction: TvJunction ) {

		const junctionWidth = coord.road.getRoadWidthAt( coord.s ).totalWidth;

		const atEnd = coord.s + junctionWidth >= coord.road.length;
		const atStart = coord.s - junctionWidth <= 0;

		if ( atEnd ) {

			const sStartJunction = coord.road.sStart + coord.road.length - junctionWidth;

			this.splineService.addJunctionSegment( coord.road.spline, sStartJunction, junction );

			coord.road.length = coord.road.length - junctionWidth;

			coord.s = coord.road.length;

			coord.road.setSuccessor( TvRoadLinkChildType.junction, junction );

			return;
		}

		if ( atStart ) {

			const sEndJunction = junctionWidth;

			// const segment = coord.road.spline.getSegmentAt( 0 );

			// segment.setStart( sEndJunction );

			this.splineService.addJunctionSegment( coord.road.spline, 0, junction );

			coord.road.length = coord.road.length - sEndJunction;

			coord.s = 0;

			coord.road.setPredecessor( TvRoadLinkChildType.junction, junction );

		}

	}

	private isNearRoadStartOrEnd ( coord: TvRoadCoord, width: number ) {

		const isOver = coord.s + width >= coord.road.length;
		const isUnder = coord.s - width <= 0;

		return isOver || isUnder;

	}
}
