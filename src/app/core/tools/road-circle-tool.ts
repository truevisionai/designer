/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { Vector3 } from 'three';
import { PointerEventData, MouseButton } from 'app/events/pointer-event-data';
import { RoadFactory } from '../factories/road-factory.service';

export class RoadCircleTool extends BaseTool {

    public name: string = 'RoadCircleTool';

    private pointerDown: boolean = false;
    private pointerDownAt: Vector3;
    private pointerLastAt: Vector3;
    private currentRadius: number;

    constructor () {

        super();

    }

    init () {


    }

    enable () {

    }

    disable () {

    }

    onPointerDown ( e: PointerEventData ) {

        if ( e.button != MouseButton.LEFT ) return;

        console.log( "down" )

        this.pointerDown = true;
        this.pointerDownAt = e.point;

    }

    onPointerUp ( e: PointerEventData ) {

        if ( e.button != MouseButton.LEFT ) return;

        console.log( "up" )

        console.log( "final radius", this.currentRadius );

        this.createCircularRoad( this.pointerDownAt, this.pointerLastAt, this.currentRadius );

        this.pointerDown = false;
        this.pointerDownAt = null;
    }

    onPointerMoved ( e: PointerEventData ) {

        if ( e.button != MouseButton.LEFT ) return;

        console.log( "moved" );

        if ( !this.pointerDown ) return;
        if ( !this.pointerDownAt ) return;

        this.pointerLastAt = e.point;

        this.currentRadius = this.pointerDownAt.distanceTo( this.pointerLastAt );

        console.log( "radius", this.currentRadius );
    }

    createCircularRoad ( centre: Vector3, end: Vector3, radius: number ) {

        // console.log( centre, end, radius );

    }

}