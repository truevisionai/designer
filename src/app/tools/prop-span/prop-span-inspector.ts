/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { TvObjectRepeat } from "../../map/models/objects/tv-object-repeat";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { Commands } from "app/commands/commands";

export class PropSpanInspector {

	constructor (
		public roadObject: TvRoadObject,
		public repeat: TvObjectRepeat
	) {
	}

	@SerializedField( { 'type': 'float', label: 'Object Width' } )
	get objectWidth () {
		return this.roadObject.width;
	}

	set objectWidth ( value ) {
		this.roadObject.width = value;
	}

	// @SerializedField( { 'type': 'float', label: 'Object Height' } )
	// get objectHeight () {
	// 	return this.roadObject.height;
	// }

	// set objectHeight ( value ) {
	// 	this.roadObject.height = value;
	// }

	// @SerializedField( { 'type': 'float', label: 'Object Length' } )
	// get objectLength () {
	// 	return this.roadObject.length;
	// }

	// set objectLength ( value ) {
	// 	this.roadObject.length = value;
	// }

	@SerializedField( { 'type': 'float', label: 'Start Position' } )
	get s () {
		return this.roadObject.s;
	}

	set s ( value ) {
		this.roadObject.s = value;
		this.repeat.sStart = value;
		this.updateLength();
	}

	@SerializedField( { 'type': 'float', label: 'Gap' } )
	get gap () {
		return this.repeat.gap;
	}

	set gap ( value ) {
		this.repeat.gap = value;
	}

	@SerializedField( { 'type': 'float', label: 'Segment Length' } )
	get length () {
		return this.repeat.segmentLength;
	}

	set length ( value ) {
		this.repeat.segmentLength = value;
	}

	@SerializedField( { 'type': 'float', label: 'Lateral Offset Start' } )
	get t () {
		return this.roadObject.t;
	}

	set t ( value ) {
		this.roadObject.t = value;
		this.repeat.tStart = value;
	}

	@SerializedField( { 'type': 'float', label: 'Lateral Offset End' } )
	get tEnd () {
		return this.repeat.tEnd || this.roadObject.t;
	}

	set tEnd ( value ) {
		this.repeat.tEnd = value;
	}

	@SerializedField( { 'type': 'float' } )
	get zOffsetStart () {
		return this.repeat.zOffsetStart || this.roadObject.zOffset;
	}

	set zOffsetStart ( value ) {
		this.repeat.zOffsetStart = value;
	}

	@SerializedField( { 'type': 'float' } )
	get zOffsetEnd () {
		return this.repeat.zOffsetEnd || this.roadObject.zOffset;
	}

	set zOffsetEnd ( value ) {
		this.repeat.zOffsetEnd = value;
	}

	@SerializedAction( { label: 'Delete' } )
	delete (): void {

		Commands.RemoveObject( this.roadObject );

	}

	updateLength (): void {

		if ( this.repeat.sStart + this.repeat.segmentLength > this.roadObject.road.length ) {

			this.repeat.segmentLength = this.roadObject.road.length - this.repeat.sStart;

		}

	}

}
