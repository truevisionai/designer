/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractFactory } from "../../core/interfaces/abstract-factory";
import { PropCurve } from "./prop-curve.model";
import { Asset, AssetType } from "../../core/asset/asset.model";
import { Vector3 } from "three";
import { PropManager } from "../../managers/prop-manager";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveFactory extends AbstractFactory<PropCurve> {

	createFromAsset ( asset: Asset, position: Vector3 ): PropCurve {

		if ( asset.type != AssetType.MODEL ) return;

		return new PropCurve( asset.guid );

	}

	createFromPosition ( position: Vector3 ): PropCurve {

		const prop = PropManager.getProp();

		if ( !prop ) return;

		return new PropCurve( prop.guid );

	}

}