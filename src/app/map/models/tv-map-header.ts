/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2, Vector3 } from "three";

export class TvMapHeader {

	/**
	 * The <offset> element should be such that the x and y coordinates of
	 * ASAM OpenDRIVE are approximately centered around (0;0).
	 * If the x and y coordinates are too large, applications using
	 * float coordinates internally might not be able to process them
	 * accurately enough due to the limited precision of IEEE 754
	 * double precision floating point numbers.
	 */
	public positionOffset: Vector3;
	public headingOffset: number;
	/**
	 * The <worldOrigin> element is used to define the origin of the world
	 * coordinate system in the map coordinate system.
	 * The x and y coordinates are latitude and longitude in degrees.
	 */
	public origin: Vector2;

	public geoReference: string;

	constructor (
		public revMajor: number = 1,
		public revMinor: number = 4,
		public name: string = "Untitled",
		public version: number = 1,
		public date: string = new Date().toISOString(),
		public north: number = 0,
		public south: number = 0,
		public east: number = 0,
		public west: number = 0,
		public vendor: string = "Truevision.ai"
	) {
		this.positionOffset = new Vector3( 0, 0, 0 );
		this.headingOffset = 0;
		this.origin = new Vector2( 0, 0 );
	}

	clone () {

		const header = new TvMapHeader();

		header.revMajor = this.revMajor;
		header.revMinor = this.revMinor;
		header.name = this.name;
		header.version = this.version;
		header.date = this.date;
		header.north = this.north;
		header.south = this.south;
		header.east = this.east;
		header.west = this.west;
		header.vendor = this.vendor;
		header.positionOffset = this.positionOffset.clone();
		header.headingOffset = this.headingOffset;
		header.origin = this.origin.clone();
		header.geoReference = this.geoReference;

		return header;
	}

	reset () {

		this.north = 0;
		this.south = 0;
		this.east = 0;
		this.west = 0;
		this.positionOffset.set( 0, 0, 0 );
		this.headingOffset = 0;
		this.origin.set( 0, 0 );
		this.geoReference = null;

		return this;

	}

}
