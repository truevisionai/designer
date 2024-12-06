/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ScenarioService } from 'app/scenario/services/scenario.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { Asset, AssetType } from 'app/assets/asset.model';
import { LoaderFactory } from 'app/factories/loader.factory';

@Injectable( {
	providedIn: 'root'
} )
export class ImporterService {

	constructor (
		private loaderFactory: LoaderFactory,
		private scenarioService: ScenarioService,		// dont remove required for import
		private sceneFileService: TvSceneFileService,
	) {
	}

	async importAsset ( asset: Asset ): Promise<void> {

		switch ( asset.type ) {

			case AssetType.SCENE:
				await this.importScene( asset );
				break;

			default:
				console.error( 'Asset type not supported for import', asset.type );
				break;

		}

	}

	async importScene ( asset: Asset ): Promise<void> {

		const assetLoader = this.loaderFactory.getLoader( AssetType.SCENE )

		const scene = assetLoader.load( asset );

		this.sceneFileService.setMap( scene );

	}

}
