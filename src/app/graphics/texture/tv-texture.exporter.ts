/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { TvTexture } from "./tv-texture.model";

@Injectable( {
	providedIn: 'root'
} )
export class TvTextureExporter implements AssetExporter<TvTexture> {

	constructor () {
	}

	exportAsJSON ( asset: TvTexture ): any {

		throw new Error( 'Method not implemented.' );

	}

	exportAsString ( asset: TvTexture ): string {

		throw new Error( 'Method not implemented.' );
		return asset.source.data;
	}

}
