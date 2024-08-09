/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { TvRoad } from "../../map/models/tv-road.model";
import { TvSuperElevation } from "../../map/models/tv-lateral.profile";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { Maths } from "../../utils/maths";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { Commands } from "app/commands/commands";

const ANGLE_DESCRIPTION = 'Angle of super elevation (radians). Positive values for roads falling to the right side & negative values for roads falling to the left side.';

export class SuperElevationInspector {

	constructor (
		public node: SimpleControlPoint<TvSuperElevation>
	) {
	}

	get road (): TvRoad {
		return this.node.userData.road;
	}

	get elevation (): TvSuperElevation {
		return this.node.userData.superElevation;
	}

	@SerializedField( {
		type: 'int',
		description: 'Distance from the start of the road'
	} )
	get distance (): number {
		return this.elevation.s;
	}

	set distance ( value: number ) {
		this.elevation.s = value;
	}

	@SerializedField( {
		type: 'float',
		description: ANGLE_DESCRIPTION
	} )
	get angle (): number {
		return this.elevation.a;
	}

	set angle ( value: number ) {
		this.elevation.a = value;
	}

	@SerializedAction( { label: 'Increase Angle' } )
	increase () {

		const newValue = this.elevation.a + 0.1;

		const oldValue = this.elevation.a;

		Commands.SetValue( this, 'angle', newValue, oldValue );

	}

	@SerializedAction( { label: 'Decrease Angle' } )
	decrease () {

		const newValue = this.elevation.a - 0.1;

		const oldValue = this.elevation.a;

		Commands.SetValue( this, 'angle', newValue, oldValue );

	}

	@SerializedAction()
	delete () {

		if ( Maths.approxEquals( this.distance, 0 ) ) {

			return;

		} else {

			Commands.RemoveObject( this.node );
		}

	}

}
