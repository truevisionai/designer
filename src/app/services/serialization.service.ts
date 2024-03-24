/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

export enum EnumFieldType {
	int = 'int',
	float = 'float',
	string = 'string',
	boolean = 'boolean',
	enum = 'enum',
	array = 'array',
	vector2 = 'vector2',
	vector3 = 'vector3',
	road = 'road',
	entity = 'entity',
	gameobject = 'gameobject',
	color = 'color',
	texture = 'texture',
	object = 'object',
	material = 'material'
}

export interface IField<T, P extends keyof T> {
	name: P;
	type: EnumFieldType;
	disabled?: boolean;
	label?: string;
	description?: string;
	min?: number;
	max?: number;
	step?: number;
	enum?: any;
}

@Injectable( {
	providedIn: 'root'
} )
export class SerializationService {

	constructor () { }

	getSerialized<T, P extends keyof T> ( object: T, properties: IField<T, P>[] ): any {

		Debug.log( properties );

		for ( const key in object ) {

			if ( object.hasOwnProperty( key ) ) {

				const element = object[ key ];

				if ( element instanceof Object ) {

					// this.getSerialized( element );

				} else {

					// Debug.log( key, element );

				}

			}

		}

	}

}
