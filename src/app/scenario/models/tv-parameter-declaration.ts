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

	public valueConstraints: ValueConstraint[] = [];

	constructor (
		public name: string,
		public type: ParameterType,
		public value: string,
	) {
	}

	static stringToType ( type: string ): ParameterType {

		if ( type === 'integer' ) {
			return ParameterType.integer;
		} else if ( type === 'double' ) {
			return ParameterType.double;
		} else if ( type === 'string' ) {
			return ParameterType.string;
		} else if ( type === 'boolean' ) {
			return ParameterType.boolean;
		} else if ( type === 'unsignedInt' ) {
			return ParameterType.unsignedInt;
		} else if ( type === 'unsignedShort' ) {
			return ParameterType.unsignedShort;
		} else if ( type === 'dateTime' ) {
			return ParameterType.dateTime;
		} else {
			return ParameterType.unknown;
		}

	}

	getValue<T> (): any {

		if ( this.type === ParameterType.integer ) {
			return parseInt( this.value );
		} else if ( this.type === ParameterType.double ) {
			return parseFloat( this.value );
		} else if ( this.type === ParameterType.string ) {
			return this.value;
		} else if ( this.type === ParameterType.boolean ) {
			return this.value === 'true';
		} else if ( this.type === ParameterType.unsignedInt ) {
			return parseInt( this.value );
		} else if ( this.type === ParameterType.unsignedShort ) {
			return parseInt( this.value );
		} else if ( this.type === ParameterType.dateTime ) {
			return this.value;
		} else {
			return null;
		}

	}

	static typeToString ( type: ParameterType ) {

		if ( type === ParameterType.integer ) {
			return 'integer';
		} else if ( type === ParameterType.double ) {
			return 'double';
		} else if ( type === ParameterType.string ) {
			return 'string';
		} else if ( type === ParameterType.boolean ) {
			return 'boolean';
		} else if ( type === ParameterType.unsignedInt ) {
			return 'unsignedInt';
		} else if ( type === ParameterType.unsignedShort ) {
			return 'unsignedShort';
		} else if ( type === ParameterType.dateTime ) {
			return 'dateTime';
		} else {
			return 'unknown';
		}
	}
}
