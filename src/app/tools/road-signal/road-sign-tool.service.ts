/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { Asset } from 'app/assets/asset.model';
import { RoadSignalFactory } from 'app/map/road-signal/road-signal.factory';
import { RoadService } from 'app/services/road/road.service';
import { AssetManager } from 'app/assets/asset.manager';
import { RoadSignToolDebugger } from './road-sign-tool.debugger';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignToolService {

	constructor (
		public base: BaseToolService,
		public signalFactory: RoadSignalFactory,
		public roadService: RoadService,
		public assetManager: AssetManager,
		public toolDebugger: RoadSignToolDebugger,
	) {
	}

	getSelectedAsset (): Asset {

		return this.assetManager.getTextureAsset();

	}
}
