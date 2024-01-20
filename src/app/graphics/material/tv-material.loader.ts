import { AssetDatabase } from 'app/core/asset/asset-database';
import { MaterialLoader, Texture } from 'three';
import { TvMaterial } from './tv-material';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { StorageService } from 'app/io/storage.service';
import { Injectable } from '@angular/core';


@Injectable( {
	providedIn: 'root'
} )
export class TvMaterialLoader {

	private loader = new MaterialLoader();

	constructor ( private storageService: StorageService ) { }

	loadMaterial ( asset: AssetNode ) {

		const contents = this.storageService.readSync( asset.path );

		const json = JSON.parse( contents );

		return this.parseMaterial( json );

	}

	parseMaterial ( json: any ): TvMaterial {

		const material = this.loader.parse( json );

		const tvMaterial = new TvMaterial( json?.guid );

		tvMaterial.copy( material );

		if ( json.mapGuid !== undefined ) {
			tvMaterial.mapGuid = json.mapGuid;
			tvMaterial.map = AssetDatabase.getInstance<Texture>( json.mapGuid );
		}

		if ( json.roughnessMapGuid !== undefined ) {
			tvMaterial.roughnessMapGuid = json.roughnessMapGuid;
			tvMaterial.roughnessMap = AssetDatabase.getInstance<Texture>( json.roughnessMapGuid );
		}

		if ( json.normalMapGuid !== undefined ) {
			tvMaterial.normalMapGuid = json.normalMapGuid;
			tvMaterial.normalMap = AssetDatabase.getInstance<Texture>( json.normalMapGuid );
		}

		if ( json.aoMapGuid !== undefined ) {
			tvMaterial.aoMapGuid = json.aoMapGuid;
			tvMaterial.aoMap = AssetDatabase.getInstance<Texture>( json.aoMapGuid );
		}

		if ( json.displacementMapGuid !== undefined ) {
			tvMaterial.displacementMapGuid = json.displacementMapGuid;
			tvMaterial.displacementMap = AssetDatabase.getInstance<Texture>( json.displacementMapGuid );
		}

		if ( json.alphaMapGuid !== undefined ) {
			tvMaterial.alphaMapGuid = json.alphaMapGuid;
			tvMaterial.alphaMap = AssetDatabase.getInstance<Texture>( json.alphaMapGuid );
		}

		return tvMaterial;
	}

}
