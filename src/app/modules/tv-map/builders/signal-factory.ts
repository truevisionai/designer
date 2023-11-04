/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CylinderGeometry, FrontSide, MeshBasicMaterial, PlaneGeometry, TextureLoader, Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { TvConsole } from '../../../core/utils/console';
import { COLOR } from '../../../views/shared/utils/colors.service';
import { Maths } from '../../../utils/maths';
import { TvObjectType } from '../interfaces/i-tv-object';
import { TvRoadSignal } from '../models/tv-road-signal.model';
import { TvRoad } from '../models/tv-road.model';
import { SignShapeType } from '../services/tv-sign.service';

export class SignalFactory {

	public static createSignal ( road: TvRoad, signal: TvRoadSignal, shape?: SignShapeType ) {

		const position = road.getPositionAt( signal.s, signal.t );

		SignalFactory.createPole( position.toVector3(), signal, road, shape );

	}

	private static createPole ( position: Vector3, signal: TvRoadSignal, road: TvRoad, shape?: SignShapeType ) {

		const assetName = signal.assetName ? signal.assetName.attr_value : 'default';

		// if shape is supplied
		// else check for shape in signal data
		const signShape = shape ? shape : signal.signShape ? signal.signShape : 'default';

		const poleWidth = 0.05;
		const poleHeight = signal.height;

		const geometry = new CylinderGeometry( poleWidth, poleWidth, poleHeight, 32 );
		const material = new MeshBasicMaterial( { color: COLOR.DARKGRAY } );
		const pole = new GameObject( 'Signal', geometry, material );

		let sign: GameObject;

		switch ( signShape ) {

			case SignShapeType.circle:
				sign = SignalFactory.createSphericalSignal( assetName, signal );
				break;

			case SignShapeType.square:
				sign = SignalFactory.createSquareSignal( assetName, signal );
				break;

			case SignShapeType.diamond:
				sign = SignalFactory.createSquareSignal( assetName, signal );
				break;

			case SignShapeType.triangle:
				sign = SignalFactory.createSquareSignal( assetName, signal );
				break;

			case SignShapeType.triangle_inverted:
				sign = SignalFactory.createSquareSignal( assetName, signal );
				break;

			case SignShapeType.square_tilted:
				sign = SignalFactory.createTiltedSquareSignal( assetName, signal );
				break;

			case SignShapeType.rectangle:
				sign = SignalFactory.createRectangleSignal( assetName, signal );
				break;

			case 'default':
				TvConsole.warn( 'Sign shape not specified, using default square shape for now' );
				sign = SignalFactory.createSquareSignal( assetName, signal );
				break;

			default:
				TvConsole.warn( 'Sign shape type not specified' );
				break;
		}

		if ( !sign ) return;

		pole.add( sign );

		sign.position.set( 0, poleHeight * 0.5, poleWidth );

		pole.rotateX( 90 * Maths.Deg2Rad );

		pole.position.setZ( pole.position.z + ( poleHeight * 0.5 ) );

		signal.gameObject = new GameObject( 'Signal' );
		signal.gameObject.add( pole );
		signal.gameObject.position.setX( position.x );
		signal.gameObject.position.setY( position.y );

		road.gameObject.add( signal.gameObject );
	}

	private static createRectangleSignal ( sign: string, signal: TvRoadSignal ): GameObject {

		// const geometry = new BoxGeometry( 1, 1.5, 0.05 );
		const geometry = new PlaneGeometry( 1, 1.5 );

		const signMaterial = SignalFactory.getSignMaterial( sign );

		return SignalFactory.createObject( geometry, signMaterial, signal );

	}

	private static createSquareSignal ( sign: string, signal: TvRoadSignal ): GameObject {

		// const geometry = new BoxGeometry( 1, 1, 0.05 );
		const geometry = new PlaneGeometry( 1, 1 );

		const signMaterial = SignalFactory.getSignMaterial( sign );

		return SignalFactory.createObject( geometry, signMaterial, signal );
	}

	private static createTiltedSquareSignal ( sign: string, signal: TvRoadSignal ): GameObject {

		const geometry = new CylinderGeometry( 0.5, 0.5, 0.05, 4, 1 );

		const signMaterial = SignalFactory.getSignMaterial( sign );

		const gameObject = SignalFactory.createObject( geometry, signMaterial, signal );

		gameObject.rotateX( 90 * Maths.Deg2Rad );
		gameObject.rotateY( 90 * Maths.Deg2Rad );

		return gameObject;
	}

	private static createSphericalSignal ( sign: string, signal: TvRoadSignal ): GameObject {

		const geometry = new CylinderGeometry( 0.5, 0.5, 0.05, 32, 1 );

		const signMaterial = SignalFactory.getSignMaterial( sign );

		const gameObject = SignalFactory.createObject( geometry, signMaterial, signal );

		gameObject.rotateX( 90 * Maths.Deg2Rad );
		gameObject.rotateY( 90 * Maths.Deg2Rad );

		return gameObject;
	}

	private static createObject ( geometry, signMaterial, signal: TvRoadSignal ) {

		const gameObject = new GameObject( 'Signal', geometry, signMaterial );

		gameObject.Tag = TvObjectType[ TvObjectType.SIGNAL ];

		gameObject.OpenDriveType = TvObjectType.SIGNAL;

		gameObject.userData.data = signal;

		return gameObject;
	}

	private static getBlankMaterial () {
		const blankTexture = new TextureLoader().load( `assets/textures/blank.png` );
		return new MeshBasicMaterial( { map: blankTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
	}

	private static getMetalMaterial () {
		const metalTexture = new TextureLoader().load( `assets/signs/metal.png` );
		return new MeshBasicMaterial( { map: metalTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
	}

	private static getBackMaterial () {
		const signBackTexture = new TextureLoader().load( `assets/signs/back_circle.png` );
		return new MeshBasicMaterial( { map: signBackTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
	}

	private static getSignMaterial ( sign: string ) {
		const signTexture = new TextureLoader().load( `assets/signs/${ sign }.png` );
		return new MeshBasicMaterial( { map: signTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
	}

	// createPlaneSignal ( sign: string, signal: OdRoadSignal ): GameObject {
	//
	//     const geometry = new PlaneGeometry( 1, 1, 1 );
	//
	//     let boxMaterial: MeshBasicMaterial;
	//
	//     const gameObject = new GameObject( 'Signal', geometry, boxMaterial );
	//
	//     new TextureLoader().load( `assets/signs/${sign}.png`, function ( texture ) {
	//
	//         gameObject.material = new MeshBasicMaterial( { map: texture, transparent: true, opacity: 0.9 } );
	//
	//         ( gameObject.material as Material ).needsUpdate = true;
	//
	//     } );
	//
	//     // var position = road.getPositionAt( signal.attr_s, signal.attr_t );
	//
	//     // gameObject.position.set( position.x, position.y, 0 );
	//
	//     gameObject.Tag = OpenDriveObjectType[ OpenDriveObjectType.SIGNAL ];
	//
	//     gameObject.OpenDriveType = OpenDriveObjectType.SIGNAL;
	//
	//     gameObject.userData.data = signal;
	//
	//     return gameObject;
	//
	// }


}
