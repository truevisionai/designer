/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Asset } from "app/assets/asset.model";

@Injectable( {
	providedIn: 'root'
} )
export class AssetManager {

	private textureAsset: Asset;

	private materialAsset: Asset;

	private _modelAsset: Asset;

	constructor () {

	}

	get modelAsset (): Asset {
		return this._modelAsset;
	}

	set modelAsset ( value: Asset ) {
		this._modelAsset = value;
	}

	setTextureAsset ( asset: Asset ) {

		this.textureAsset = asset;

	}

	getTextureAsset (): Asset {

		return this.textureAsset;

	}

	setMaterialAsset ( asset: Asset ) {

		this.materialAsset = asset;

	}

	getMaterialAsset (): Asset {

		return this.materialAsset;

	}

	getProp () {

		return this.modelAsset;

	}
}
