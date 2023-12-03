/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FileExtension } from 'app/io/FileExtension';
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
	GEOMETRY,
	ROAD_MARKING
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

	get preview () {

		return this.metadata?.preview;

	}

	set preview ( value ) {

		this.metadata.preview = value;

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

			case MetaImporter.SCENE:
				return AssetType.SCENE;
				break;

			case MetaImporter.PREFAB:
				return AssetType.PREFAB;
				break;

			case MetaImporter.OPENDRIVE:
				return AssetType.OPENDRIVE;
				break;

			case MetaImporter.OPENSCENARIO:
				return AssetType.OPENSCENARIO;
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

			case AssetType.OPENDRIVE:
				return FileExtension.OPENDRIVE;

			case AssetType.OPENSCENARIO:
				return FileExtension.OPENSCENARIO;

			case AssetType.PREFAB:
				return FileExtension.PREFAB;

		}

	}

}
