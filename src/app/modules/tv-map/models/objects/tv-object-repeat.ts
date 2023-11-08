export class TvObjectRepeat {

	public attr_s: number;
	public attr_length: number;
	public attr_distance: number;
	public attr_tStart: number;
	public attr_tEnd: number;
	public attr_widthStart: number;
	public attr_widthEnd: number;
	public attr_heightStart: number;
	public attr_heightEnd: number;
	public attr_zOffsetStart: number;
	public attr_zOffsetEnd: number;

	constructor ( s: number, length: number, distance: number, tStart: number, tEnd: number,
		widthStart: number, widthEnd: number, heightStart: number, heightEnd: number,
		zOffsetStart: number, zOffsetEnd: number ) {

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
}
