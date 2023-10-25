/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { CallFunctionCommand } from 'app/commands/call-function-command';
import { IComponent } from 'app/core/game-object';
import { UpdatePositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { Vector3 } from 'three';
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
export class PropCurveInspectorComponent implements IComponent {

	data: PropCurveInspectorData;

	get propCurve (): PropCurve {

		return this.data.propCurve;

	}

	onControlPointChanged ( $newPosition: Vector3 ) {

		CommandHistory.execute(
			new UpdatePositionCommand(
				this.data.controlPoint as DynamicControlPoint<PropCurve>,
				$newPosition,
				this.data.controlPoint.position
			)
		);

	}

	onSpacingChanged ( $event: any ) {

		CommandHistory.executeMany(
			new SetValueCommand( this.propCurve, 'spacing', parseFloat( $event ) ),

			new CallFunctionCommand( this.propCurve, this.propCurve.updateProps, [], this.propCurve.updateProps, [] )
		);
	}

	onRotationChanged ( $event: any ) {

		CommandHistory.executeMany(
			new SetValueCommand( this.propCurve, 'rotation', parseFloat( $event ) ),

			new CallFunctionCommand( this.propCurve, this.propCurve.updateProps, [], this.propCurve.updateProps, [] )
		);
	}

	onPositionVarianceChanged ( $event: any ) {

		CommandHistory.executeMany(
			new SetValueCommand( this.propCurve, 'positionVariance', parseFloat( $event ) ),

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
