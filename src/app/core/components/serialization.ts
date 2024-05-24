/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import 'reflect-metadata';

export interface ISerializedFieldSetting {
	type?: 'int' | 'float' | 'string' | 'boolean' | 'enum' | 'array' | 'vector2' | 'vector3' | 'road' | 'entity' | 'gameobject' | 'color' | 'texture' | 'object' | 'material';
	disabled?: boolean;
	label?: string;
	description?: string;
	min?: number;
	max?: number;
	step?: number;
	enum?: any;
}

export interface ISerializedActionSetting {
	label: string;
	description?: string;
	method?: Function;
	validate?: Function;
}

export function SerializedAction ( settings?: ISerializedActionSetting ) {

	return function ( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {

		let actions: ISerializedActionSetting[] = Reflect.getMetadata( 'actions', target ) || [];

		actions.push( {
			label: settings?.label || propertyKey,
			description: settings?.description || null,
			method: target[ propertyKey ],
			validate: settings?.validate || ( () => true ) // Add a validate property
		} );

		Reflect.defineMetadata( 'actions', actions, target );
	};

}

export function SerializedField ( settings: ISerializedFieldSetting ) {
	return function ( target: any, propertyKey: string ) {
		Reflect.defineMetadata( 'serializable', true, target, propertyKey );
		Reflect.defineMetadata( 'fieldSettings', settings, target, propertyKey );
	};
}

export function getSerializableActions ( target: any ): ISerializedActionSetting[] {
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
