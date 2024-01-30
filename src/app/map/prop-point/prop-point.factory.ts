/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractFactory } from "../../core/interfaces/abstract-factory";
import { PropInstance } from "./prop-instance.object";
import { AssetNode, AssetType } from "../../views/editor/project-browser/file-node.model";
import { Object3D, Vector3 } from "three";
import { AssetDatabase } from "../../core/asset/asset-database";

export class PropPointFactory extends AbstractFactory<PropInstance> {

	createFromAsset ( asset: AssetNode, position: Vector3 ): PropInstance {

		if ( asset.type != AssetType.MODEL ) return;

		const clone = AssetDatabase.getInstance<Object3D>( asset.guid )?.clone();

		if ( !clone ) return;

		clone.position.copy( position );

		return new PropInstance( asset.guid, clone );

	}

	createFromPosition ( position: Vector3 ): PropInstance {

		const prop = this.assetManager.getProp();

		if ( !prop ) return;

		const clone = AssetDatabase.getInstance<Object3D>( prop.guid )?.clone();

		if ( !clone ) return;

		clone.position.copy( position );

		return new PropInstance( prop.guid, clone );

	}

}