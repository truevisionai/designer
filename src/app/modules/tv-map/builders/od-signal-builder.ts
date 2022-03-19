/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from '../../../core/game-object';
import { BoxGeometry, CylinderBufferGeometry, CylinderGeometry, FrontSide, MeshBasicMaterial, TextureLoader, Vector3 } from 'three';
import { TvObjectType } from '../interfaces/i-tv-object';
import { TvDynamicTypes, TvOrientation, TvUnit } from '../models/tv-common';
import { TvMapSourceFile } from '../services/tv-map-source-file';
import { TvRoadSignal } from '../models/tv-road-signal.model';
import { TvRoad } from '../models/tv-road.model';
import { COLOR } from '../../../shared/utils/colors.service';
import { Maths } from '../../../utils/maths';
import { SignShapeType } from '../services/tv-sign.service';
import { SnackBar } from '../../../services/snack-bar.service';

export class OdSignalBuilder {

    constructor () {
    }

    createSignalGameObject ( road: TvRoad, signal: TvRoadSignal, shape?: SignShapeType ) {

        const position = road.getPositionAt( signal.s, signal.t );

        this.createPole( position.toVector3(), signal, road, shape );

    }

    createSignal (
        assetName: string,
        signShape: SignShapeType,
        roadId: number,
        s: number,
        t: number,
        name: string = '',
        dynamic: TvDynamicTypes = TvDynamicTypes.NO,
        orientation: TvOrientation = TvOrientation.MINUS,
        zOffset: number = 0,
        country: string = 'OpenDrive',
        type: string = '-1',
        subtype: string = '-1',
        value: number = null,
        unit: TvUnit = null,
        height: number = 4,
        width: number = null,
        text: string = null,
        hOffset: number = null,
        pitch: number = null,
        roll: number = null
    ): TvRoadSignal {

        const road = TvMapSourceFile.openDrive.getRoadById( roadId );

        const id = road.getRoadSignalCount() + 1;

        const signal = road.addRoadSignal(
            s, t, id, name, dynamic, orientation, zOffset,
            country, type, subtype,
            value, unit,
            height, width, text,
            hOffset, pitch, roll
        );

        signal.addUserData( 'asset_name', assetName );
        signal.addUserData( 'sign_shape', signShape as string );

        return signal;
    }


    createPole ( position: Vector3, signal: TvRoadSignal, road: TvRoad, shape?: SignShapeType ) {

        const assetName = signal.assetName ? signal.assetName.attr_value : 'default';

        // if shape is supplied
        // else check for shape in signal data
        const signShape = shape ? shape : signal.signShape ? signal.signShape : 'default';

        const poleWidth = 0.05;
        const poleHeight = signal.height;

        const geometry = new CylinderBufferGeometry( poleWidth, poleWidth, poleHeight, 32 );
        const material = new MeshBasicMaterial( { color: COLOR.DARKGRAY } );
        const pole = new GameObject( 'Signal', geometry, material );

        let sign: GameObject;

        switch ( signShape ) {

            case SignShapeType.circle:
                sign = this.createSphericalSignal( assetName, signal );
                break;

            case SignShapeType.square:
                sign = this.createSquareSignal( assetName, signal );
                break;

            case SignShapeType.diamond:
                sign = this.createSquareSignal( assetName, signal );
                break;

            case SignShapeType.triangle:
                sign = this.createSquareSignal( assetName, signal );
                break;

            case SignShapeType.triangle_inverted:
                sign = this.createSquareSignal( assetName, signal );
                break;

            case SignShapeType.square_tilted:
                sign = this.createTiltedSquareSignal( assetName, signal );
                break;

            case SignShapeType.rectangle:
                sign = this.createRectangleSignal( assetName, signal );
                break;
            case 'default':
                break;

            default:
                SnackBar.show( 'Sign shape type not specified' );
                console.error( 'Sign shape type not specified' );
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

    createRectangleSignal ( sign: string, signal: TvRoadSignal ): GameObject {

        const geometry = new BoxGeometry( 1, 1.5, 0.05 );

        const signMaterial = this.getSignMaterial( sign );

        return this.createObject( geometry, signMaterial, signal );

    }

    createSquareSignal ( sign: string, signal: TvRoadSignal ): GameObject {

        const geometry = new BoxGeometry( 1, 1, 0.05 );

        const signMaterial = this.getSignMaterial( sign );

        const gameObject = this.createObject( geometry, signMaterial, signal );

        return gameObject;
    }

    createTiltedSquareSignal ( sign: string, signal: TvRoadSignal ): GameObject {

        const geometry = new CylinderGeometry( 0.5, 0.5, 0.05, 4, 1 );

        const signMaterial = this.getSignMaterial( sign );

        const gameObject = this.createObject( geometry, signMaterial, signal );

        gameObject.rotateX( 90 * Maths.Deg2Rad );
        gameObject.rotateY( 90 * Maths.Deg2Rad );

        return gameObject;
    }

    createSphericalSignal ( sign: string, signal: TvRoadSignal ): GameObject {

        const geometry = new CylinderGeometry( 0.5, 0.5, 0.05, 32, 1 );

        const signMaterial = this.getSignMaterial( sign );

        const gameObject = this.createObject( geometry, signMaterial, signal );

        gameObject.rotateX( 90 * Maths.Deg2Rad );
        gameObject.rotateY( 90 * Maths.Deg2Rad );

        return gameObject;
    }

    private createObject ( geometry, signMaterial, signal: TvRoadSignal ) {

        const gameObject = new GameObject( 'Signal', geometry, signMaterial );

        gameObject.Tag = TvObjectType[ TvObjectType.SIGNAL ];

        gameObject.OpenDriveType = TvObjectType.SIGNAL;

        gameObject.userData.data = signal;

        return gameObject;
    }

    private getBlankMaterial () {
        const blankTexture = new TextureLoader().load( `assets/textures/blank.png` );
        const blankMaterial = new MeshBasicMaterial( { map: blankTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
    }

    private getMetalMaterial () {
        const metalTexture = new TextureLoader().load( `assets/signs/metal.png` );
        const metalMaterial = new MeshBasicMaterial( { map: metalTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
    }

    private getBackMaterial () {
        const signBackTexture = new TextureLoader().load( `assets/signs/back_circle.png` );
        const signBackMaterial = new MeshBasicMaterial( { map: signBackTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
        return signBackMaterial;
    }

    private getSignMaterial ( sign: string ) {
        const signTexture = new TextureLoader().load( `assets/signs/${sign}.png` );
        const signMaterial = new MeshBasicMaterial( { map: signTexture, transparent: true, alphaTest: 0.1, side: FrontSide } );
        return signMaterial;
    }

    // createPlaneSignal ( sign: string, signal: OdRoadSignal ): GameObject {
    //
    //     const geometry = new PlaneBufferGeometry( 1, 1, 1 );
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
