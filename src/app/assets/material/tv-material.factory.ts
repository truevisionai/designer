/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { MathUtils } from "three";
import { MaterialAsset } from "./tv-material.asset";
import { AssetFactory } from "../../factories/asset-factory.service";
import { TvStandardMaterial } from "./tv-standard-material";

@Injectable( {
	providedIn: 'root'
} )
export class TvMaterialFactory implements AssetFactory {

	constructor () {
	}

	createNew (): MaterialAsset {

		const material = new TvStandardMaterial( MathUtils.generateUUID() );

		const materialAsset = new MaterialAsset( material.guid, material );

		return materialAsset;

	}
}
