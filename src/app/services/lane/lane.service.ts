/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../../tools/base-tool.service';
import { TvLane } from 'app/map/models/tv-lane';
import { MapEvents } from 'app/events/map-events';
import { TvLaneType } from 'app/map/models/tv-common';
import { LaneTypeChangedEvent } from 'app/events/lane/lane-type-changed.event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { TvLaneHeight } from 'app/map/lane-height/lane-height.model';
import { RoadService } from '../road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneService extends BaseDataService<TvLane> {

	constructor (
		public base: BaseToolService,
		public roadService: RoadService,
	) {
		super();
	}

	all (): TvLane[] {
		return [];
	}

	add ( object: TvLane ): void {
		this.addLane( object );
	}

	update ( object: TvLane ): void {
		this.updateLane( object );
	}

	remove ( object: TvLane ): void {
		this.removeLane( object );
	}

	addLane ( lane: TvLane ) {

		lane.laneSection.addLaneInstance( lane, true );

		MapEvents.laneCreated.emit( lane );

	}

	removeLane ( lane: TvLane ) {

		lane.laneSection.removeLane( lane );

		MapEvents.laneRemoved.emit( lane );

	}

	updateLane ( lane: TvLane ) {

		MapEvents.laneUpdated.emit( lane );

	}

	setLaneType ( lane: TvLane, type: TvLaneType ) {

		const oldType = lane.type;

		lane.type = type;

		MapEvents.laneTypeChanged.emit( new LaneTypeChangedEvent( lane, type, oldType ) );

	}

	findLaneByLaneHeight ( height: TvLaneHeight ): TvLane {

		for ( const road of this.roadService.all() ) {

			for ( const laneSection of road.laneSections ) {

				for ( const lane of laneSection.getLaneArray() ) {

					for ( const laneHeight of lane.height ) {

						if ( laneHeight.uuid === height.uuid ) {

							return lane;

						}

					}

				}

			}

		}

	}

}
