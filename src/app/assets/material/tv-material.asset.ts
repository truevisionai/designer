/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvTexture } from "../texture/tv-texture.model";
import { MetaImporter } from "../../assets/metadata.model";
import { Material } from "three";

export class MaterialAsset {

	public guid: string;

	public readonly material: Material;

	public readonly textureGuids: { [ key: string ]: string };

	constructor ( guid: string, material: Material ) {
		this.material = material;
		this.guid = guid;
		this.textureGuids = {};
		this.setGuid( guid );
	}

	setGuid ( guid: string ) {

		this.guid = guid;
		this.material.userData.guid = guid;
		this.material[ 'guid' ] = guid;

	}

	setMap ( attributeName: string, texture: TvTexture ) {

		if ( texture.guid === undefined ) {
			console.error( 'Texture has no guid' );
			return;
		}

		this.material[ attributeName ] = texture;

		this.textureGuids[ attributeName ] = texture.guid;

		this.material.userData[ attributeName ] = texture.guid;

	}

	toMetadata ( path: string ) {
		return {
			guid: this.guid,
			importer: MetaImporter.MATERIAL,
			data: {},
			path: path,
		};
	}
}
