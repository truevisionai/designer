/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { COLOR } from 'app/views/shared/utils/colors.service';
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
} from 'three';
import { ApiService } from '../../services/api.service';
import { TvOrientation } from 'app/map/models/tv-common';
import { TextObjectService } from 'app/services/text-object.service';
import { TvTextureService } from "../../graphics/texture/tv-texture.service";
import { AssetService } from 'app/core/asset/asset.service';
import { AssetType } from 'app/core/asset/asset.model';
import { SignalDatabase } from './road-signal.database';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalBuilder {

	constructor (
		private api: ApiService,
		private textService: TextObjectService,
		private texturService: TvTextureService,
		private assetService: AssetService,
	) {
	}

	buildSignal ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		if ( signal.type === 'roadMark' ) {

			return this.buildRoadMark( road, signal );

		}

		const position = road.getPosThetaAt( signal.s, signal.t );

		const parentObject = new Object3D();

		const sign = this.buildSignAsset( parentObject, signal );

		parentObject.add( sign );

		parentObject.position.copy( position.toVector3() );

		// parentObject.position.z += signal.zOffset;

		parentObject.rotation.x = signal.pitch;

		parentObject.rotation.y = signal.roll;

		this.applyHeading( parentObject, road, signal );

		return parentObject;

	}

	private buildSignAsset ( parentObject: Object3D, signal: TvRoadSignal ): Object3D {

		let sign: Object3D;

		if ( !signal.assetGuid ) {

			const poleWidth = 0.05;

			const zOffset = signal.zOffset || 3.5;

			sign = this.buildSignalByType( signal );

			// -poleWidth to adjust for the pole and avoid
			// the sign from being inside the pole
			sign.position.set( 0, -poleWidth, zOffset );

			this.addPole( parentObject, zOffset, poleWidth );

			return sign;
		}

		const asset = this.assetService.getAsset( signal.assetGuid );

		if ( asset && asset.type == AssetType.OBJECT ) {

			sign = this.assetService.getObjectAsset( asset.guid )?.instance.clone();

		}

		if ( asset && asset.type == AssetType.MODEL ) {

			sign = this.assetService.getModelAsset( asset.guid )?.clone();

		}

		if ( asset && ( asset.type == AssetType.TEXTURE || asset.type == AssetType.MATERIAL ) ) {

			const poleWidth = 0.05;

			const zOffset = signal.zOffset || 3.5;

			sign = this.buildSignalByType( signal );

			// -poleWidth to adjust for the pole and avoid
			// the sign from being inside the pole
			sign.position.set( 0, -poleWidth, zOffset );

			this.addPole( parentObject, zOffset, poleWidth );

		}
	}

	private buildRoadMark ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		if ( signal.subtype === 'text' ) {

			return this.buildTextRoadMark( road, signal );

		}

	}

	private buildTextRoadMark ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		const roadCoord = road.getPosThetaAt( signal.s, signal.t );

		const textObject3d = this.textService.createFromText( signal.text, signal.value );

		textObject3d.position.copy( roadCoord.position );

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

	private buildSignalByType ( signal: TvRoadSignal ): Object3D {

		const geometry = this.getSignGeometry( signal );

		const material = this.getSignMaterial( signal );

		const mesh = new Mesh( geometry, material );

		return mesh;
	}

	private getSignGeometry ( signal: TvRoadSignal ) {

		const width = signal.width || 0.5;

		const height = signal.height || 0.5;

		const geometry = this.createSquare( width, height );

		geometry.rotateX( 90 * Maths.Deg2Rad );

		return geometry;
	}

	private createPole ( poleHeight: number, poleWidth: number ): Object3D {

		const geometry = new CylinderGeometry( poleWidth, poleWidth, poleHeight, 32 );
		const material = new MeshBasicMaterial( { color: COLOR.LIGHTGRAY } );

		const pole = new Mesh( geometry, material );

		pole.rotateX( 90 * Maths.Deg2Rad );

		pole.position.setZ( pole.position.z + ( poleHeight * 0.5 ) );

		return pole;
	}

	private createRectangle () {

		return new PlaneGeometry( 1, 1.5 );

	}

	private createSquare ( width: number = 1, height: number = 1 ) {

		return new PlaneGeometry( width, height );

	}

	private createTiltedSquare ( sign: string, signal: TvRoadSignal ) {

		return new CylinderGeometry( 0.5, 0.5, 0.05, 4, 1 );

	}

	private createSpherical () {

		return new CircleGeometry( 0.5 );

	}

	private getSignMaterial ( signal: TvRoadSignal ) {

		const sign = SignalDatabase.findBySignal( signal );

		if ( sign ) {

			const texture = new TextureLoader().load( sign.url );

			return new MeshBasicMaterial( { map: texture, transparent: true, alphaTest: 0.1, side: FrontSide } );

		}

		if ( !signal.assetGuid ) {

			return new MeshBasicMaterial( { color: COLOR.MAGENTA } );

		}

		const asset = this.assetService.getAsset( signal.assetGuid );

		if ( !asset ) {
			console.error( `Asset not found for guid: ${ signal.assetGuid }` );
			return new MeshBasicMaterial( { color: COLOR.MAGENTA } );
		}

		if ( asset.type === AssetType.TEXTURE ) {

			const texture = this.texturService.getTexture( signal.assetGuid )?.texture;

			if ( !texture ) {
				console.error( `Texture not found for guid: ${ signal.assetGuid }` );
				return new MeshBasicMaterial( { color: COLOR.MAGENTA } );
			}

			return new MeshBasicMaterial( { map: texture, transparent: true, alphaTest: 0.1, side: FrontSide } );
		}

		if ( asset.type === AssetType.MATERIAL ) {

			const material = this.assetService.getMaterialAsset( signal.assetGuid )?.material;

			if ( !material ) {
				console.error( `Material not found for guid: ${ signal.assetGuid }` );
				return new MeshBasicMaterial( { color: COLOR.MAGENTA } );
			}

			return material;

		}

		return new MeshBasicMaterial( { color: COLOR.MAGENTA } );
	}

	private applyHeading ( object: Object3D, road: TvRoad, signal: TvRoadSignal ) {

		const roadCoord = road.getPosThetaAt( signal.s, signal.t );

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

	private addPole ( object: Object3D, poleHeight: number, poleWidth: number ) {

		const pole = this.createPole( poleHeight, poleWidth );

		object.add( pole );

	}
}
