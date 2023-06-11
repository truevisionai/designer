/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscParameterType } from './osc-enums';

export class OscParameterDeclaration {

	public parameters: OscParameter[] = [];

	constructor () {
	}

	addParameter ( value: OscParameter ): void {

		this.parameters.push( value );

	}
}

export class OscParameter {

	public name: string;
	public type: OscParameterType;
	public value: string;

	constructor ( name: string, type: OscParameterType, value: string ) {

		this.name = name;
		this.type = type;
		this.value = value;

	}

	static stringToEnum ( type: string ): OscParameterType {

		switch ( type ) {

			case 'integer':
				return OscParameterType.integer;
				break;
			case 'double':
				return OscParameterType.double;
				break;
			case 'string':
				return OscParameterType.string;
				break;
			default:
				throw new Error( 'unknown paramater type' );
		}

	}

}
