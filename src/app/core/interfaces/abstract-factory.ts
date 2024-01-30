/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SimpleControlPoint } from "app/objects/dynamic-control-point";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";
import { Vector3 } from "three";
import { AssetManager } from "../asset/asset.manager";

export abstract class AbstractFactory<T> {

	abstract createFromPosition ( position: Vector3 ): T;

	abstract createFromAsset ( asset: AssetNode, position: Vector3 ): T;

	protected assetManager: AssetManager;

	createControlPoint ( object: T, position: Vector3 ) {

		return new SimpleControlPoint<T>( object, position );

	}

	setAssetManager ( manager: AssetManager ) {

		this.assetManager = manager;

	}

}
