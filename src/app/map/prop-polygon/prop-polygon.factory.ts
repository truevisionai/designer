/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractFactory } from "../../core/interfaces/abstract-factory";
import { PropPolygon } from "./prop-polygon.model";
import { AssetNode, AssetType } from "../../views/editor/project-browser/file-node.model";
import { Vector3 } from "three";
import { PropManager } from "../../managers/prop-manager";

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonFactory extends AbstractFactory<PropPolygon> {

	createFromAsset ( asset: AssetNode, position: Vector3 ): PropPolygon {

		if ( asset.type != AssetType.MODEL ) return;

		return new PropPolygon( asset.guid );

	}

	createFromPosition ( position: Vector3 ): PropPolygon {

		const prop = PropManager.getProp();

		if ( !prop ) return;

		return new PropPolygon( prop.guid );

	}

}