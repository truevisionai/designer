/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TextureInspector } from 'app/views/inspectors/texture-inspector/texture-inspector.component';
import { AppInspector } from '../core/inspector';
import { Asset, AssetType } from 'app/assets/asset.model';
import { AssetInspectorComponent } from 'app/views/inspectors/asset-inspector/asset-inspector.component';
import { StandardMaterialInspector } from "../views/inspectors/material-inspector/standard-material.inspector";
import { AssetPreviewService } from "../views/inspectors/asset-preview/asset-preview.service";
import { MaterialInspector } from "../views/inspectors/material-inspector/material-inspector.component";
import { TvMaterialService } from "../assets/material/tv-material.service";

@Injectable( {
	providedIn: 'root'
} )
export class InspectorFactory {

	constructor (
		private materialService: TvMaterialService,
		private previewService: AssetPreviewService,
	) {
	}

	setAssetInspector ( asset: Asset ): void {

		if ( asset.type === AssetType.TEXTURE ) {

			AppInspector.setInspector( TextureInspector, asset );

		} else if ( asset.type === AssetType.MATERIAL ) {

			AppInspector.setInspector( MaterialInspector, asset );

			// this.setMaterialInspector( assets );

		} else {

			AppInspector.setInspector( AssetInspectorComponent, asset );

		}

	}

	setMaterialInspector ( asset: Asset ): void {

		const materialAsset = this.materialService.getMaterial( asset.guid );

		const inspector = new StandardMaterialInspector( materialAsset, this.materialService, this.previewService );

		AppInspector.setDynamicInspector( inspector );

	}

}
