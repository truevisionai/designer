import { SceneService } from 'app/services/scene.service';
import { Object3D } from 'three';


export class Object3DMap<K, T extends Object3D> {

	private map: Map<K, T>;

	constructor () {

		this.map = new Map();

	}

	add ( key: K, value: T ) {

		if ( this.map.has( key ) ) {

			SceneService.removeFromTool( this.map.get( key ) );

		}

		this.map.set( key, value );

		SceneService.addToolObject( value );

	}

	remove ( key: K ) {

		SceneService.removeFromTool( this.map.get( key ) );

		this.map.delete( key );
	}

	get ( key: K ): T {

		return this.map.get( key );

	}

	getAll () {

		return this.map.values();

	}

	clear () {

		this.map.forEach( value => {

			SceneService.removeFromTool( value );

		} );

		this.map.clear();

	}

}

export class Object3DArrayMap<K, T extends Array<Object3D>> {

	private map: Map<K, Array<Object3D>>;

	constructor () {

		this.map = new Map();

	}

	addItems ( key: K, objects: T ) {

		objects.forEach( object => this.addItem( key, object ) );

	}

	addItem ( key: K, object: Object3D ) {

		if ( !this.map.has( key ) ) {

			this.map.set( key, [] );

		}

		this.map.get( key ).push( object );

		SceneService.addToolObject( object );

	}

	removeItem ( key: K, object: Object3D ) {

		this.map.get( key ).splice( this.map.get( key ).indexOf( object ), 1 );

		SceneService.removeFromTool( object );

	}

	removeKey ( key: K ) {

		this.map.get( key ).forEach( object => {

			SceneService.removeFromTool( object );

		} );

		this.map.delete( key );
	}


	clear () {

		this.map.forEach( objects => {

			objects.forEach( object => SceneService.removeFromTool( object ) );

		} );

		this.map.clear();

	}

}
