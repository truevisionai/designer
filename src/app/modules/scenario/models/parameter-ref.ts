import { ScenarioService } from '../services/scenario.service';

export class ParameterRef {

	private referenceText: string;

	constructor ( referenceText: any ) {
		// TODO: (for OSC1.1) add methods(lexer and mathInterpreter) to
		// recognize and interpret math expression from referenceText
		this.referenceText = String( referenceText );
	}

	public isLiteral (): boolean {
		return this._isMatching( /(-)?\d+(\.\d*)?/ );
	}

	public isParameter (): boolean {
		// All parameter names must begin with a letter of the alphabet (a-z, A-Z) or an underscore (_).
		// After the first initial character, names can also contain numbers (0-9).
		return this._isMatching( /\$[A-Za-z_][\w]*/ );
		// return this._isMatching(/^[A-Za-z_][A-Za-z0-9_]*$/); // this also works
	}

	public getInterpretedValue (): string | number | boolean | null {
		let value: string | number | null;

		if ( this.isLiteral() ) {
			value = this.referenceText;
		} else if ( this.isParameter() ) {
			value = ScenarioService.getGlobalParameterValue( this.referenceText );
			if ( value === null || value === undefined ) {
				throw new Error( `Parameter '${ this.referenceText.substring( 1 ) }' is not defined` );
			}
		} else if ( this.isExpression() ) {
			value = this.evaluateExpression();
		} else {
			value = null;
		}

		return value;
	}

	public toFloat (): number {
		const value = this.getInterpretedValue();
		if ( value !== null ) {
			return parseFloat( value as string );
		} else {
			throw new Error( `Could not convert '${ this.referenceText }' to float` );
		}
	}

	public toInt (): number {
		const value = this.getInterpretedValue();
		if ( value !== null ) {
			return parseInt( value as string, 10 );
		} else {
			throw new Error( `Could not convert '${ this.referenceText }' to int` );
		}
	}

	public toString (): string {
		const value = this.getInterpretedValue() as string;
		return value !== null ? value : this.referenceText;
	}

	// Instead, you would have to use these utility methods for arithmetic operations.
	public add ( other: number ): number {
		return this.toFloat() + other;
	}

	public subtract ( other: number ): number {
		return this.toFloat() - other;
	}

	public multiply ( other: number ): number {
		return this.toFloat() * other;
	}

	public divide ( other: number ): number {
		return this.toFloat() / other;
	}

	// As mentioned, we can't directly override operators in TypeScript.

	public equalTo ( other: number ): boolean {
		return this.toFloat() === other;
	}

	public notEqualTo ( other: number ): boolean {
		return this.toFloat() !== other;
	}

	public greaterThan ( other: number ): boolean {
		return this.toFloat() > other;
	}

	public lessThan ( other: number ): boolean {
		return this.toFloat() < other;
	}

	public greaterThanOrEqualTo ( other: number ): boolean {
		return this.toFloat() >= other;
	}

	public lessThanOrEqualTo ( other: number ): boolean {
		return this.toFloat() <= other;
	}

	public absoluteValue (): number {
		return Math.abs( this.toFloat() );
	}

	private isExpression (): boolean {
		return this._isMatching( /^\$\{.*\}$/ );
	}

	private evaluateExpression (): number {
		let expr = this.referenceText.slice( 2, -1 );  // remove '${' and '}'

		// Replace parameters with their values
		expr = expr.replace( /\$([A-Za-z_][A-Za-z0-9_]*)/g, ( match, p1 ) => {
			const value = ScenarioService.getGlobalParameterValue( match );
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

	private _isMatching ( pattern: RegExp ): boolean {
		const match = this.referenceText.match( pattern );
		if ( match ) {
			return match[ 0 ] === this.referenceText;
		}
		return false;
	}
}
