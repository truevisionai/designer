/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { LinkedDataService } from "app/core/interfaces/data.service";
import { TvLane } from "../models/tv-lane";
import { TvLaneHeight } from "./lane-height.model";
import { LaneService } from "app/services/lane/lane.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightService extends LinkedDataService<TvLane, TvLaneHeight> {

	constructor ( laneService: LaneService ) {

		super();

		this.parentService = laneService;

	}

	all ( parent: TvLane ): TvLaneHeight[] {

		return parent.height;

	}

	add ( parent: TvLane, object: TvLaneHeight ): void {

		parent.height.push( object );

		parent.height.sort( ( a, b ) => a.sOffset - b.sOffset );

		this.parentService.update( parent );

	}

	update ( parent: TvLane, object: TvLaneHeight ): void {

		parent.height.sort( ( a, b ) => a.sOffset - b.sOffset );

		this.parentService.update( parent );

	}

	remove ( parent: TvLane, object: TvLaneHeight ): void {

		const index = parent.height.indexOf( object );

		if ( index > - 1 ) {

			parent.height.splice( index, 1 );

		}

		parent.height.sort( ( a, b ) => a.sOffset - b.sOffset );

		this.parentService.update( parent );

	}

}
