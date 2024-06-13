/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { Asset } from 'app/core/asset/asset.model';
import { RoadSignalService } from 'app/map/road-signal/road-signal.service';
import { RoadSignalFactory } from 'app/map/road-signal/road-signal.factory';
import { RoadService } from 'app/services/road/road.service';
import { AssetManager } from 'app/core/asset/asset.manager';
import { RoadSignToolDebugger } from './road-sign-tool.debugger';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignToolService {

	constructor (
		public base: BaseToolService,
		public roadSignalService: RoadSignalService,
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
