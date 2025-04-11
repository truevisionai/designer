/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { ColorUtils } from 'app/views/shared/utils/colors.service';
import {
	CylinderGeometry,
	FrontSide,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	TextureLoader,
	Vector3
} from "three";
import { ApiService } from '../../../services/api.service';
import { TextObjectService } from 'app/services/text-object.service';
import { AssetService } from 'app/assets/asset.service';
import { AssetType } from 'app/assets/asset.model';
import { SignalDatabase } from '../../../map/road-signal/road-signal.database';
import { RoadService } from 'app/services/road/road.service';
import { TvTextureService } from "../../../assets/texture/tv-texture.service";
import { MeshBuilder } from 'app/core/builders/mesh.builder';
import * as THREE from 'three';

const signBackMaterial = new THREE.MeshBasicMaterial( { color: 0x777777 } ); // grey metal
const signEdgeMaterial = new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } ); // dark edge
const signPoleMaterial = new MeshBasicMaterial( { color: 0x666666 } );

@Injectable()
export class RoadSignalBuilder implements MeshBuilder<TvRoadSignal> {

	constructor (
		private api: ApiService,
		private textService: TextObjectService,
		private texturService: TvTextureService,
		private assetService: AssetService,
		private roadService: RoadService,
	) {
	}

	build ( signal: TvRoadSignal, road?: TvRoad ): Object3D {

		if ( signal.type === 'roadMark' ) {

			return this.buildRoadMark( road, signal );

		}

		// clamp signal s value if it is out of bounds
		signal.s = Maths.clamp( signal.s, 0, road.length );

		const position = road.getRoadPosition( signal.s, signal.t );

		const parentObject = new Object3D();

		const sign = this.buildSignAsset( parentObject, signal );

		if ( sign ) parentObject.add( sign );

		parentObject.position.copy( position.toVector3() );

		parentObject.rotation.copy( signal.getObjectRotation() );

		return parentObject;

	}

	private buildSignAsset ( parentObject: Object3D, signal: TvRoadSignal ): Object3D {

		const asset = signal.assetGuid ? this.assetService.getAsset( signal.assetGuid ) : null;

		let sign: Object3D;

		if ( !asset || asset.isMaterial || asset.isTexture ) {

			const poleRadius = 0.02;

			const zOffset = signal.zOffset || 2.0;

			sign = this.buildSignBoardMesh( signal );

			// -poleRadius to adjust for the pole and avoid
			// the sign from being inside the pole
			sign.position.set( 0, -poleRadius, zOffset );

			this.addPole( parentObject, zOffset, poleRadius );

		} else if ( asset && asset.type == AssetType.OBJECT ) {

			sign = this.assetService.getObjectAsset( asset.guid )?.instance.clone();

		} else if ( asset && asset.type == AssetType.MODEL ) {

			sign = this.assetService.getModelAsset( asset.guid )?.clone();

		}

		return sign;
	}

	private buildRoadMark ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		if ( signal.subtype === 'text' ) {

			return this.buildTextRoadMark( road, signal );

		}

	}

	private buildTextRoadMark ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		signal.s = Maths.clamp( signal.s, 0, road.length );

		const rotation = signal.getObjectRotation();

		const position = this.roadService.STtoXYZ( road, signal.s, signal.t );

		const textObject3d = this.textService.createFromText( signal.text, signal.value );

		textObject3d.position.copy( position );

		textObject3d.position.z += signal.zOffset;

		textObject3d.rotation.copy( rotation );

		try {

			const measure = new Vector3();

			textObject3d.geometry.boundingBox.getSize( measure )

			signal.width = measure.x;

			signal.height = measure.y;

		} catch ( error ) {

			console.error( error );

		}

		return textObject3d;
	}

	private createPole ( poleHeight: number, poleRadius: number ): Object3D {

		const geometry = new CylinderGeometry( poleRadius, poleRadius, poleHeight, 32 );

		const pole = new Mesh( geometry, signPoleMaterial );

		pole.rotateX( 90 * Maths.Deg2Rad );

		pole.position.setZ( pole.position.z + ( poleHeight * 0.5 ) );

		return pole;
	}

	private buildSignBoardMesh ( signal: TvRoadSignal, shape: 'circle' | 'square' = 'circle' ): Mesh {

		const material = this.getSignMaterial( signal );

		if ( shape === 'circle' ) {

			return this.createRoundedSign( signal.width * 0.5 || 0.5, material )

		} else if ( shape === 'square' ) {

			return this.createSquareSign(
				signal.width || 0.5,
				signal.height || 0.5,
				material
			)

		}
	}

	private createSquareSign ( width: number, height: number, signFrontMaterial: THREE.Material ): THREE.Mesh {

		// Order: +X, -X, +Y, -Y, +Z, -Z
		const materials = [
			signEdgeMaterial,  // right
			signEdgeMaterial,  // left
			signEdgeMaterial,  // top
			signEdgeMaterial,  // bottom
			signFrontMaterial, // front
			signBackMaterial   // back
		];

		const geometry = new THREE.BoxGeometry( width, height, 0.01 );
		const mesh = new THREE.Mesh( geometry, materials );

		mesh.rotation.x = Math.PI / 2;

		return mesh;
	}

	private createRoundedSign ( radius: number, signFrontMaterial: THREE.Material ): THREE.Mesh {

		const materials = [
			signEdgeMaterial,  // edge
			signBackMaterial,   // back
			signFrontMaterial, // front
		];

		const geometry = new THREE.CylinderGeometry( radius, radius, 0.01 );
		const mesh = new THREE.Mesh( geometry, materials );

		mesh.rotation.y = Math.PI / 2;

		return mesh;
	}

	private getSignMaterial ( signal: TvRoadSignal ): any {

		const defaultMaterial = new MeshBasicMaterial( {
			color: ColorUtils.MAGENTA
		} );

		const asset = signal?.assetGuid ? this.assetService.getAsset( signal.assetGuid ) : null;

		if ( !asset ) {

			if ( signal.assetGuid ) console.error( `Asset not found for guid: ${ signal.assetGuid }` );

			const signInDatabase = SignalDatabase.findBySignal( signal );

			if ( signInDatabase ) {

				const texture = new TextureLoader().load( signInDatabase.url );

				return new MeshBasicMaterial( {
					map: texture,
					transparent: true,
					alphaTest: 0.1,
					side: FrontSide
				} );

			}

		} else if ( asset.type === AssetType.TEXTURE ) {

			const texture = this.texturService.getTexture( signal.assetGuid )?.texture;

			if ( !texture ) {
				console.error( `Texture not found for guid: ${ signal.assetGuid }` );
				return defaultMaterial;
			}

			return new MeshBasicMaterial( {
				map: texture,
				transparent: true,
				alphaTest: 0.1,
				side: FrontSide
			} );

		} else if ( asset.type === AssetType.MATERIAL ) {

			const material = this.assetService.getMaterialAsset( signal.assetGuid )?.material;

			if ( !material ) {
				console.error( `Material not found for guid: ${ signal.assetGuid }` );
				return defaultMaterial;
			}

			return material;
		}

		return defaultMaterial;
	}

	private addPole ( object: Object3D, poleHeight: number, poleRadius: number ): void {

		const pole = this.createPole( poleHeight, poleRadius );

		object.add( pole );

	}
}
