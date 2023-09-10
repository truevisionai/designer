/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from 'three';
import { IHasUpdate } from '../commands/set-value-command';
import { BaseControlPoint } from './control-point';
import { SerializedField } from 'app/core/components/serialization';

export class DynamicControlPoint<T extends IHasUpdate> extends BaseControlPoint {

	public mainObject: T;

	constructor ( mainObject: T, position?: Vector3 ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const dotMaterial = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

		super( dotGeometry, dotMaterial );

		this.mainObject = mainObject;

		if ( position ) this.copyPosition( position );

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

	copyPosition ( position: Vector3 ): void {

		super.copyPosition( position );

	}

	update () {

		this.mainObject?.update();

	}
}
