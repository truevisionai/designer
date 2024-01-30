/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractFactory } from "../../core/interfaces/abstract-factory";
import { PropCurve } from "./prop-curve.model";
import { AssetNode, AssetType } from "../../views/editor/project-browser/file-node.model";
import { Vector3 } from "three";
import { PropManager } from "../../managers/prop-manager";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveFactory extends AbstractFactory<PropCurve> {

	createFromAsset ( asset: AssetNode, position: Vector3 ): PropCurve {

		if ( asset.type != AssetType.MODEL ) return;

		return new PropCurve( asset.guid );

	}

	createFromPosition ( position: Vector3 ): PropCurve {

		const prop = PropManager.getProp();

		if ( !prop ) return;

		return new PropCurve( prop.guid );

	}

}