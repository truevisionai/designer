/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Metadata } from "../../../core/asset/metadata.model";

export enum AssetType {
	DIRECTORY,
	FILE,
	TEXTURE,
	MATERIAL,
	MODEL,
	MESH,
	SCENE,
	ROAD_STYLE,
}

/** Flat node with expandable and level information */
export class AssetNode {

	public isDeleted = false;

	public isSelected = false;

	constructor (
		public type: AssetType,
		public name: string,
		public path: string,
		public metadata: Metadata = null,
	) {
	}
}
