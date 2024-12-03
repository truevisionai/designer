/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Metadata } from 'app/assets/metadata.model';
import { FileUtils } from '../io/file-utils';
import { Object3D } from "three";
import { TvConsole } from "../core/utils/console";
import { TextureAsset } from "./texture/tv-texture.model";
import { MaterialAsset } from "./material/tv-material.asset";
import { TvObjectAsset } from "./object/tv-object.asset";

export class AssetDatabase {

	private static metadata: Map<string, Metadata> = new Map<string, Metadata>();

	private static instances: Map<string, any> = new Map<string, any>();

	static setMetadata ( guid: string, metadata: Metadata ): void {

		this.metadata.set( guid, metadata );

	}

	static getMetadata ( guid: string ): Metadata {

		return this.metadata.get( guid );

	}

	static getAssetNameByGuid ( guid: string ): string {

		if ( !guid ) return;

		const metadata = this.getMetadata( guid );

		if ( metadata ) {
			return FileUtils.getFilenameFromPath( metadata.path );
		}
	}

	static removeMetadata ( guid: string ) {

		return this.metadata.delete( guid );

	}

	static setInstance ( guid: string, instance: any ): void {

		this.instances.set( guid, instance );

	}

	static getInstance<T> ( guid: string ): T {

		if ( guid != null && this.instances.has( guid ) ) {

			return this.instances.get( guid );

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

		this.instances.delete( guid );

	}

	static remove ( guid: string ): void {

		try {

			this.metadata.delete( guid );

			this.instances.delete( guid );

		} catch ( error ) {

			console.error( error );

		}

	}

	static has ( uuid: string ) {

		return this.instances.has( uuid );

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
