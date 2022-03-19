/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropModel } from 'app/core/models/prop-model.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { Object3D } from 'three';

export class PropCurve {

    public reverse: boolean = false;

    public spacing: number = 5.0;

    public rotation: number = 0.0;

    public positionVariance: number = 0.0;

    public props: Object3D[] = [];

    constructor ( public propGuid: string, public spline?: CatmullRomSpline, public headings: number[] = [] ) {

        if ( !this.spline ) {

            this.spline = new CatmullRomSpline( false, 'catmullrom', 0.001 );

            this.spline.init();

        }

    }

    update () {

        this.spline.update();

    }

    addControlPoint ( cp: AnyControlPoint ) {

        ( this.spline as CatmullRomSpline ).add( cp );

        this.update();
    }
}
