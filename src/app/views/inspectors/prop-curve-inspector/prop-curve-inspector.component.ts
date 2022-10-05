/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropService } from 'app/services/prop-service';
import { PropCurve } from '../../../modules/tv-map/models/prop-curve';

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

	constructor () {
	}

	ngOnInit (): void {
	}

	ngOnDestroy (): void {
	}

	onSpacingChanged ( $event: any ) {

		this.data.propCurve.spacing = parseFloat( $event );

		PropService.updateCurveProps( this.data.propCurve );

	}

	onRotationChanged ( $event: any ) {

		this.data.propCurve.rotation = parseFloat( $event );

		PropService.updateCurveProps( this.data.propCurve );

	}

	onPositionVarianceChanged ( $event: any ) {

		this.data.propCurve.positionVariance = parseFloat( $event );

		PropService.updateCurveProps( this.data.propCurve );

	}
}
