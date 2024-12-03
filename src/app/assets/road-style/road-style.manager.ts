/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSide, TvLaneType, TvRoadMarkTypes } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneOffset } from 'app/map/models/tv-lane-offset';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadStyle } from "./road-style.model";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class RoadStyleManager {

	private style?: RoadStyle;

	setCurrentStyle ( style: RoadStyle ) {

		this.style = style;

	}

	getRoadStyle ( road: TvRoad ): RoadStyle {

		if ( this.style ) {

			return this.style.clone( road );
		}

		return RoadStyleManager.getDefaultRoadStyle( road );
	}

	getRampRoadStyle ( road: TvRoad, lane?: TvLane ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvLaneOffset( 0, 0, 0, 0, 0 );

		roadStyle.laneSection = new TvLaneSection( 0, 0, true, road );

		roadStyle.laneSection.createCenterLane( 0, TvLaneType.driving, false, true );

		if ( lane ) {

			roadStyle.laneSection.addLaneInstance( lane, true );

		} else {

			roadStyle.laneSection.createRightLane( -1, TvLaneType.driving, false, true );

			roadStyle.laneSection.getNonCenterLanes().forEach( lane => {

				const width = lane.type === TvLaneType.parking ? 5.6 : 3.6;

				lane.addWidthRecord( 0, width, 0, 0, 0 );

			} );

		}


		return roadStyle;
	}

	static getDefaultRoadStyle ( road: TvRoad ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvLaneOffset( 0, 0, 0, 0, 0 );

		roadStyle.laneSection = new TvLaneSection( 0, 0, true, road );

		roadStyle.setRoad( road );

		const leftLane3 = roadStyle.laneSection.createLeftLane( 3, TvLaneType.sidewalk, true, true );
		const leftLane2 = roadStyle.laneSection.createLeftLane( 2, TvLaneType.shoulder, true, true );
		const leftLane1 = roadStyle.laneSection.createLeftLane( 1, TvLaneType.driving, false, true );
		const centerLane = roadStyle.laneSection.createCenterLane( 0, TvLaneType.driving, false, true );
		const rightLane1 = roadStyle.laneSection.createRightLane( -1, TvLaneType.driving, false, true );
		const rightLane2 = roadStyle.laneSection.createRightLane( -2, TvLaneType.shoulder, true, true );
		const rightLane3 = roadStyle.laneSection.createRightLane( -3, TvLaneType.sidewalk, true, true );

		leftLane1.addRoadMarkOfType( 0, TvRoadMarkTypes.SOLID );
		centerLane.addRoadMarkOfType( 0, TvRoadMarkTypes.BROKEN );
		rightLane1.addRoadMarkOfType( 0, TvRoadMarkTypes.SOLID );

		roadStyle.laneSection.getLanes().forEach( lane => {

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

	getParkingRoadStyle ( road: TvRoad ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvLaneOffset( 0, 0, 0, 0, 0 );

		roadStyle.laneSection = new TvLaneSection( 0, 0, true, road );

		roadStyle.setRoad( road );

		const leftLane2 = roadStyle.laneSection.createLeftLane( 2, TvLaneType.parking, true, true );
		const leftLane1 = roadStyle.laneSection.createLeftLane( 1, TvLaneType.driving, false, true );
		const centerLane = roadStyle.laneSection.createCenterLane( 0, TvLaneType.driving, false, true );
		const rightLane1 = roadStyle.laneSection.createRightLane( -1, TvLaneType.driving, false, true );
		const rightLane2 = roadStyle.laneSection.createRightLane( -2, TvLaneType.parking, true, true );

		leftLane2.addRoadMarkOfType( 0, TvRoadMarkTypes.SOLID )
		leftLane1.addNoneRoadMark();
		centerLane.addNoneRoadMark();
		rightLane1.addNoneRoadMark();
		rightLane2.addRoadMarkOfType( 0, TvRoadMarkTypes.SOLID );

		roadStyle.laneSection.getNonCenterLanes().forEach( lane => {

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
