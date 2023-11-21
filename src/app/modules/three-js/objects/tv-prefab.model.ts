/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Object3D } from 'three';
import { TvMesh } from './TvMesh';

export class TvPrefab extends Object3D {

	constructor ( public guid: string = MathUtils.generateUUID(), public name: string = 'Prefab' ) {
		super();
		this.name = name;
	}

	static parseString ( value: string ) {

		return this.parseJSON( JSON.parse( value ).object );

	}

	static parseJSON ( json: any ): TvPrefab {

		const prefab = new TvPrefab( json?.guid, json?.name );

		json.children?.forEach( ( child: any ) => {
			prefab.add( this.parseObject( child ) );
		} );

		return prefab;
	}

	static parseObject ( json: any ): TvPrefab {

		if ( json.type === 'Mesh' ) {
			return TvMesh.parseObject( json );
		}

		if ( json.type === 'Group' ) {
			return this.parseJSON( json );
		}

		if ( json.type === 'Object3D' ) {
			return this.parseJSON( json );
		}

		return new TvPrefab( json?.guid, json?.name );
	}

	toJSON ( meta?: any ): any {

		const output = super.toJSON( meta );

		if ( this.guid ) {
			output.object.guid = this.guid;
		}

		return {
			metadata: output.metadata,
			object: output.object
		};
	}
}


