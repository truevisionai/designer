/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ParameterType, Rule } from './tv-enums';

/**
 * Value constraints represent a single rule to a given parameter
 * in a parameter declaration. Note that value must match the
 * type of the enclosing parameter declaration. A ValueConstraint
 * for parameter declaration of type "string" must use
 * either "equalTo" or "notEqualTo" for the rule property.
 */
export class ValueConstraint {
	constructor (
		public value: string,
		public rule: Rule,
	) {
	}
}

export class ParameterDeclaration {

	constructor (
		public parameter: Parameter,
		private valueConstraints: ValueConstraint[] = []
	) {
	}
}

export class Parameter {

	public name: string;
	public type: ParameterType;

	constructor ( name: string, type: ParameterType, private _value: string ) {

		this.name = name;
		this.type = type;

	}

	public get value (): string {
		return this._value;
	}

	public set value ( value: string ) {
		this._value = value;
	}

	static stringToEnum ( type: string ): ParameterType {

		switch ( type ) {
			case 'integer':
				return ParameterType.integer;
				break;
			case 'double':
				return ParameterType.double;
				break;
			case 'string':
				return ParameterType.string;
				break;
			case 'boolean':
				return ParameterType.boolean;
				break;
			case 'unsignedInt':
				return ParameterType.unsignedInt;
				break;
			case 'unsignedShort':
				return ParameterType.unsignedShort;
				break;
			case 'dateTime':
				return ParameterType.dateTime;
				break;
			default:
				throw new Error( 'unknown paramater type' );
		}

	}

	getValue<T> (): any {

		switch ( this.type ) {
			case ParameterType.integer:
				return parseInt( this._value );
				break;
			case ParameterType.double:
				return parseFloat( this._value );
				break;
			case ParameterType.string:
				return this._value;
				break;
			case ParameterType.boolean:
				return this._value === 'true';
				break;
			case ParameterType.unsignedInt:
				return parseInt( this._value );
				break;
			case ParameterType.unsignedShort:
				return parseInt( this._value );
				break;
			case ParameterType.dateTime:
				return this._value;
				break;
			default:
				throw new Error( 'unknown paramater type' );
		}

	}
}
