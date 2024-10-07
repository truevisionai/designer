export abstract class Assert {

	static isDefined<T> ( value: T, message?: string ): asserts value is NonNullable<T> {
		if ( value === undefined || value === null ) {
			throw new Error( message ?? 'Value is not defined' );
		}
	}

	static isString ( value: any, message?: string ): asserts value is string {
		if ( typeof value !== 'string' ) {
			throw new Error( message ?? 'Value is not a string' );
		}
	}

	static isNumber ( value: any, message?: string ): asserts value is number {
		if ( typeof value !== 'number' ) {
			throw new Error( message ?? 'Value is not a number' );
		}
	}

	static isBoolean ( value: any, message?: string ): asserts value is boolean {
		if ( typeof value !== 'boolean' ) {
			throw new Error( message ?? 'Value is not a boolean' );
		}
	}

	static isArray ( value: any, message?: string ): asserts value is any[] {
		if ( !Array.isArray( value ) ) {
			throw new Error( message ?? 'Value is not an array' );
		}
	}

	static isObject ( value: any, message?: string ): asserts value is object {
		if ( typeof value !== 'object' || value === null || Array.isArray( value ) ) {
			throw new Error( message ?? 'Value is not an object' );
		}
	}

	static isFunction ( value: any, message?: string ): asserts value is Function {
		if ( typeof value !== 'function' ) {
			throw new Error( message ?? 'Value is not a function' );
		}
	}

	static isInstanceOf<T> ( value: any, type: new () => T, message?: string ): asserts value is T {
		if ( !( value instanceof type ) ) {
			throw new Error( message ?? 'Value is not an instance of the expected type' );
		}
	}

	static isOneOf<T> ( value: T, values: T[], message?: string ): void {
		if ( !values.includes( value ) ) {
			throw new Error( message ?? 'Value is not one of the expected values' );
		}
	}

	static isNoneOf<T> ( value: T, values: T[], message?: string ): void {
		if ( values.includes( value ) ) {
			throw new Error( message ?? 'Value is one of the expected values' );
		}
	}

	static isTrue ( value: any, message?: string ): asserts value is true {
		if ( value !== true ) {
			throw new Error( message ?? 'Value is not true' );
		}
	}

	static isFalse ( value: any, message?: string ): asserts value is false {
		if ( value !== false ) {
			throw new Error( message ?? 'Value is not false' );
		}
	}

	static isNull ( value: any, message?: string ): asserts value is null {
		if ( value !== null ) {
			throw new Error( message ?? 'Value is not null' );
		}
	}

	static isUndefined ( value: any, message?: string ): asserts value is undefined {
		if ( value !== undefined ) {
			throw new Error( message ?? 'Value is not undefined' );
		}
	}

	static isNullOrUndefined ( value: any, message?: string ): asserts value is null | undefined {
		if ( value !== null && value !== undefined ) {
			throw new Error( message ?? 'Value is neither null nor undefined' );
		}
	}

	static isNotUndefined ( value: any, message?: string ): asserts value is NonNullable<any> {
		if ( value === undefined ) {
			throw new Error( message ?? 'Value is undefined' );
		}
	}

	static isNotString ( value: any, message?: string ): void {
		if ( typeof value === 'string' ) {
			throw new Error( message ?? 'Value is a string' );
		}
	}

	static isNotNumber ( value: any, message?: string ): void {
		if ( typeof value === 'number' ) {
			throw new Error( message ?? 'Value is a number' );
		}
	}

	static isNotBoolean ( value: any, message?: string ): void {
		if ( typeof value === 'boolean' ) {
			throw new Error( message ?? 'Value is a boolean' );
		}
	}

	static isNotArray ( value: any, message?: string ): void {
		if ( Array.isArray( value ) ) {
			throw new Error( message ?? 'Value is an array' );
		}
	}

	static isNotObject ( value: any, message?: string ): void {
		if ( typeof value === 'object' && value !== null && !Array.isArray( value ) ) {
			throw new Error( message ?? 'Value is an object' );
		}
	}

	static isNotFunction ( value: any, message?: string ): void {
		if ( typeof value === 'function' ) {
			throw new Error( message ?? 'Value is a function' );
		}
	}

	static isNotInstanceOf<T> ( value: any, type: new () => T, message?: string ): void {
		if ( value instanceof type ) {
			throw new Error( message ?? 'Value is an instance of the expected type' );
		}
	}

	static isNotOneOf<T> ( value: T, values: T[], message?: string ): void {
		if ( values.includes( value ) ) {
			throw new Error( message ?? 'Value is one of the expected values' );
		}
	}

	static isNotNoneOf<T> ( value: T, values: T[], message?: string ): void {
		if ( !values.includes( value ) ) {
			throw new Error( message ?? 'Value is not one of the expected values' );
		}
	}

	static isNotTrue ( value: any, message?: string ): void {
		if ( value === true ) {
			throw new Error( message ?? 'Value is true' );
		}
	}

	static isNotFalse ( value: any, message?: string ): void {
		if ( value === false ) {
			throw new Error( message ?? 'Value is false' );
		}
	}

	static isNotNull ( value: any, message?: string ): void {
		if ( value === null ) {
			throw new Error( message ?? 'Value is null' );
		}
	}

	static isNotNullOrUndefined ( value: any, message?: string ): void {
		if ( value === null || value === undefined ) {
			throw new Error( message ?? 'Value is null or undefined' );
		}
	}

	static isNot ( value: any, expected: any, message?: string ): void {
		if ( value === expected ) {
			throw new Error( message ?? 'Value is the expected value' );
		}
	}

	static is ( value: any, expected: any, message?: string ): void {
		if ( value !== expected ) {
			throw new Error( message ?? 'Value is not the expected value' );
		}
	}

	static isGreaterThan ( value: number, expected: number, message?: string ): void {
		if ( value <= expected ) {
			throw new Error( message ?? 'Value is not greater than the expected value' );
		}
	}

	static isGreaterThanOrEqual ( value: number, expected: number, message?: string ): void {
		if ( value < expected ) {
			throw new Error( message ?? 'Value is not greater than or equal to the expected value' );
		}
	}

	static isLessThan ( value: number, expected: number, message?: string ): void {
		if ( value >= expected ) {
			throw new Error( message ?? 'Value is not less than the expected value' );
		}
	}

	static isLessThanOrEqual ( value: number, expected: number, message?: string ): void {
		if ( value > expected ) {
			throw new Error( message ?? 'Value is not less than or equal to the expected value' );
		}
	}

	static isInRange ( value: number, min: number, max: number, message?: string ): void {
		if ( value < min || value > max ) {
			throw new Error( message ?? 'Value is not within the expected range' );
		}
	}

	static isNotInRange ( value: number, min: number, max: number, message?: string ): void {
		if ( value >= min && value <= max ) {
			throw new Error( message ?? 'Value is within the expected range' );
		}
	}

	static isPositive ( value: number, message?: string ): void {
		if ( value <= 0 ) {
			throw new Error( message ?? 'Value is not positive' );
		}
	}

	static isNegative ( value: number, message?: string ): void {
		if ( value >= 0 ) {
			throw new Error( message ?? 'Value is not negative' );
		}
	}

	static isNonPositive ( value: number, message?: string ): void {
		if ( value > 0 ) {
			throw new Error( message ?? 'Value is positive' );
		}
	}

	static isNonNegative ( value: number, message?: string ): void {
		if ( value < 0 ) {
			throw new Error( message ?? 'Value is negative' );
		}
	}

	static isStringNotEmpty ( value: string, message?: string ): void {
		if ( value === '' ) {
			throw new Error( message ?? 'Value is an empty string' );
		}
	}

	static isStringEmpty ( value: string, message?: string ): void {
		if ( value !== '' ) {
			throw new Error( message ?? 'Value is not an empty string' );
		}
	}
}
