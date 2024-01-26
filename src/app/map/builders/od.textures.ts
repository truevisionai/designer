/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import * as THREE from 'three';
import { SRGBColorSpace, Texture } from 'three';
import { TvLaneType } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';

export class OdTextures {

	static uv_grid = () => {
		const texture = new THREE.TextureLoader().load( 'assets/uv_grid_opengl.jpg' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static asphalt = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static border = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static sidewalk = () => {
		const texture = new THREE.TextureLoader().load( 'assets/sidewalk.jpg' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static stop = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static shoulder = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static biking = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static restricted = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static parking = () => {
		const texture = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};
	static terrain = () => {
		const texture = new THREE.TextureLoader().load( 'assets/grass.jpg' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};

	static arrowCircle = () => {
		const texture = new THREE.TextureLoader().load( 'assets/arrow-circle.png' );
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 16;
		return texture;
	};

	private static _arrowSharp: Texture;
	static arrowSharp = () => {
		if ( OdTextures._arrowSharp ) return OdTextures._arrowSharp;
		OdTextures._arrowSharp = new THREE.TextureLoader().load( 'assets/arrow-sharp.svg' );
		OdTextures._arrowSharp.colorSpace = SRGBColorSpace;
		OdTextures._arrowSharp.anisotropy = 16;
		return OdTextures._arrowSharp;
	};

	// misc
	static point = new THREE.TextureLoader().load( 'assets/point.png' );
	static arrow = new THREE.TextureLoader().load( 'assets/arrow.svg' );

	static getLaneTexture ( lane: TvLane ): Texture {

		let texture: Texture;

		switch ( lane.type ) {

			case TvLaneType.none:
				texture = this.asphalt();
				break;

			case TvLaneType.driving:
				texture = this.asphalt();
				break;

			case TvLaneType.stop:
				texture = this.stop();
				break;

			case TvLaneType.shoulder:
				texture = this.shoulder();
				break;

			case TvLaneType.biking:
				texture = this.biking();
				break;

			case TvLaneType.sidewalk:
				texture = this.sidewalk();
				break;

			case TvLaneType.border:
				texture = this.border();
				break;

			case TvLaneType.restricted:
				texture = this.restricted();
				break;

			case TvLaneType.parking:
				texture = this.parking();
				break;

			case TvLaneType.curb:
				texture = this.terrain();
				break;

			default:
				texture = this.terrain();
				break;
		}

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.mapping = THREE.UVMapping;
		texture.repeat.set( 1, 1 );
		texture.anisotropy = 16;
		texture.colorSpace = SRGBColorSpace; // for new version of three.js

		return texture;
	}
}
