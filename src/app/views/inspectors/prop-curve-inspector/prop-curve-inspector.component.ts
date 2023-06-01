/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropManager } from 'app/services/prop-manager';
import { PropCurve } from '../../../modules/tv-map/models/prop-curve';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CallFunctionCommand } from 'app/core/commands/call-function-command';

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
export class PropCurveInspectorComponent implements IComponent {

	data: PropCurveInspectorData;

	get propCurve (): PropCurve {

		return this.data.propCurve;

	}

	onSpacingChanged ( $event: any ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.propCurve, 'spacing', parseFloat( $event )),

			new CallFunctionCommand( this.propCurve, this.propCurve.updateProps, [], this.propCurve.updateProps, [] )

		);
	}

	onRotationChanged ( $event: any ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.propCurve, 'rotation', parseFloat( $event )),

			new CallFunctionCommand( this.propCurve, this.propCurve.updateProps, [], this.propCurve.updateProps, [] )

		);
	}

	onPositionVarianceChanged ( $event: any ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.propCurve, 'positionVariance', parseFloat( $event )),

			new CallFunctionCommand( this.propCurve, this.propCurve.updateProps, [], this.propCurve.updateProps, [] )

		);

	}

	onBakeClicked () {

		this.data.propCurve.bake();

		this.data.propCurve.delete();

		const index = TvMapInstance.map.propCurves.indexOf( this.data.propCurve );

		TvMapInstance.map.propCurves.splice( index, 1 );

	}
}
