/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Asset } from "app/assets/asset.model";
import { Vector3 } from "three";

export interface AssetDropHandler {

	isAssetSupported ( asset: Asset ): boolean;

	handle ( asset: Asset, position: Vector3 ): void;

}

export class AssetDropHelper {

	private handlers: AssetDropHandler[] = [];

	constructor () {

		this.handlers = [];

	}

	addHandler ( handler: AssetDropHandler ): void {

		this.handlers.push( handler );

	}

	getHandler ( asset: Asset ): AssetDropHandler | null {

		for ( const handler of this.handlers ) {

			if ( handler.isAssetSupported( asset ) ) {

				return handler;

			}

		}

		return null;

	}

	isAssetSupported ( asset: Asset ): boolean {

		for ( const handler of this.handlers ) {

			if ( handler.isAssetSupported( asset ) ) {

				return true;

			}
		}

		return false;
	}

	importAsset ( asset: Asset, position: Vector3 ): void {

		this.getHandler( asset )?.handle( asset, position );

	}
}
