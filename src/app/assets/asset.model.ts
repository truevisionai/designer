/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FileExtension } from 'app/io/file-extension';
import { MetaImporter, Metadata } from "./metadata.model";
import { FileUtils } from 'app/io/file-utils';

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
	OBJECT,
	GEOMETRY,
	ROAD_MARKING
}

/** Flat node with expandable and level information */
export class Asset {

	public isDeleted = false;

	public isSelected = false;

	public children: Asset[] = [];

	public instance: any;

	constructor (
		public type: AssetType,
		public name: string,
		private _path: string,
		public metadata: Metadata = null,
	) {
	}

	get isDirectory (): boolean {

		return this.type === AssetType.DIRECTORY;

	}

	get isMaterial (): boolean {
		return this.type == AssetType.MATERIAL
	}

	get isTexture (): boolean {
		return this.type == AssetType.TEXTURE;
	}

	get thumbnail (): string {

		let response = null;

		switch ( this.type ) {

			case AssetType.DIRECTORY:
				response = 'assets/folder-icon-blue.png';
				break;

			case AssetType.TEXTURE:
				response = FileUtils.pathToFileURL( this.path );
				break;

			case AssetType.MATERIAL:
				response = this.preview;
				break;

			case AssetType.MODEL:
				response = this.preview;
				break;

			case AssetType.OBJECT:
				response = this.preview;
				break;

			case AssetType.SCENE:
				response = 'assets/scene-icon.png';
				break;

			case AssetType.OPENDRIVE:
				response = 'assets/unknown-file-icon.png';
				break;

			case AssetType.OPENSCENARIO:
				response = 'assets/unknown-file-icon.png';
				break;

			case AssetType.ROAD_STYLE:
				response = this.preview;
				break;

			default:
				response = null;
				break;

		}

		if ( response === null ) {
			return 'assets/unknown-file-icon.png';
		}

		return response;

	}

	get path (): string {

		return this._path;

	}

	set path ( value: string ) {

		this._path = value;

		if ( this.metadata ) {
			this.metadata.path = value;
		}

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

	get directoryPath (): string {

		return FileUtils.getDirectoryFromPath( this.path );

	}

	getTypeAsString (): string {

		return Asset.getTypeAsString( this.type );

	}

	static getTypeAsString ( type: AssetType ): string {

		switch ( type ) {

			case AssetType.DIRECTORY:
				return 'directory';

			case AssetType.FILE:
				return 'file';

			case AssetType.TEXTURE:
				return 'texture';

			case AssetType.MATERIAL:
				return 'material';

			case AssetType.MODEL:
				return 'model';

			case AssetType.SCENE:
				return 'scene';

			case AssetType.ROAD_STYLE:
				return 'roadstyle';

			case AssetType.ROAD_SIGN:
				return 'roadsign';

			case AssetType.ENTITY:
				return 'entity';

			case AssetType.OPENDRIVE:
				return 'opendrive';

			case AssetType.OPENSCENARIO:
				return 'openscenario';

			case AssetType.PREFAB:
				return 'prefab';

			case AssetType.OBJECT:
				return 'object';

			case AssetType.GEOMETRY:
				return 'geometry';

			case AssetType.ROAD_MARKING:
				return 'road_marking';

		}

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

			case MetaImporter.OBJECT:
				return AssetType.OBJECT;
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

			case AssetType.OBJECT:
				return FileExtension.OBJECT;

		}

	}

}
