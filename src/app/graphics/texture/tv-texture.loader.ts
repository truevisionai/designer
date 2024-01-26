/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { LinearFilter, LinearMipMapLinearFilter, RGBAFormat, SRGBColorSpace, Texture, TextureLoader, UnsignedByteType } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class TvTextureLoader {

	private loader = new TextureLoader();

	constructor () { }

	loadTexture ( asset: AssetNode ): Texture {

		const json = asset.metadata.data;

		const texture = this.loader.load( asset.path );

		texture.uuid = json.uuid;

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

		return texture;

	}

}
