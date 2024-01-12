import { Injectable } from "@angular/core";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";

@Injectable( {
	providedIn: 'root'
} )
export class AssetManager {

	private textureAsset: AssetNode;

	private materialAsset: AssetNode;

	constructor () {

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

}
