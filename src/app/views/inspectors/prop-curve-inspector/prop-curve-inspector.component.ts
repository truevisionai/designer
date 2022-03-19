/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropCurve } from "../../../modules/tv-map/models/prop-curve";
import { PropService } from 'app/services/prop-service';

export class PropCurveInspectorData {

    constructor (
        public controlPoint: AnyControlPoint,
        public propCurve: PropCurve
    ) {
    }
}

@Component( {
    selector: 'app-prop-curve-inspector',
    templateUrl: './prop-curve-inspector.component.html'
} )
export class PropCurveInspectorComponent implements OnInit, IComponent, OnDestroy {

    data: PropCurveInspectorData;

    constructor () { }

    ngOnInit (): void { }

    ngOnDestroy (): void { }

    onSpacingChanged ( $event: string ) {

        this.data.propCurve.spacing = parseFloat( $event );

        PropService.updateCurveProps( this.data.propCurve );

    }

    onRotationChanged ( $event: string ) {

        this.data.propCurve.rotation = parseFloat( $event );

        PropService.updateCurveProps( this.data.propCurve );

    }

    onPositionVarianceChanged ( $event: string ) {

        this.data.propCurve.positionVariance = parseFloat( $event );

        PropService.updateCurveProps( this.data.propCurve );

    }
}
