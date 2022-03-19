/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropService } from 'app/services/prop-service';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';

export class PropPolygonInspectorData {

    constructor (
        public controlPoint: AnyControlPoint,
        public polygon: PropPolygon
    ) {
    }
}

@Component( {
    selector: 'app-prop-polygon-inspector',
    templateUrl: './prop-polygon-inspector.component.html'
} )
export class PropPolygonInspectorComponent implements OnInit, IComponent, OnDestroy {

    data: PropPolygonInspectorData;

    constructor () { }

    ngOnInit (): void { }

    ngOnDestroy (): void { }

    onDensityChanged ( $event: string ) {

        this.data.polygon.density = parseFloat( $event );

        PropService.updateCurvePolygonProps( this.data.polygon );

    }
}
