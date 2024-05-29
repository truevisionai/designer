/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class ParameterRef {

	public referenceText: string;

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

	public isExpression (): boolean {
		return this._isMatching( /^\$\{.*\}$/ );
	}

	private _isMatching ( pattern: RegExp ): boolean {
		const match = this.referenceText.match( pattern );
		if ( match ) {
			return match[ 0 ] === this.referenceText;
		}
		return false;
	}
}
