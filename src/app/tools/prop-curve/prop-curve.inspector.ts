/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { SerializedAction, SerializedField } from 'app/core/components/serialization';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { CommandHistory } from 'app/commands/command-history';

export class PropCurveInspector {

	constructor (
		public curve: PropCurve,
		public point?: AbstractControlPoint
	) {
	}

	@SerializedField( { 'type': 'float', label: 'Position Variance' } )
	get positionVariance () {
		return this.curve.positionVariance;
	}

	set positionVariance ( value ) {
		this.curve.positionVariance = value;
	}

	@SerializedField( { 'type': 'float', label: 'Spacing' } )
	get spacing () {
		return this.curve.spacing;
	}

	set spacing ( value ) {
		this.curve.spacing = value;
	}

	@SerializedField( { 'type': 'float', label: 'Rotation' } )
	get rotation () {
		return this.curve.rotation;
	}

	set rotation ( value ) {
		this.curve.rotation = value;
	}

	@SerializedField( { 'type': 'boolean', label: 'Reverse' } )
	get reverse () {
		return this.curve.reverse;
	}

	set reverse ( value ) {
		this.curve.reverse = value;
	}

	@SerializedAction( { label: 'Delete Curve' } )
	delete () {
		CommandHistory.execute( new RemoveObjectCommand( this.curve ) );
	}

}
