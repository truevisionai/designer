/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { BaseToolService } from '../base-tool.service';
import { RoadObjectService } from '../../map/road-object/road-object.service';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { PropSpanToolDebugger } from "./prop-span-tool.debugger";
import { RoadService } from "../../services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class PropSpanToolService {

	constructor (
		public base: BaseToolService,
		public roadObjectService: RoadObjectService,
		public toolDebugger: PropSpanToolDebugger,
		public roadService: RoadService,
	) {
	}

	createRoadSpanObject ( assetGuid: string, position: TvRoadCoord ): any {

		const roadObject = this.createRoadObject( assetGuid, position, TvRoadObjectType.tree );

		const repeatLength = -1;    // -1 because it repreated till the end of the road

		const distance = 10;

		roadObject.addRepeat( position.s, repeatLength, distance );

		return roadObject;

	}

	addRoadSpanObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		this.roadObjectService.addRoadObject( road, roadObject );

	}

	removeRoadSpanObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		this.roadObjectService.removeRoadObject( road, roadObject );

	}

	createRoadObject ( assetGuid: string, position: TvRoadCoord, objectType: TvRoadObjectType ): any {

		const roadObject = this.roadObjectService.createRoadObject( position.road, objectType, position.s, position.t );

		roadObject.assetGuid = assetGuid;

		roadObject.width = 1;

		roadObject.length = 1;

		roadObject.height = 1;

		return roadObject;

	}

}
