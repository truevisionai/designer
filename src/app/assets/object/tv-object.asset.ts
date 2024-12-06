/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from 'three';
import { MetaImporter } from "../../assets/metadata.model";

export class TvObjectAsset {

	public readonly guid: string;

	public readonly instance: Object3D;

	constructor ( guid: string, object: Object3D ) {
		this.guid = guid;
		this.instance = object;
		this.instance.userData = { guid: this.guid };
	}

	toMetadata ( path: string ): any {

		return {
			guid: this.guid,
			importer: MetaImporter.OBJECT,
			data: {},
			path: path,
		};
	}

	clone (): TvObjectAsset {

		return new TvObjectAsset( this.guid, this.instance.clone() );

	}
}


