/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Metadata } from "../../../core/asset/metadata.model";

export enum AssetType {
	DIRECTORY = 'directory',
	FILE = 'file',
	TEXTURE = 'texture',
	MATERIAL = 'material',
	MODEL = 'model',
	MESH = 'mesh',
	SCENE = 'scene',
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
