/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetaImporter, Metadata } from 'app/core/asset/metadata.model';
import { Texture } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class TvTextureExporter {

	constructor () { }

	exportFromGuid ( guid: string ): string {

		const metadata = AssetDatabase.getMetadata( guid );

		return this.exportFromMetadata( metadata );

	}

	exportFromMetadata (  metadata: Metadata ): string {

		const texture = AssetDatabase.getInstance<Texture>( metadata.guid );

		return this.exportFromTexture( metadata.guid, metadata.path, texture );

	}

	exportFromTexture ( guid: string, path: string, texture: Texture ): string {

		const json = this.createMetadata( guid, path, texture );

		return JSON.stringify( json, null, 2 );

	}

	createMetadata ( guid: string, path: string, texture: Texture ): Metadata {

		const image = texture.image;

		// unset image to avoid write image data in json
		// this will reduce the size of the json file and
		// saves time
		texture.image = null;

		const json = texture.toJSON( undefined );

		// set image again
		texture.image = image;

		json[ 'metadata' ] = null;

		return {
			guid: guid,
			importer: MetaImporter.TEXTURE,
			data: json,
			path: path
		};

	}
}
