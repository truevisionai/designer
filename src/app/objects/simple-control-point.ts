/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractControlPoint } from "./abstract-control-point";
import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { SerializedField } from "../core/components/serialization";

export class SimpleControlPoint<T> extends AbstractControlPoint {

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

	}

	setPosition ( position: Vector3 ): void {

		super.setPosition( position );

	}

}


