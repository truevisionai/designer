/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractFactory } from "../../core/interfaces/abstract-factory";
import { PropInstance } from "./prop-instance.object";
import { Asset, AssetType } from "../../assets/asset.model";
import { Object3D, Vector3 } from "three";

export class PropPointFactory extends AbstractFactory<PropInstance> {

	createFromAsset ( asset: Asset, position: Vector3 ): PropInstance {

		const model = this.getModel( asset );

		if ( !model ) return;

		const clone = model.clone();

		if ( !clone ) return;

		clone.position.copy( position );

		return new PropInstance( asset.guid, clone );

	}

	createFromPosition ( position: Vector3 ): PropInstance {

		const prop = this.assetManager.getProp();

		if ( !prop ) return;

		const asset = this.assetService.getAsset( prop.guid );

		const clone = this.getModel( asset )?.clone();

		if ( !clone ) return;

		clone.position.copy( position );

		return new PropInstance( prop.guid, clone );

	}

	private getModel ( asset: Asset ): Object3D {

		if ( asset.type == AssetType.MODEL ) {

			return this.assetService.getModelAsset( asset.guid );

		}

		if ( asset.type == AssetType.OBJECT ) {

			return this.assetService.getObjectAsset( asset.guid )?.instance;

		}

	}

}
