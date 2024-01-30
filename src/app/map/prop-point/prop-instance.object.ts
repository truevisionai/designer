/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D, Vector3 } from 'three';
import { Action, SerializedField } from '../../core/components/serialization';
import { AssetDatabase } from '../../core/asset/asset-database';
import { CommandHistory } from 'app/services/command-history';
import { RemoveObjectCommand } from "../../commands/remove-object-command";
import { UnselectObjectCommand } from "../../commands/unselect-object-command";
import { IHasCopyUpdate } from "../../commands/copy-position-command";

export class PropInstance extends Object3D implements IHasCopyUpdate {

	constructor ( public guid: string, public object: Object3D ) {

		super();

		this.add( object );

	}

	@Action()
	delete () {

		CommandHistory.executeMany( new UnselectObjectCommand( this ), new RemoveObjectCommand( this ) );

	}

	@SerializedField( { type: 'gameobject' } )
	get Model (): string {

		return this.guid;

	}

	set Model ( value: string ) {

		this.guid = value;

		if ( value ) {

			this.remove( this.object );

			const position = this.getPosition();

			this.object = AssetDatabase.getInstance<Object3D>( value ).clone();

			this.object.position.copy( position );

			this.add( this.object );

		}

	}

	@SerializedField( { type: 'vector3' } )
	get Position (): Vector3 {

		return this.object?.position.clone();

	}

	set Position ( value: Vector3 ) {

		this.setPosition( value );

	}

	@SerializedField( { type: 'vector3' } )
	get Scale (): Vector3 {

		return this.object?.scale;

	}

	set Scale ( value: Vector3 ) {

		this.object?.scale.copy( value );

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
