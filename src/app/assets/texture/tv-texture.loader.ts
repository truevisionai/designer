/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset } from 'app/assets/asset.model';
import {
	LinearFilter,
	LinearMipMapLinearFilter,
	RGBAFormat,
	SRGBColorSpace,
	Texture,
	TextureLoader,
	UnsignedByteType
} from "three";
import { TextureAsset, TvTexture } from "./tv-texture.model";
import { AssetLoader } from "../../core/interfaces/asset.loader";

@Injectable( {
	providedIn: 'root'
} )
export class TvTextureLoader implements AssetLoader {

	private loader = new TextureLoader();

	constructor () {
	}

	load ( asset: Asset ): TextureAsset {

		const json = asset.metadata.data;

		const texture = this.loadFromJSON( json, asset.path, asset.guid );

		return texture;
	}



	async loadAsyncPath ( json: any, path: string, guid: string ): Promise<TextureAsset> {

		const texture = await this.loader.loadAsync( path );

		return this.parse( texture, json, guid );

	}

	loadFromJSON ( json: any, path: string, guid: string ): TextureAsset {

		const texture = this.loader.load( path );

		return this.parse( texture, json, guid );

	}

	private parse ( texture: Texture, json: any, guid: string ): TextureAsset {

		texture.uuid = guid || json.uuid;

		texture.name = json.name;

		texture.mapping = json.mapping || 300;

		if ( json.repeat ) texture.repeat.set( json.repeat[ 0 ], json.repeat[ 1 ] );
		if ( json.offset ) texture.offset.set( json.offset[ 0 ], json.offset[ 1 ] );
		if ( json.center ) texture.center.set( json.center[ 0 ], json.center[ 1 ] );

		if ( json.wrap ) {
			texture.wrapS = json[ 'wrap' ][ 0 ];
			texture.wrapT = json[ 'wrap' ][ 1 ];
		}

		texture.rotation = json.rotation || 0;
		texture.colorSpace = SRGBColorSpace;
		texture.minFilter = json.minFilter || LinearMipMapLinearFilter;
		texture.magFilter = json.magFilter || LinearFilter;
		texture.anisotropy = json.anisotropy || 1;
		texture.flipY = json.flipY || true;
		texture.premultiplyAlpha = json.premultiplyAlpha || false;
		texture.unpackAlignment = json.unpackAlignment || 4;
		texture.format = json.format || RGBAFormat;
		texture.type = json.type || UnsignedByteType;

		const tvTexture = TvTexture.createFromTexture( guid || json.uuid, texture );

		return new TextureAsset( tvTexture.guid, tvTexture );

	}
}
