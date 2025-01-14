/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Asset } from "app/assets/asset.model";
import { Vector3 } from "app/core/maths"
import { AssetManager } from "../../assets/asset.manager";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { AssetService } from "../../assets/asset.service";

export abstract class AbstractFactory<T> {

	abstract createFromPosition ( position: Vector3 ): T;

	abstract createFromAsset ( asset: Asset, position: Vector3 ): T;

	protected assetManager: AssetManager;

	protected assetService: AssetService;

	createControlPoint ( object: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint<T>( object, position );

	}

	setAssetManager ( manager: AssetManager ): void {

		this.assetManager = manager;

	}

	setAssetService ( assetService: AssetService ): void {

		this.assetService = assetService;

	}

}
