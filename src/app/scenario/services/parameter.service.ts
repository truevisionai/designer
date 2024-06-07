import { Injectable } from '@angular/core';
import { ScenarioService } from "./scenario.service";
import { ParameterRef } from "../models/parameter-ref";

@Injectable( {
	providedIn: 'root'
} )
export class ParameterService {

	constructor (
		private scenarioService: ScenarioService
	) {
	}

	public getInterpretedValue ( parameter: ParameterRef ): string | number | boolean | null {

		let value: string | number | null;

		if ( parameter.isLiteral() ) {

			value = parameter.referenceText;

		} else if ( parameter.isParameter() ) {

			value = this.getGlobalParameterValue( parameter.referenceText );

			if ( value === null || value === undefined ) {
				throw new Error( `Parameter '${ parameter.referenceText.substring( 1 ) }' is not defined` );
			}

		} else if ( parameter.isExpression() ) {

			value = this.evaluateExpression( parameter );

		} else {

			value = null;

		}

		return value;
	}

	public evaluateExpression ( parameter: ParameterRef ): number {

		let expr = parameter.referenceText.slice( 2, -1 );  // remove '${' and '}'

		// Replace parameters with their values
		expr = expr.replace( /\$([A-Za-z_][A-Za-z0-9_]*)/g, ( match, p1 ) => {
			const value = this.getGlobalParameterValue( match );
			if ( value === null || value === undefined ) {
				throw new Error( `Parameter '${ p1 }' is not defined in the expression` );
			}
			return value;
		} );

		// Replace function names with JavaScript counterparts
		expr = expr.replace( /round\(([^)]+)\)/g, 'Math.round($1)' )
			.replace( /floor\(([^)]+)\)/g, 'Math.floor($1)' )
			.replace( /ceil\(([^)]+)\)/g, 'Math.ceil($1)' )
			.replace( /sqrt\(([^)]+)\)/g, 'Math.sqrt($1)' )
			.replace( /pow\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)' );

		// Replace OpenSCENARIO Boolean operators with JavaScript Boolean operators
		expr = expr.replace( /not/g, '!' )
			.replace( /and/g, '&&' )
			.replace( /or/g, '||' );

		if ( !this.isSafeExpression( expr ) ) {
			throw new Error( 'Unsafe or unsupported expression' );
		}

		return eval( expr );
	}

	private isSafeExpression ( expr: string ): boolean {
		const allowedPatterns = [
			/\s+/,                    // whitespace
			/-?\d+(\.\d+)?/,          // numbers
			/\$/,                     // parameters
			/Math\.round\(/,
			/Math\.floor\(/,
			/Math\.ceil\(/,
			/Math\.sqrt\(/,
			/Math\.pow\(/,
			/\+/, /\-/, /\*/, /\//, /\%/, /,/,
			/\(/, /\)/,
			/true/, /false/,
			/!/, /&&/, /\|\|/         // Boolean operators: !, &&, ||
		];

		for ( const pattern of allowedPatterns ) {
			expr = expr.replace( new RegExp( pattern, 'g' ), '' );  // remove all allowed patterns
		}

		return expr.trim() === '';  // after removing all allowed patterns, nothing should remain
	}

	public toFloat ( parameter: ParameterRef ): number {
		const value = this.getInterpretedValue( parameter );
		if ( value !== null ) {
			return parseFloat( value as string );
		} else {
			throw new Error( `Could not convert '${ parameter.referenceText }' to float` );
		}
	}

	public toInt ( parameter: ParameterRef ): number {
		const value = this.getInterpretedValue( parameter );
		if ( value !== null ) {
			return parseInt( value as string, 10 );
		} else {
			throw new Error( `Could not convert '${ parameter.referenceText }' to int` );
		}
	}

	public toString ( parameter: ParameterRef ): string {
		const value = this.getInterpretedValue( parameter ) as string;
		return value !== null ? value : parameter.referenceText;
	}

	//public equalTo ( other: number ): boolean {
	//	return this.toFloat() === other;
	//}
	//
	//public notEqualTo ( other: number ): boolean {
	//	return this.toFloat() !== other;
	//}
	//
	//public greaterThan ( other: number ): boolean {
	//	return this.toFloat() > other;
	//}
	//
	//public lessThan ( other: number ): boolean {
	//	return this.toFloat() < other;
	//}
	//
	//public greaterThanOrEqualTo ( other: number ): boolean {
	//	return this.toFloat() >= other;
	//}
	//
	//public lessThanOrEqualTo ( other: number ): boolean {
	//	return this.toFloat() <= other;
	//}
	//
	//public absoluteValue (): number {
	//	return Math.abs( this.toFloat() );
	//}

	// Instead, you would have to use these utility methods for arithmetic operations.
	public add ( parameter: ParameterRef, other: number ): number {
		return this.toFloat( parameter ) + other;
	}

	public subtract ( parameter: ParameterRef, other: number ): number {
		return this.toFloat( parameter ) - other;
	}

	public multiply ( parameter: ParameterRef, other: number ): number {
		return this.toFloat( parameter ) * other;
	}

	public divide ( parameter: ParameterRef, other: number ): number {
		return this.toFloat( parameter ) / other;
	}

	public getGlobalParameterValue ( name: string ): string {

		const declaration = this.scenarioService.scenario.getParameterDeclaration( name );

		return declaration?.getValue();

	}
}
