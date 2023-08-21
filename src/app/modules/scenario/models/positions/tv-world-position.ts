/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from 'app/core/components/serialization';
import { Vector3 } from 'three';
import { Maths } from '../../../../utils/maths';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class WorldPosition extends Position {

	public readonly label: string = 'World Position';
	public readonly type = PositionType.World;
	public readonly isDependent: boolean = false;

	constructor ( vector3: Vector3, orientation?: Orientation ) {

		super( vector3 || new Vector3(), orientation || new Orientation() );

	}

	@SerializedField( { type: 'vector3' } )
	get position (): Vector3 {
		return this.vector0;
	}

	set position ( value: Vector3 ) {
		this.vector0 = value;
		this.updated.emit();
	}

	@SerializedField( { type: 'vector3' } )
	get rotation (): Vector3 {
		return this.orientation.toVector3();
	}

	set rotation ( value: Vector3 ) {
		this.orientation.copyFromVector3( value );
		this.updated.emit();
	}

	getVectorPosition (): Vector3 {

		return this.vector0;

	}

	toXML ( version: OpenScenarioVersion ) {

		const key = version == OpenScenarioVersion.v0_9 ?
			'World' :
			'WorldPosition';

		return {
			[ key ]: {
				attr_x: this.vector0?.x ?? 0,
				attr_y: this.vector0?.y ?? 0,
				attr_z: this.vector0?.z ?? 0,
				attr_h: this.orientation?.h + Maths.M_PI_2 ?? 0,
				attr_p: this.orientation?.p ?? 0,
				attr_r: this.orientation?.r ?? 0,
			}
		};
	}

	updateFromWorldPosition ( position: Vector3, orientation?: Orientation ): void {

		this.vector0.copy( position );

		this.orientation.copy( orientation )

		this.updated.emit();

	}

}
