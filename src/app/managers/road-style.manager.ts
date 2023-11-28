/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	TvColors,
	TvLaneSide,
	TvLaneType,
	TvRoadMarkTypes,
	TvRoadMarkWeights
} from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadStyle } from "../core/asset/road.style";

export class RoadStyleManager {

	private static style?: RoadStyle;

	static setCurrentStyle ( style: RoadStyle ) {

		this.style = style;

	}

	static getRoadStyle ( road: TvRoad ): RoadStyle {

		if ( this.style ) {

			return this.style.clone( road );
		}

		return this.getDefaultRoadStyle( road );
	}

	static getRampRoadStyle ( road: TvRoad, lane: TvLane ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvRoadLaneOffset( road, 0, 0, 0, 0, 0 );

		roadStyle.laneSection = new TvLaneSection( 0, 0, true, road );

		roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		roadStyle.laneSection.addLaneInstance( lane, true );

		return roadStyle;
	}

	static getDefaultRoadStyle ( road: TvRoad ): RoadStyle {

		const roadStyle = new RoadStyle( road );

		roadStyle.laneOffset = new TvRoadLaneOffset( road, 0, 0, 0, 0, 0 );

		roadStyle.laneSection = new TvLaneSection( 0, 0, true, road );

		const leftLane3 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.sidewalk, true, true );
		const leftLane2 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
		const leftLane1 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		const centerLane = roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );
		const rightLane1 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		const rightLane2 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );
		const rightLane3 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.sidewalk, true, true );

		leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
		centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
		rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

		roadStyle.laneSection.getLaneArray().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				if ( lane.type == TvLaneType.driving ) {
					lane.addWidthRecord( 0, 3.6, 0, 0, 0 );
				} else if ( lane.type == TvLaneType.sidewalk ) {
					lane.addWidthRecord( 0, 2, 0, 0, 0 );
				} else {
					lane.addWidthRecord( 0, 0.5, 0, 0, 0 );
				}

			}

		} );

		return roadStyle;
	}

	static getParkingRoadStyle ( road: TvRoad ): RoadStyle {

		const roadStyle = new RoadStyle( road );

		roadStyle.laneOffset = new TvRoadLaneOffset( road, 0, 0, 0, 0, 0 );

		roadStyle.laneSection = new TvLaneSection( 0, 0, true, road );

		const leftLane2 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.parking, true, true );
		const leftLane1 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		const centerLane = roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );
		const rightLane1 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		const rightLane2 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.parking, true, true );

		leftLane2.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0, 'none', 0 );
		leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0, 'none', 0 );
		centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0, 'none', 0 );
		rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0, 'none', 0 );
		rightLane2.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0, 'none', 0 );

		roadStyle.laneSection.getLaneArray().filter( lane => lane.side !== TvLaneSide.CENTER ).forEach( lane => {

			if ( lane.type == TvLaneType.driving ) {

				lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

			} else if ( lane.type == TvLaneType.parking ) {

				lane.addWidthRecord( 0, 5.6, 0, 0, 0 );

			} else {

				lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

			}

		} );

		return roadStyle;
	}
}
