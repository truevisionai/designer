/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { Object3D } from 'three';

export class TvRoadLaneOffset extends ThirdOrderPolynom {

    public mesh?: Object3D;

    clone ( s?: number ) {

        return new TvRoadLaneOffset( s || this.s, this.a, this.b, this.c, this.d );

    }

}