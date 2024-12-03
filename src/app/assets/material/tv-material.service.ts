/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from "../../assets/asset-database";
import { FileExtension } from "../../io/file-extension";
import { MaterialAsset } from "./tv-material.asset";
import { AssetService } from "../../assets/asset.service";
import { Asset } from "../../assets/asset.model";
import { TvMaterialExporter } from "./tv-material.exporter";
import { StorageService } from "../../io/storage.service";

@Injectable( {
	providedIn: 'root'
} )
export class TvMaterialService {

	constructor (
		public assetService: AssetService,
		private exporter: TvMaterialExporter,
		private storageService: StorageService,
	) {
	}

	createAsset ( destinationFolder: string, material: MaterialAsset ): string {

		if ( AssetDatabase.has( material.guid ) ) {
			return material.guid;
		}

		const filename = ( material.material.name || 'material-' + material.guid ) + '.' + FileExtension.MATERIAL;

		const asset = this.assetService.createMaterialAsset( destinationFolder, filename, material );

		AssetDatabase.setInstance( material.guid, material.material );

		this.assetService.addAsset( asset );

		return material.guid;
	}

	updateAsset ( asset: Asset ): string {

		const materialAsset = this.getMaterial( asset.guid );

		if ( !materialAsset ) {
			console.error( 'Material not found', asset.guid );
			return;
		}

		const contents = this.exporter.exportAsString( materialAsset );

		this.storageService.writeSync( asset.path, contents );

	}

	updateByGuid ( guid: string ): void {

		const asset = this.assetService.getAsset( guid );

		if ( !asset ) {
			console.error( 'Asset not found', guid );
			return;
		}

		this.updateAsset( asset );

	}

	addMaterial ( material: MaterialAsset ): void {

		this.assetService.setInstance( material.guid, material );

	}

	getMaterial ( guid: string ): MaterialAsset {

		return this.assetService.getInstance<MaterialAsset>( guid );

	}
}
