/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Metadata } from 'app/assets/metadata.model';
import { FileUtils } from '../io/file-utils';
import { Object3D } from 'three';
import { TvConsole } from '../core/utils/console';
import { TextureAsset } from './texture/tv-texture.model';
import { MaterialAsset } from './material/tv-material.asset';
import { TvObjectAsset } from './object/tv-object.asset';
import { AssetRepositoryService, IAssetRepository } from './asset-repository.service';

@Injectable( {
	providedIn: 'root'
} )
export class AssetDatabase {

	private static repository: IAssetRepository;

	constructor ( repository: AssetRepositoryService ) {
		AssetDatabase.repository = repository;
	}

	static setMetadata ( guid: string, metadata: Metadata ): void {
		AssetDatabase.repository.setMetadata( guid, metadata );
	}

	static getMetadata ( guid: string ): Metadata | undefined {
		return AssetDatabase.repository.getMetadata( guid );
	}

	static getAssetNameByGuid ( guid: string ): string {
		const metadata = this.getMetadata( guid );
		if ( metadata ) {
			return FileUtils.getFilenameFromPath( metadata.path );
		} else {
			return 'Unknown';
		}
	}

	static removeMetadata ( guid: string ): boolean {
		AssetDatabase.repository.removeMetadata( guid );
		return true;
	}

	static setInstance ( guid: string, instance: any ): void {
		AssetDatabase.repository.setInstance( guid, instance );
	}

	static getInstance<T> ( guid: string ): T {
		if ( guid != null && AssetDatabase.repository.has( guid ) ) {
			return AssetDatabase.repository.getInstance<T>( guid ) as T;
		} else {
			TvConsole.warn( `Undefined asset ${ guid }` );
		}
	}

	static getTexture ( guid: string ): TextureAsset {
		return this.getInstance<TextureAsset>( guid );
	}

	static getMaterial ( guid: string ): MaterialAsset {
		return this.getInstance<MaterialAsset>( guid );
	}

	static removeInstance ( guid: string ): void {
		AssetDatabase.repository.removeInstance( guid );
	}

	static remove ( guid: string ): void {
		try {
			AssetDatabase.repository.removeMetadata( guid );
			AssetDatabase.repository.removeInstance( guid );
		} catch ( error ) {
			console.error( error );
		}
	}

	static has ( uuid: string ): boolean {
		return AssetDatabase.repository.has( uuid );
	}

	static getPropObject ( guid: string ): Object3D {
		const prop = this.getInstance<Object3D>( guid );
		if ( prop == null ) return;
		if ( prop instanceof TvObjectAsset ) {
			return prop.instance;
		}
		return prop;
	}
}
