/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvGeometry } from "./tv-geometry";
import { AssetExporter } from "../../core/interfaces/asset-exporter";

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

}
