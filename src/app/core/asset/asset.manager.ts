/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";

@Injectable( {
	providedIn: 'root'
} )
export class AssetManager {

	private textureAsset: AssetNode;

	private materialAsset: AssetNode;

	private _modelAsset: AssetNode;

	constructor () {

	}

	get modelAsset (): AssetNode {
		return this._modelAsset;
	}

	set modelAsset ( value: AssetNode ) {
		this._modelAsset = value;
	}

	setTextureAsset ( asset: AssetNode ) {

		this.textureAsset = asset;

	}

	getTextureAsset (): AssetNode {

		return this.textureAsset;

	}

	setMaterialAsset ( asset: AssetNode ) {

		this.materialAsset = asset;

	}

	getMaterialAsset (): AssetNode {

		return this.materialAsset;

	}

	getProp () {

		return this.modelAsset;

	}
}
