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
import { TvRoadLinkType } from "../../map/models/tv-road-link";
import { RoadLinkService } from "./road-link.service";
import { RoadManager } from "../../managers/road/road-manager";
import { MapService } from "../map/map.service";
import { SplineUtils } from "../../utils/spline.utils";
import { SplineSegmentService } from '../spline/spline-segment.service';

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
		private segmentService: SplineSegmentService,
	) {
	}

	divideRoadAt ( road: TvRoad, s: number ) {

		const newRoad = this.roadService.divideRoad( road, s );

		this.segmentService.addSegment( road.spline, road.sStart + s, newRoad );

		return newRoad

	}

	cutRoadFromTo ( road: TvRoad, sStart: number, sEnd: number ): TvRoad {

		// TODO: Not used and might need fixes

		SplineUtils.addSegment( road.spline, road.sStart + sStart, null );

		if ( sEnd > road.length ) return;

		const newRoad = this.roadService.clone( road, sEnd );

		newRoad.sStart = road.sStart + sEnd;

		SplineUtils.addSegment( road.spline, newRoad.sStart, newRoad );

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

		const junctionWidth = center.road.getLaneProfile().getRoadWidthAt( center.s ).totalWidth;

		const sStartJunction = center.road.sStart + center.s - junctionWidth;

		const sEndJunction = center.road.sStart + center.s + junctionWidth;

		return this.cutRoadForJunctionFromTo( center, junction, sStartJunction, sEndJunction );

	}

	cutRoadForJunctionFromTo ( center: TvRoadCoord, junction: TvJunction, sStartJunction: number, sEndJunction: number ): TvRoadCoord {

		const junctionWidth = center.road.getLaneProfile().getRoadWidthAt( center.s ).totalWidth;

		let newRoad: TvRoad

		if ( !this.isNearRoadStartOrEnd( center, junctionWidth ) ) {

			SplineUtils.addSegment( center.road.spline, sStartJunction, junction );

			if ( sEndJunction < this.splineService.getLength( center.road.spline ) ) {

				newRoad = this.roadService.clone( center.road, center.s + junctionWidth );

				newRoad.sStart = sEndJunction;

				SplineUtils.addSegment( center.road.spline, newRoad.sStart, newRoad );

				// set junction as predecessor of new road
				// |ROAD====>|JUNCTIION|====>NEWROAD|
				newRoad.setPredecessor( TvRoadLinkType.JUNCTION, junction );

				center.road.setSuccessor( TvRoadLinkType.JUNCTION, junction );

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

		const junctionWidth = coord.road.getLaneProfile().getRoadWidthAt( coord.s ).totalWidth;

		const atEnd = coord.s + junctionWidth >= coord.road.length;
		const atStart = coord.s - junctionWidth <= 0;

		if ( atEnd ) {

			const sStartJunction = coord.road.sStart + coord.road.length - junctionWidth;

			SplineUtils.addSegment( coord.road.spline, sStartJunction, junction );

			coord.road.length = coord.road.length - junctionWidth;

			coord.s = coord.road.length;

			coord.road.setSuccessor( TvRoadLinkType.JUNCTION, junction );

			return;
		}

		if ( atStart ) {

			const sEndJunction = junctionWidth;

			// const segment = coord.road.spline.getSegmentAt( 0 );

			// segment.setStart( sEndJunction );

			SplineUtils.addSegment( coord.road.spline, 0, junction );

			coord.road.length = coord.road.length - sEndJunction;

			coord.s = 0;

			coord.road.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		}

	}

	private isNearRoadStartOrEnd ( coord: TvRoadCoord, width: number ) {

		const isOver = coord.s + width >= coord.road.length;
		const isUnder = coord.s - width <= 0;

		return isOver || isUnder;

	}
}
