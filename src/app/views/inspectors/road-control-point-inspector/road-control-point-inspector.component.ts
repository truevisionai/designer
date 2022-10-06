/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';

@Component( {
    selector: 'app-road-control-point-inspector',
    templateUrl: './road-control-point-inspector.component.html',
    styleUrls: [ './road-control-point-inspector.component.css' ]
} )
export class RoadControlPointInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

    @Input() data: RoadControlPoint;

    constructor () {
        super();
    }

    get controlPoint (): RoadControlPoint {
        return this.data;
    }

    get road (): TvRoad {
        return this.data.road;
    }

    ngOnInit (): void {

        if ( this.data ) this.data.select();

        if ( this.road && this.road.spline ) this.road.spline.show();

    }

    ngOnDestroy (): void {

        if ( this.data ) this.data.unselect();

        if ( this.road && this.road.spline ) this.road.spline.hide();

    }

}
