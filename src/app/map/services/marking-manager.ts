/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/objects/game-object';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import * as THREE from 'three';
import { Mesh, PlaneGeometry, Shape, Texture } from 'three';

export enum MarkingTypes {
	point = 'point',
	curve = 'curve',
}

export class TvRoadMarking {

	public static extension = 'roadmarking';

	public static tag = 'roadmarking';

	public mesh: Mesh;

	constructor ( public name: string, public type: MarkingTypes, public textureGuid: string ) {

		this.mesh = this.makeMesh( new Shape() );

	}

	static new (): TvRoadMarking {

		return new TvRoadMarking( 'NewRoadMarking', MarkingTypes.point, null );

	}

	static importFromString ( contents: string ): TvRoadMarking {

		const json = JSON.parse( contents );

		return new TvRoadMarking( json.name, json.type, json.textureGuid );

	}

	makeMesh ( shape: Shape ): Mesh {

		const geometry = new PlaneGeometry();

		let texture: Texture;

		if ( this.textureGuid ) {
			texture = AssetDatabase.getInstance<Texture>( this.textureGuid );
		} else {
			texture = ThreeJsUtils.createPinkTexture( 256, 256 );
		}

		// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		// texture.repeat.set( 0.008, 0.008 );
		// texture.anisotropy = 16;
		// texture.encoding = THREE.sRGBEncoding;>

		const material = new THREE.MeshLambertMaterial( { map: texture, transparent: true, alphaTest: 0.1 } );

		const mesh = new GameObject( this.name, geometry, material );

		mesh.position.set( 0, 0, 0.01 );

		mesh.Tag = TvRoadMarking.tag;

		mesh.userData.roadmarking = this;

		return mesh;
	}


	toJSONString (): any {

		return JSON.stringify( {
			name: this.name,
			type: this.type,
			textureGuid: this.textureGuid,
		}, null, 2 );
	}

	clone () {

		return new TvRoadMarking( this.name, this.type, this.textureGuid );

	}

}


export class TvRoadMarkingManager {

	public static markingChanged = new EventEmitter<TvRoadMarking>();

	private static selectedMarking: TvRoadMarking;

	static get currentMarking () {

		return this.selectedMarking;

	}

	static set currentMarking ( value ) {

		this.selectedMarking = value;

		this.markingChanged.emit( value );

	}
}
