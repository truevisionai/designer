/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../tv-lane";

export class TvObjectRepeat {

	private attr_s: number;
	private attr_length: number;
	private attr_distance: number;
	private attr_tStart: number;
	private attr_tEnd: number;
	private attr_widthStart: number;
	private attr_widthEnd: number;
	private attr_heightStart: number;
	private attr_heightEnd: number;
	private attr_zOffsetStart: number;
	private attr_zOffsetEnd: number;
	private attr_lengthStart: number;
	private attr_lengthEnd: number;

	public targetLane: TvLane;

	/**
	 *
	 * @param s s-coordinate of start position, overrides the corresponding argument in the original <object> record
	 * @param length Length of the repeat area, along the reference line in s-direction.
	 * @param distance Distance between two instances of the object; If this value is zero, then the object is treated like a continuous feature, for example, a guard rail, a wall, etc.
	 * @param tStart Lateral offset of objects reference point at @s
	 * @param tEnd Lateral offset of object’s reference point at @s + @length
	 * @param widthStart
	 * @param widthEnd
	 * @param heightStart
	 * @param heightEnd
	 * @param zOffsetStart
	 * @param zOffsetEnd
	 */
	constructor (
		s: number,
		length: number,
		distance: number,
		tStart?: number,
		tEnd?: number,
		widthStart?: number,
		widthEnd?: number,
		heightStart?: number,
		heightEnd?: number,
		zOffsetStart?: number,
		zOffsetEnd?: number
	) {
		this.attr_s = s;
		this.attr_length = length;
		this.attr_distance = distance;
		this.attr_tStart = tStart;
		this.attr_tEnd = tEnd;
		this.attr_widthStart = widthStart;
		this.attr_widthEnd = widthEnd;
		this.attr_heightStart = heightStart;
		this.attr_heightEnd = heightEnd;
		this.attr_zOffsetStart = zOffsetStart;
		this.attr_zOffsetEnd = zOffsetEnd;
	}

	get s (): number {
		return this.attr_s;
	}

	set s ( value: number ) {
		this.attr_s = value;
	}

	get length (): number {
		return this.attr_length;
	}

	set length ( value: number ) {
		this.attr_length = value;
	}

	get distance (): number {
		return this.attr_distance;
	}

	set distance ( value: number ) {
		this.attr_distance = value;
	}

	get tStart (): number {
		return this.attr_tStart;
	}

	set tStart ( value: number ) {
		this.attr_tStart = value;
	}

	get tEnd (): number {
		return this.attr_tEnd;
	}

	set tEnd ( value: number ) {
		this.attr_tEnd = value;
	}

	get widthStart (): number {
		return this.attr_widthStart;
	}

	set widthStart ( value: number ) {
		this.attr_widthStart = value;
	}

	get widthEnd (): number {
		return this.attr_widthEnd;
	}

	set widthEnd ( value: number ) {
		this.attr_widthEnd = value;
	}

	get heightStart (): number {
		return this.attr_heightStart;
	}

	set heightStart ( value: number ) {
		this.attr_heightStart = value;
	}

	get heightEnd (): number {
		return this.attr_heightEnd;
	}

	set heightEnd ( value: number ) {
		this.attr_heightEnd = value;
	}

	get zOffsetStart (): number {
		return this.attr_zOffsetStart;
	}

	set zOffsetStart ( value: number ) {
		this.attr_zOffsetStart = value;
	}

	get zOffsetEnd (): number {
		return this.attr_zOffsetEnd;
	}

	set zOffsetEnd ( value: number ) {
		this.attr_zOffsetEnd = value;
	}

	get lengthStart (): number {
		return this.attr_lengthStart;
	}

	set lengthStart ( value: number ) {
		this.attr_lengthStart = value;
	}

	get lengthEnd (): number {
		return this.attr_lengthEnd;
	}

	set lengthEnd ( value: number ) {
		this.attr_lengthEnd = value;
	}

	clone (): TvObjectRepeat {

		return new TvObjectRepeat(
			this.s,
			this.length,
			this.distance,
			this.tStart,
			this.tEnd,
			this.widthStart,
			this.widthEnd,
			this.heightStart,
			this.heightEnd,
			this.zOffsetStart,
			this.zOffsetEnd
		);
	}

}
