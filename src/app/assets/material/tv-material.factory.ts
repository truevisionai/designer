/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from "three";
import { MaterialAsset } from "./tv-material.asset";
import { TvStandardMaterial } from "./tv-standard-material";

export class TvMaterialFactory {

	constructor () {
	}

	static createNew (): MaterialAsset {

		const material = new TvStandardMaterial( MathUtils.generateUUID() );

		const materialAsset = new MaterialAsset( material.guid, material );

		return materialAsset;

	}
}
