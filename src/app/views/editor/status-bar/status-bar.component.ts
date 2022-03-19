/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MonoBehaviour } from 'app/core/components/mono-behaviour';
import { PointerEventData } from 'app/events/pointer-event-data';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { TvMapSourceFile } from '../../../modules/tv-map/services/tv-map-source-file';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { TvPosTheta } from '../../../modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../../modules/tv-map/queries/tv-map-queries';
import { Time } from '../../../core/time';

@Component( {
    selector: 'app-status-bar',
    templateUrl: './status-bar.component.html',
    styleUrls: [ './status-bar.component.css' ]
} )
export class StatusBarComponent extends MonoBehaviour implements OnInit {

    private sphere: THREE.Mesh;

    private cursor: PointerEventData;
    private road: TvRoad;

    private pos = new TvPosTheta;

    constructor () {

        super();

        const geom = new THREE.SphereGeometry( 1 );
        // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // obj.gameObject = new THREE.Mesh( geometry, material );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

        this.sphere = new THREE.Mesh( geom, material );

    }

    get seconds () {
        return Time.seconds;
    }

    get time () {
        return Time.time * 0.001;
    }

    get x () {
        return this.cursor.point.x;
    }

    get y () {
        return this.cursor.point.y;
    }

    get z () {
        return this.cursor.point.z;
    }

    get openDrive () {
        return TvMapSourceFile.openDrive;
    }

    get s () {
        return this.pos.s;
    }

    get t () {
        return this.pos.t;
    }

    get name () {

        if ( this.cursor && this.cursor.object ) {

            return this.cursor.object.name;

        }

        return null;
    }

    get roadId () {

        if ( this.road ) return this.road.id;

        // if ( this.cursor && this.cursor.object && this.cursor.object.userData.data ) {
        //
        //     // return this.cursor.object.userData.data.attr_id;
        //     return this.cursor.object.userData.data.roadId;
        //
        // }

        return null;
    }

    get laneId () {

        if ( this.cursor && this.cursor.object && this.cursor.object.userData.data ) {

            return this.cursor.object.userData.data.attr_id;

        }

        return null;
    }

    ngOnInit () {

        this.cursor = new PointerEventData();
        this.cursor.point = new Vector3();


    }

    fetchRoadCoordinates ( point: Vector3 ) {

        this.openDrive.roads.forEach( road => {

            // road.getGeometryCoords()

            road.geometries.forEach( geometry => {

                const nearest = geometry.getNearestPointFrom( point.x, point.y );

                // Debug.log( nearest );

                this.sphere.position.set( nearest.x, nearest.y, 0 );

            } );

        } );

    }

    distanceFromRoad ( road, point ) {


    }

    onPointerClicked ( data: PointerEventData ) {

        // AppService.engine.add( this.sphere );

        const road = TvMapQueries.getRoadByCoords( data.point.x, data.point.y, this.pos );

    }

    onPointerMoved ( data: PointerEventData ) {

        this.cursor = data;

        // this.sphere.position.copy( data.point );

        this.road = TvMapQueries.getRoadByCoords( data.point.x, data.point.y, this.pos );

        // this.fetchRoadCoordinates( data.point );

    }

}
