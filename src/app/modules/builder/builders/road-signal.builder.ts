/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { ColorUtils } from 'app/views/shared/utils/colors.service';
import {
	CircleGeometry,
	CylinderGeometry,
	FrontSide,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PlaneGeometry,
	TextureLoader,
	Vector3
} from "three";
import { ApiService } from '../../../services/api.service';
import { TvOrientation } from 'app/map/models/tv-common';
import { TextObjectService } from 'app/services/text-object.service';
import { AssetService } from 'app/assets/asset.service';
import { AssetType } from 'app/assets/asset.model';
import { SignalDatabase } from '../../../map/road-signal/road-signal.database';
import { RoadService } from 'app/services/road/road.service';
import { TvTextureService } from "../../../assets/texture/tv-texture.service";
import { MeshBuilder } from 'app/core/builders/mesh.builder';

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

		// parentObject.position.z += signal.zOffset;

		parentObject.rotation.x = signal.pitch;

		parentObject.rotation.y = signal.roll;

		this.applyHeading( parentObject, road, signal );

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

		const position = this.roadService.STtoXYZ( road, signal.s, signal.t );

		const textObject3d = this.textService.createFromText( signal.text, signal.value );

		textObject3d.position.copy( position );

		textObject3d.position.z += signal.zOffset;

		textObject3d.rotation.x = signal.pitch;

		textObject3d.rotation.y = signal.roll;

		this.applyHeading( textObject3d, road, signal );

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

	private buildSignBoardMesh ( signal: TvRoadSignal ): Mesh {

		const geometry = this.buildSignGeometry( signal );

		const material = this.getSignMaterial( signal );

		return new Mesh( geometry, material );

	}

	private buildSignGeometry ( signal: TvRoadSignal ): PlaneGeometry {

		const width = signal.width || 0.5;

		const height = signal.height || 0.5;

		const geometry = this.createSquare( width, height );

		geometry.rotateX( 90 * Maths.Deg2Rad );

		return geometry;
	}

	private createPole ( poleHeight: number, poleRadius: number ): Object3D {

		const geometry = new CylinderGeometry( poleRadius, poleRadius, poleHeight, 32 );
		const material = new MeshBasicMaterial( { color: ColorUtils.LIGHTGRAY } );

		const pole = new Mesh( geometry, material );

		pole.rotateX( 90 * Maths.Deg2Rad );

		pole.position.setZ( pole.position.z + ( poleHeight * 0.5 ) );

		return pole;
	}

	private createRectangle (): PlaneGeometry {

		return new PlaneGeometry( 1, 1.5 );

	}

	private createSquare ( width: number = 1, height: number = 1 ): PlaneGeometry {

		return new PlaneGeometry( width, height );

	}

	private createTiltedSquare ( sign: string, signal: TvRoadSignal ): CylinderGeometry {

		return new CylinderGeometry( 0.5, 0.5, 0.05, 4, 1 );

	}

	private createSpherical (): CircleGeometry {

		return new CircleGeometry( 0.5 );

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

	private applyHeading ( object: Object3D, road: TvRoad, signal: TvRoadSignal ): void {

		const roadCoord = road.getRoadPosition( signal.s, signal.t );

		let hdg: number;

		if ( signal.orientation === TvOrientation.PLUS ) {

			hdg = signal.hOffset + roadCoord.hdg - Maths.PI2;

		} else if ( signal.orientation === TvOrientation.MINUS ) {

			hdg = signal.hOffset + roadCoord.hdg + Maths.PI2;

		} else {

			hdg = roadCoord.hdg;

		}

		object.rotation.z = hdg;

	}

	private addPole ( object: Object3D, poleHeight: number, poleRadius: number ): void {

		const pole = this.createPole( poleHeight, poleRadius );

		object.add( pole );

	}
}
