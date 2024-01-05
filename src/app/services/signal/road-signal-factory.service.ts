import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { CircleGeometry, CylinderGeometry, FrontSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, TextureLoader, Vector3 } from 'three';
import { ApiService } from '../api.service';
import { TvOrientation } from 'app/modules/tv-map/models/tv-common';
import { TextObjectService } from 'app/tools/marking-point/text-object.service';

const signDB = [
	{
		type: '1000001',
		subtype: '-1',
		country: 'OpenDRIVE',
		url: 'https://d37iyw84027v1q.cloudfront.net/na/bradyid/BradyID_Medium/75205.jpg'
	},
	{
		type: '1000002',
		subtype: '-1',
		country: 'OpenDRIVE',
		url: 'http://www.vzkat.de/2017/Teil03/209.gif'
	}
]

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalBuilder {

	constructor (
		private api: ApiService,
		private textService: TextObjectService,
	) { }

	buildSignal ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		if ( signal.type === 'roadMark' ) {

			return this.buildRoadMark( road, signal );

		}

		const poleWidth = 0.05;

		const poleHeight = signal.height || 3.5;

		const position = road.getPosThetaAt( signal.s, signal.t );

		const object = new Object3D();

		const pole = this.createPole( poleHeight, poleWidth );

		object.add( pole );

		const sign = this.buildSign( signal );

		sign.position.set( 0, 0, poleHeight );

		object.add( sign );

		object.position.copy( position.toVector3() );

		return object;

	}

	buildRoadMark ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		if ( signal.subtype === 'text' ) {

			return this.buildTextRoadMark( road, signal );

		}

	}

	buildTextRoadMark ( road: TvRoad, signal: TvRoadSignal ): Object3D {

		const roadCoord = road.getPosThetaAt( signal.s, signal.t );

		const textObject3d = this.textService.createFromText( signal.text, signal.value );

		textObject3d.position.copy( roadCoord.position );

		textObject3d.position.z += signal.zOffset;

		textObject3d.rotation.x = signal.pitch;

		textObject3d.rotation.y = signal.roll;

		let hdg: number;

		if ( signal.orientations === TvOrientation.PLUS ) {

			hdg = signal.hOffset + roadCoord.hdg - Maths.M_PI_2;

		} else if ( signal.orientations === TvOrientation.MINUS ) {

			hdg = signal.hOffset + roadCoord.hdg + Maths.M_PI_2;

		} else {

			hdg = roadCoord.hdg;

		}

		textObject3d.rotation.z = hdg;

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

	buildSign ( signal: TvRoadSignal ): Object3D {

		const geometry = this.getSignGeometry( signal );

		const material = this.getSignMaterial( signal );

		const mesh = new Mesh( geometry, material );

		return mesh;
	}

	getSignGeometry ( signal: TvRoadSignal ) {

		const geometry = this.createSquare();

		geometry.rotateX( 90 * Maths.Deg2Rad );

		return geometry;
	}

	private createPole ( poleHeight: number, poleWidth: number ): Object3D {

		const geometry = new CylinderGeometry( poleWidth, poleWidth, poleHeight, 32 );
		const material = new MeshBasicMaterial( { color: COLOR.DARKGRAY } );

		const pole = new Mesh( geometry, material );

		pole.rotateX( 90 * Maths.Deg2Rad );

		pole.position.setZ( pole.position.z + ( poleHeight * 0.5 ) );

		return pole;
	}

	private createRectangle () {

		return new PlaneGeometry( 1, 1.5 );

	}

	private createSquare () {

		return new PlaneGeometry( 1, 1 );


	}

	private createTiltedSquare ( sign: string, signal: TvRoadSignal ) {

		return new CylinderGeometry( 0.5, 0.5, 0.05, 4, 1 );

	}

	private createSpherical () {

		return new CircleGeometry( 0.5 );

	}

	private getSignMaterial ( signal: TvRoadSignal ) {

		const sign = signDB.find( sign => sign.type === signal.type && sign.subtype === signal.subtype );

		if ( !sign ) {

			const texture = new TextureLoader().load( `assets/signs/default.png` );

			return new MeshBasicMaterial( { map: texture, transparent: true, alphaTest: 0.1, side: FrontSide } );

		} else {

			const texture = new TextureLoader().load( sign.url );

			return new MeshBasicMaterial( { map: texture, transparent: true, alphaTest: 0.1, side: FrontSide } );

		}

	}

}
