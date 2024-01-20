import { Injectable } from "@angular/core";
import { TvMaterial } from "app/modules/three-js/objects/tv-material.model";
import { Texture } from "three";
import { AssetDatabase } from "../core/asset/asset-database";
import { MetaImporter, Metadata } from "app/core/asset/metadata.model";

@Injectable( {
	providedIn: 'root'
} )
export class MaterialExporter {

	createMetadata ( fileName: string, guid: string, path: string ): Metadata {

		return {
			guid: guid,
			importer: MetaImporter.MATERIAL,
			data: {},
			path: path,
		};

	}

	export ( material: TvMaterial ): string {

		const data = this.exportJSON( material );

		return JSON.stringify( data );
	}

	exportJSON ( material: TvMaterial ) {

		const meta = {
			textures: {},
			images: {}
		};

		// unset maps to prevent serialization
		if ( material.mapGuid ) material.map = null;
		if ( material.roughnessMapGuid ) material.roughnessMap = null;
		if ( material.normalMapGuid ) material.normalMap = null;
		if ( material.aoMapGuid ) material.aoMap = null;
		if ( material.displacementMapGuid ) material.displacementMap = null;
		if ( material.alphaMapGuid ) material.alphaMap = null;

		const data = material.toJSON( meta );

		// standard Material serialization
		if ( material.guid ) data.guid = material.guid;
		if ( material.mapGuid ) data.mapGuid = material.mapGuid;
		if ( material.roughnessMapGuid ) data.roughnessMapGuid = material.roughnessMapGuid;
		if ( material.normalMapGuid ) data.normalMapGuid = material.normalMapGuid;
		if ( material.aoMapGuid ) data.aoMapGuid = material.aoMapGuid;
		if ( material.displacementMapGuid ) data.displacementMapGuid = material.displacementMapGuid;
		if ( material.alphaMapGuid ) data.alphaMapGuid = material.alphaMapGuid;

		// set maps again
		if ( material.mapGuid ) material.map = AssetDatabase.getInstance( material.mapGuid ) as Texture;
		if ( material.roughnessMapGuid ) material.roughnessMap = AssetDatabase.getInstance( material.roughnessMapGuid ) as Texture;
		if ( material.normalMapGuid ) material.normalMap = AssetDatabase.getInstance( material.normalMapGuid ) as Texture;
		if ( material.aoMapGuid ) material.aoMap = AssetDatabase.getInstance( material.aoMapGuid ) as Texture;
		if ( material.displacementMapGuid ) material.displacementMap = AssetDatabase.getInstance( material.displacementMapGuid ) as Texture;
		if ( material.alphaMapGuid ) material.alphaMap = AssetDatabase.getInstance( material.alphaMapGuid ) as Texture;

		return data;

	}
}
