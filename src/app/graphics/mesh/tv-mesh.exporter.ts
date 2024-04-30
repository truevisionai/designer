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

	exportAsJSON ( mesh: TvMesh ) {

		throw new Error( 'Method not implemented.' );

		// if ( mesh.materialGuid ) mesh.material = new MeshStandardMaterial();

		// const data = mesh.toJSON( undefined );

		// if ( mesh.materialGuid ) data.materialGuid = mesh.materialGuid;
		// if ( mesh.geometryGuid ) data.geometryGuid = mesh.geometryGuid;

		// if ( mesh.materialGuid ) {
		// 	if ( mesh.materialGuid instanceof Array ) {
		// 		mesh.material = data.materialGuid.map( ( guid: string ) => this.getMaterial( guid ) );
		// 	} else {
		// 		mesh.material = this.getMaterial( mesh.materialGuid );
		// 	}
		// }

		// return data;

	}

	private getMaterial ( guid: string ) {
		// return this.assetService.getMaterialAsset( guid )?.material;
	}

}
