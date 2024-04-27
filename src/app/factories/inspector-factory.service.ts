/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TextureInspector } from 'app/views/inspectors/texture-inspector/texture-inspector.component';
import { AppInspector } from '../core/inspector';
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { AssetInspectorComponent } from 'app/views/inspectors/asset-inspector/asset-inspector.component';
import { TvMaterialService } from "../graphics/material/tv-material.service";
import { StandardMaterialInspector } from "../views/inspectors/material-inspector/standard-material.inspector";
import { AssetPreviewService } from "../views/inspectors/asset-preview/asset-preview.service";
import { MaterialInspector } from "../views/inspectors/material-inspector/material-inspector.component";

@Injectable( {
	providedIn: 'root'
} )
export class InspectorFactory {

	constructor (
		private materialService: TvMaterialService,
		private previewService: AssetPreviewService,
	) {
	}

	setAssetInspector ( asset: Asset ) {

		if ( asset.type === AssetType.TEXTURE ) {

			AppInspector.setInspector( TextureInspector, asset );

		} else if ( asset.type === AssetType.MATERIAL ) {

			 AppInspector.setInspector( MaterialInspector, asset );

			// this.setMaterialInspector( asset );

		} else {

			AppInspector.setInspector( AssetInspectorComponent, asset );

		}

	}

	setMaterialInspector ( asset: Asset ) {

		const materialAsset = this.materialService.getMaterial( asset.guid );

		const inspector = new StandardMaterialInspector( materialAsset, this.materialService, this.previewService );

		AppInspector.setDynamicInspector( inspector );

	}

}
