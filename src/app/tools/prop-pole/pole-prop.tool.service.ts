/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { RoadObjectService } from '../crosswalk/road-object.service';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { PolePropFactory } from "./pole-prop.factory";

@Injectable( {
	providedIn: 'root'
} )
export class PolePropToolService {

	constructor (
		public base: BaseToolService,
		public objectService: RoadObjectService,
		public factory: PolePropFactory
	) {
	}

	createStreetLight ( position: RoadPosition, height = 4, width = 2.0, poleWidth = 0.15 ) {

		return this.factory.createStreetLight( position, height, width, poleWidth );

	}

	createSmallPole ( position: RoadPosition, height = 1, radius = 0.05, useLocalVertex = true ) {

		return this.factory.createSmallPole( position, height, radius, useLocalVertex );

	}

}

