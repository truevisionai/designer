/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvGeometry } from "./tv-geometry";
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { Asset } from "../../core/asset/asset.model";

@Injectable( {
	providedIn: 'root'
} )
export class TvGeometryExporter implements AssetExporter<TvGeometry> {

	exportAsString ( geometry: TvGeometry ) {

		return JSON.stringify( this.exportAsJSON( geometry ) );

	}

	exportAsJSON ( geometry: TvGeometry ) {

		return geometry.toJSON();

	}

	createAsset ( folderPath: string, asset: TvGeometry ): Asset {

		throw new Error( 'Method not implemented.' );

	}
}
