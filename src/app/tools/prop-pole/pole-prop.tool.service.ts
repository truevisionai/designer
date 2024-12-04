/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { RoadObjectService } from '../../map/road-object/road-object.service';
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

	createStreetLight ( position: RoadPosition, height: number = 4, width: number = 2.0, poleWidth: number = 0.15 ): any {

		return this.factory.createStreetLight( position, height, width, poleWidth );

	}

	createSmallPole ( position: RoadPosition, height: number = 1, radius: number = 0.05, useLocalVertex: boolean = true ): any {

		return this.factory.createSmallPole( position, height, radius, useLocalVertex );

	}

}

