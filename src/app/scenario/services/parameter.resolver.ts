/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from "../../importers/xml.element";
import { isObject } from "rxjs/internal-compatibility";
import { cloneDeep } from "lodash";

export class ParameterResolver {

	private params = {};

	constructor () {
	}

	replaceParameterWithValue ( obj: XmlElement ): XmlElement {

		return this.replaceParams( obj );

	}

	// Checks if obj is an iterable object (array, string, etc.)
	isIterable ( obj: any ): boolean {

		return obj != null && typeof obj[ Symbol.iterator ] === 'function';

	}

	replaceParams ( obj: Object ): Object {

		// If obj is not an object or is null, return it as is
		if ( !isObject( obj ) || obj === null ) {
			return obj;
		}

		// Deep clone obj to avoid mutating the original object
		let newObj = cloneDeep( obj );

		// Iterate over keys of newObj
		for ( let key of Object.keys( newObj ) ) {

			if ( key === 'ParameterDeclaration' ) {

				// Check if newObj[key] is iterable
				if ( this.isIterable( newObj[ key ] ) ) {

					// Update params with the new parameter declaration
					for ( let param of newObj[ key ] ) {
						this.params[ param.attr_name ] = param.attr_value;
					}

				} else {

					// If newObj[key] is not iterable, treat it as a single object
					this.params[ newObj[ key ].attr_name ] = newObj[ key ].attr_value;
				}

			} else {

				if ( typeof newObj[ key ] === 'string' && newObj[ key ].startsWith( '$' ) ) {

					// Replace parameterized value with the corresponding parameter value
					newObj[ key ] = this.params[ newObj[ key ].substring( 1 ) ];

				} else if ( isObject( newObj[ key ] ) ) {

					// Recursively process child objects
					newObj[ key ] = this.replaceParams( newObj[ key ] );
				}
			}
		}

		return newObj;
	}
}