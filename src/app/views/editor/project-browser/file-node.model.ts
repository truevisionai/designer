/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FileExtension } from "app/io/file.service";
import { MetaImporter, Metadata } from "../../../core/asset/metadata.model";




export enum AssetType {
	DIRECTORY,
	FILE,
	TEXTURE,
	MATERIAL,
	MODEL,
	MESH,
	SCENE,
	ROAD_STYLE,
	ROAD_SIGN,
	ENTITY,
	OPENDRIVE,
	OPENSCENARIO,
	PREFAB,
	GEOMETRY
}

/** Flat node with expandable and level information */
export class AssetNode {

	public isDeleted = false;

	public isSelected = false;

	public children: AssetNode[] = [];

	constructor (
		public type: AssetType,
		public name: string,
		public path: string,
		public metadata: Metadata = null,
	) {
	}

	get guid () {

		return this.metadata?.guid;

	}

	get extension (): string {

		return this.path.split( '.' ).pop();

	}

	get assetName (): string {

		return this.name.split( '.' ).shift();

	}

	static getType ( importer: MetaImporter ): AssetType {

		switch ( importer ) {

			case MetaImporter.TEXTURE:
				return AssetType.TEXTURE;
				break;

			case MetaImporter.MATERIAL:
				return AssetType.MATERIAL;
				break;

			case MetaImporter.MODEL:
				return AssetType.MODEL;
				break;

			case MetaImporter.ROAD_STYLE:
				return AssetType.ROAD_STYLE;
				break;

			case MetaImporter.ENTITY:
				return AssetType.ENTITY;
				break;

			default:
				return AssetType.FILE;
				break;

		}

	}

	static getExtensionByAssetType ( type: AssetType ): string {

		switch ( type ) {

			case AssetType.DIRECTORY:
				return;

			case AssetType.MATERIAL:
				return FileExtension.MATERIAL;

			case AssetType.SCENE:
				return FileExtension.SCENE;

			case AssetType.ROAD_STYLE:
				return FileExtension.ROADSTYLE;

			case AssetType.ROAD_SIGN:
				return FileExtension.ROADSIGN;

			case AssetType.TEXTURE:
				return FileExtension.ROADSIGN;

			case AssetType.ROAD_SIGN:
				return FileExtension.ROADSIGN;

		}

	}

}
