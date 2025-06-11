/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvColors, TvRoadMarkWeights, TvSide } from './tv-common';
import { TvCornerRoad } from "./objects/tv-corner-road";
import { MeshBasicMaterial } from "three";

export class TvObjectMarking {

	private _material: THREE.MeshBasicMaterial;
	private _materialGuid: string;

	/**
	 * Specifies a marking that is either attached to one side of the
	 * object’s bounding box or referencing outline points.
	 *
	 * @param _color color of the marking
	 * @param spaceLength Length of the gap between the visible parts
	 * @param lineLength length of a line segment between two spaces
	 * @param side Side of the bounding box described in <object> element in the local coordinate system u/v
	 * @param weight optical "weight" of the marking
	 * @param startOffset Lateral offset in u-direction from start of bounding box side where the first marking starts
	 * @param stopOffset Lateral offset in u-direction from end of bounding box side where the marking ends
	 * @param zOffset Height of road mark above the road, i.e. thickness of the road mark
	 * @param width width of the marking (attribute is optional if detailed definition is given below)
	 * @param cornerReferences
	 */
	constructor (
		private _color: TvColors = TvColors.WHITE,
		private _spaceLength: number = 0.3,
		private _lineLength: number = 0.3,
		private _side: TvSide = TvSide.NONE,
		private _weight: TvRoadMarkWeights = TvRoadMarkWeights.STANDARD,
		private _startOffset: number = 0,
		private _stopOffset: number = 0,
		private _zOffset: number = 0.005,
		private _width: number = 1.83,
		public cornerReferences: number[] = [] // 2 or more corners,
	) {
		this._material = new MeshBasicMaterial( { color: _color } );
	}

	get width (): number {
		return this._width;
	}

	set width ( value: number ) {
		this._width = value;
	}

	get zOffset (): number {
		return this._zOffset;
	}

	set zOffset ( value: number ) {
		this._zOffset = value;
	}

	get stopOffset (): number {
		return this._stopOffset;
	}

	set stopOffset ( value: number ) {
		this._stopOffset = value;
	}

	get startOffset (): number {
		return this._startOffset;
	}

	set startOffset ( value: number ) {
		this._startOffset = value;
	}

	get weight (): TvRoadMarkWeights {
		return this._weight;
	}

	set weight ( value: TvRoadMarkWeights ) {
		this._weight = value;
	}

	get side (): TvSide {
		return this._side;
	}

	set side ( value: TvSide ) {
		this._side = value;
	}

	get lineLength (): number {
		return this._lineLength;
	}

	set lineLength ( value: number ) {
		this._lineLength = value;
	}

	get spaceLength (): number {
		return this._spaceLength;
	}

	set spaceLength ( value: number ) {
		this._spaceLength = value;
	}

	get color (): TvColors {
		return this._color;
	}

	set color ( value: TvColors ) {
		this._color = value;
	}

	get material (): THREE.MeshBasicMaterial {
		return this._material;
	}

	set material ( value: THREE.MeshBasicMaterial ) {
		this._material = value;
	}

	get materialGuid (): string {
		return this._materialGuid;
	}

	set materialGuid ( value: string ) {
		this._materialGuid = value;
	}

	addCornerRoad ( corner: TvCornerRoad ): void {
		this.cornerReferences.push( corner.attr_id );
	}

	removeCornerRoad ( tvCornerRoad: TvCornerRoad ): void {

		const index = this.cornerReferences.indexOf( tvCornerRoad.attr_id );

		if ( index > -1 ) {
			this.cornerReferences.splice( index, 1 );
		}

	}

	clone (): any {

		const clone = new TvObjectMarking(
			this._color,
			this._spaceLength,
			this._lineLength,
			this._side,
			this._weight,
			this._startOffset,
			this._stopOffset,
			this._zOffset,
			this._width,
			this.cornerReferences.map( i => i )
		);

		clone.materialGuid = this.materialGuid;

		return clone;

	}

	toXODR (): Record<string, any> {
		return {
			attr_color: this.color,
			attr_spaceLength: this.spaceLength,
			attr_lineLength: this.lineLength,
			attr_side: this.side,
			attr_weight: this.weight,
			attr_startOffset: this.startOffset,
			attr_stopOffset: this.stopOffset,
			attr_zOffset: this.zOffset,
			attr_width: this.width,
			cornerReference: this.cornerReferences.map( reference => {
				return {
					attr_id: reference
				};
			} ),
		};
	}

}


