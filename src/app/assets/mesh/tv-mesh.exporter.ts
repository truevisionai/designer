/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { TvMesh } from "./tv-mesh";

@Injectable( {
	providedIn: 'root'
} )
export class TvMeshExporter implements AssetExporter<TvMesh> {

	constructor () {

	}

	exportAsString ( mesh: TvMesh ): string {

		const data = this.exportAsJSON( mesh );

		return JSON.stringify( data );
	}

	exportAsJSON ( mesh: TvMesh ): any {

		// NOTE: this is not correct, but it is just a placeholder
		const data = {
			guid: mesh.guid,
			name: mesh.name,
			geometryGuid: mesh.geometryGuid,
			materialGuid: mesh.materialGuid
		};

		return data;
	}

}
