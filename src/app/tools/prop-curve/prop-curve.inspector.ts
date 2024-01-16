import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { Action, SerializedField } from 'app/core/components/serialization';

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

	@Action( { label: 'Delete' } )
	delete () {
		// CommandHistory.execute( new RemoveObjectCommand(  ) );
	}

}
