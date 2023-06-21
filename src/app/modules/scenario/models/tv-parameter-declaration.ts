/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ParameterType } from './tv-enums';

export class ParameterDeclaration {

	constructor ( public parameters: Parameter[] = [] ) {
	}

	addParameter ( value: Parameter ): void {

		this.parameters.push( value );

	}
}

export class Parameter {

	public name: string;
	public type: ParameterType;
	public value: string;

	constructor ( name: string, type: ParameterType, value: string ) {

		this.name = name;
		this.type = type;
		this.value = value;

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

}
