/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset, AssetType } from "../assets/asset.model";

@Injectable( {
	providedIn: 'root'
} )
export class MockAssetFactory {

	static createAsset ( type: AssetType ): Asset {

		switch ( type ) {

			case AssetType.TEXTURE:
				return new Asset( type, 'texture', 'path/to/texture' );

			case AssetType.MATERIAL:
				return new Asset( type, 'material', 'path/to/material' );
		}

	}


}
