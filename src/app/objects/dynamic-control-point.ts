/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { IHasUpdate } from '../commands/set-value-command';
import { SerializedField } from 'app/core/components/serialization';
import { AbstractControlPoint } from "./abstract-control-point";

export class DynamicControlPoint<T extends IHasUpdate> extends AbstractControlPoint {

	public mainObject: T;

	constructor ( mainObject: T, position?: Vector3 ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		super( dotGeometry, null );

		this.material = this.getDefaultMaterial();

		this.mainObject = mainObject;

		if ( position ) this.setPosition( position );

	}

	@SerializedField( { type: 'object' } )
	get object (): T {

		return this.mainObject;

	}

	set object ( value: T ) {

		// this.mainObject = value;
		// this.update();

	}

	@SerializedField( { type: 'vector3' } )
	get Position (): Vector3 {

		return this.position.clone();

	}

	set Position ( value: Vector3 ) {

		this.position.copy( value );
		this.update();

	}

	setPosition ( position: Vector3 ): void {

		super.setPosition( position );

	}

	update () {

		this.mainObject?.update();

	}
}

