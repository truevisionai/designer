/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Texture } from "three";
import { MetaImporter } from "../../assets/metadata.model";
import {
	ColorSpace,
	MagnificationTextureFilter,
	Mapping,
	MinificationTextureFilter,
	PixelFormat, TextureDataType,
	Wrapping
} from "three/src/constants";
import { OffscreenCanvas } from "three/src/textures/Texture";

export class TvTexture extends Texture {

	public readonly guid: string;

	constructor (
		guid: string,
		image?: TexImageSource | OffscreenCanvas,
		mapping?: Mapping,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: MagnificationTextureFilter,
		minFilter?: MinificationTextureFilter,
		format?: PixelFormat,
		type?: TextureDataType,
		anisotropy?: number,
		colorSpace?: ColorSpace
	) {
		super( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );
		this.guid = guid;
	}

	static createFromTexture ( guid: string, texture: Texture ): TvTexture {

		const tvTexture = new TvTexture( guid );

		tvTexture.copy( texture );

		return tvTexture;

	}

	toMetadata ( path: string ): any {

		const image = this.image;

		// unset image to avoid write image data in json
		// this will reduce the size of the json file and
		// saves time
		this.image = null;

		const data = this.toJSON( undefined );

		// set image again
		this.image = image;

		return {
			guid: this.guid,
			version: 4.5,
			type: 'Texture',
			importer: MetaImporter.TEXTURE,
			data: data,
			path: path
		};
	}

}

export class TextureAsset {

	public readonly texture: TvTexture;

	public readonly guid: string;

	constructor ( guid: string, texture: TvTexture ) {
		this.guid = guid;
		this.texture = texture;
		this.texture.userData = { guid: this.guid };
	}

	toMetadata ( path: string ): any {

		return this.texture.toMetadata( path );

	}

}