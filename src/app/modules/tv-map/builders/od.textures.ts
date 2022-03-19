/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../models/tv-lane';
import { TvLaneType } from '../models/tv-common';
import * as THREE from 'three';
import { Texture } from 'three';

export class OdTextures {

    static uv_grid = new THREE.TextureLoader().load( 'assets/uv_grid_opengl.jpg' );
    static asphalt = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static border = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static sidewalk = new THREE.TextureLoader().load( 'assets/sidewalk.jpg' );
    static stop = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static shoulder = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static biking = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static restricted = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static parking = new THREE.TextureLoader().load( 'assets/flat-asphalt.png' );
    static terrain = new THREE.TextureLoader().load( 'assets/grass.jpg' );

    // misc
    static point = new THREE.TextureLoader().load( 'assets/point.png' );
    static arrow = new THREE.TextureLoader().load( 'assets/arrow.svg' );

    static getLaneTexture ( lane: TvLane ): Texture {

        let texture: Texture;

        switch ( lane.type ) {

            case TvLaneType.none:
                texture = this.asphalt;
                break;

            case TvLaneType.driving:
                texture = this.asphalt;
                break;

            case TvLaneType.stop:
                texture = this.stop;
                break;

            case TvLaneType.shoulder:
                texture = this.shoulder;
                break;

            case TvLaneType.biking:
                texture = this.biking;
                break;

            case TvLaneType.sidewalk:
                texture = this.sidewalk;
                break;

            case TvLaneType.border:
                texture = this.border;
                break;

            case TvLaneType.restricted:
                texture = this.restricted;
                break;

            case TvLaneType.parking:
                texture = this.parking;
                break;

            default:
                texture = this.terrain;
                break;
        }

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.mapping = THREE.UVMapping;
        texture.repeat.set( 1, 1 );
        texture.anisotropy = 5;

        return texture;
    }
}
