import 'reflect-metadata';

// our decorators
export function Serializable () {
	return function ( target: any, propertyKey: string ) {
		Reflect.defineMetadata( 'serializable', true, target, propertyKey );
	};
}

const enum ISerializedFieldType {
	INT = 'int',
	FLOAT = 'float',
	STRING = 'string',
	BOOLEAN = 'boolean',
	ENUM = 'enum',
	ARRAY = 'array',
	VECTOR3 = 'vector3',
	ROAD = 'road',
}

export interface ISerializedField {
	type?: 'int' | 'float' | 'string' | 'boolean' | 'enum' | 'array' | 'vector3' | 'road' | 'entity' | 'gameobject';
	disabled?: boolean;
	label?: string;
	description?: string;
	min?: number;
	max?: number;
	step?: number;
	enum?: any;
}

export function Action () {
	return function ( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {
		let actions = Reflect.getMetadata( 'actions', target ) || [];
		actions.push( {
			name: propertyKey,
			method: target[ propertyKey ]
		} );
		Reflect.defineMetadata( 'actions', actions, target );
	};
}

export function SerializedField ( settings: ISerializedField ) {
	return function ( target: any, propertyKey: string ) {
		Reflect.defineMetadata( 'serializable', true, target, propertyKey );
		Reflect.defineMetadata( 'fieldSettings', settings, target, propertyKey );
	};
}

export function getSerializableActions ( target: any ): { name: string, method: Function }[] {
	const proto = Object.getPrototypeOf( target );
	return Reflect.getMetadata( 'actions', proto ) || [];
}

export function getSerializableFields ( object: any ): { field: string, settings: any }[] {

	const proto = Object.getPrototypeOf( object );
	const properties = Object.getOwnPropertyNames( proto );

	return properties
		.filter( property => Reflect.getMetadata( 'serializable', object, property ) )
		.map( property => ( {
			field: property,
			settings: Reflect.getMetadata( 'fieldSettings', object, property ) || {}
		} ) );

}

export class PlayerStats {

	constructor () {
		this._movementSpeed = 1;
		this._hitPoints = 100;
		this._hasHealthPotion = false;
	}

	private _movementSpeed: number;

	@SerializedField( { type: 'int' } )
	get movementSpeed (): number {
		return this._movementSpeed;
	}

	set movementSpeed ( value: number ) {
		this._movementSpeed = value;
		// Perform other steps here...
	}

	private _hitPoints: number;

	@SerializedField( { type: 'int' } )
	get hitPoints (): number {
		return this._hitPoints;
	}

	set hitPoints ( value: number ) {
		this._hitPoints = value;
		// Perform other steps here...
	}

	private _hasHealthPotion: boolean;

	@SerializedField( { type: 'boolean' } )
	get hasHealthPotion (): boolean {
		return this._hasHealthPotion;
	}

	set hasHealthPotion ( value: boolean ) {
		this._hasHealthPotion = value;
		// Perform other steps here...
	}
}
