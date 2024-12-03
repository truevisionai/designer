/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D, Vector3 } from 'three';
import { SerializedAction, SerializedField } from '../../core/components/serialization';
import { AssetDatabase } from '../../assets/asset-database';
import { CommandHistory } from 'app/commands/command-history';
import { RemoveObjectCommand } from "../../commands/remove-object-command";
import { UnselectObjectCommand } from "../../commands/unselect-object-command";
import { IHasCopyUpdate } from 'app/core/interfaces/has-copy-update';

export class PropInstance extends Object3D implements IHasCopyUpdate {

	constructor ( public guid: string, public object: Object3D ) {

		super();

		this.add( object );

	}

	@SerializedAction()
	delete (): void {

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

	getPosition (): Vector3 {

		return this.object?.position;

	}

	update (): void {

		this.object?.updateMatrixWorld( true );

	}

	clone ( recursive?: boolean ): any {

		return new PropInstance( this.guid, this.object.clone() )

	}

}
