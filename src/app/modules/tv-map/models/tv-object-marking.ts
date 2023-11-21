/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { MarkingObjectFactory } from 'app/factories/marking-object.factory';
import * as THREE from 'three';
import { CatmullRomCurve3, Mesh, Vector3 } from 'three';
import { COLOR } from '../../../views/shared/utils/colors.service';
import { TvColors, TvRoadMarkWeights, TvSide } from './tv-common';
import { TvRoadObject } from './objects/tv-road-object';
import { TvCornerRoad } from "./objects/tv-corner-road";

export class TvObjectMarking {

	roadObject: TvRoadObject;
	node: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;

	private _material: THREE.MeshBasicMaterial;
	private _materialGuid: string;

	/**
	 * Specifies a marking that is either attached to one side of the
	 * object’s bounding box or referencing outline points.
	 *
	 * @param _color color of the marking
	 * @param side Side of the bounding box described in <object> element in the local coordinate system u/v
	 * @param weight optical "weight" of the marking
	 * @param spaceLength Length of the gap between the visible parts
	 * @param lineLength length of a line segment between two spaces
	 * @param startOffset Lateral offset in u-direction from start of bounding box side where the first marking starts
	 * @param stopOffset Lateral offset in u-direction from end of bounding box side where the marking ends
	 * @param zOffset Height of road mark above the road, i.e. thickness of the road mark
	 * @param width width of the marking (attribute is optional if detailed definition is given below)
	 * @param cornerReferences
	 */
	constructor (
		private _color: TvColors = TvColors.WHITE,
		public spaceLength: number = 0.3,
		public lineLength: number = 0.3,
		public side: TvSide = TvSide.FRONT,
		public weight: TvRoadMarkWeights = TvRoadMarkWeights.STANDARD,
		public startOffset: number = 0,
		public stopOffset: number = 0,
		public zOffset: number = 0.005,
		public width: number = 1.83,
		public cornerReferences: number[] = [] // 2 or more corners,
	) {
		this._material = new THREE.MeshBasicMaterial( { color: _color } );
	}

	get material (): THREE.MeshBasicMaterial {
		return this._material;
	}

	set material ( value: THREE.MeshBasicMaterial ) {
		this._material = value;
	}

	get color (): TvColors {
		return this._color;
	}

	set color ( value: TvColors ) {
		this._color = value;
		this._material?.color.set( COLOR.stringToColor( value ) );
		this._material.needsUpdate = true;
	}

	get materialGuid (): string {
		return this._materialGuid;
	}

	set materialGuid ( value: string ) {
		this._materialGuid = value;
		this._material = AssetDatabase.getInstance( value );
		this._material.needsUpdate = true;
		this.update();
	}

	addCornerRoad ( corner: TvCornerRoad ) {

		this.cornerReferences.push( corner.attr_id );

	}

	removeCornerRoad ( tvCornerRoad: TvCornerRoad ) {

		const index = this.cornerReferences.indexOf( tvCornerRoad.attr_id );

		if ( index > -1 ) {
			this.cornerReferences.splice( index, 1 );
		}

	}

	update (): void {

		if ( !this.roadObject ) return;

		// this.roadObject.remove( this.node );

		// this.node = MarkingObjectFactory.createMarkingMesh( this.roadObject, this );

		// this.roadObject.add( this.node );

	}

}


