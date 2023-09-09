/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IHasCopyUpdate } from 'app/modules/three-js/commands/copy-position-command';
import { Object3D, Vector3 } from 'three';

export class PropInstance extends Object3D implements IHasCopyUpdate {

	constructor ( public guid: string, public object: Object3D ) {

		super();

		this.add( object );

	}

	setPosition ( position: Vector3 ): void {

		this.object?.position.copy( position );

	}

	copyPosition ( position: Vector3 ): void {

		this.object?.position.copy( position );

	}

	getPosition (): Vector3 {

		return this.object?.position;

	}

	update () {

		this.object?.updateMatrixWorld( true );

	}

	clone ( recursive?: boolean ): any {

		return new PropInstance( this.guid, this.object.clone() )

	}

}
