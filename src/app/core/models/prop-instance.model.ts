/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IHasCopyUpdate } from 'app/modules/three-js/commands/copy-position-command';
import { Object3D, Vector3 } from 'three';
import { Action, SerializedField } from '../components/serialization';
import { EventEmitter } from '@angular/core';
import { GameObject } from '../game-object';
import { AssetDatabase } from '../asset/asset-database';
import { CommandHistory } from 'app/services/command-history';
import { RemovePropCommand } from '../../tools/prop-point/remove-prop-point-command';

export class PropInstance extends Object3D implements IHasCopyUpdate {

	public updated = new EventEmitter<PropInstance>();

	constructor ( public guid: string, public object: Object3D ) {

		super();

		this.add( object );

	}


	@Action()
	delete () {

		CommandHistory.execute( new RemovePropCommand( this ) );

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

		this.updated.emit( this );

	}

	@SerializedField( { type: 'vector3' } )
	get Position (): Vector3 {

		return this.object?.position.clone();

	}

	set Position ( value: Vector3 ) {

		this.setPosition( value );

		this.updated.emit( this );

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
