/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class ModelNotFoundException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'ModelNotFoundException';
		Error.captureStackTrace( this, ModelNotFoundException );
	}
}

export class InvalidArgumentException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidArgumentException';
		Error.captureStackTrace( this, InvalidArgumentException );
	}
}

export class DuplicateModelException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'DuplicateModelException';
		Error.captureStackTrace( this, DuplicateModelException );
	}
}

export class DuplicateKeyException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'DuplicateKeyException';
		Error.captureStackTrace( this, DuplicateKeyException );
	}
}

export class InvalidModelException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidModelException';
		Error.captureStackTrace( this, InvalidModelException );
	}
}

export class InvalidKeyException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidKeyException';
		Error.captureStackTrace( this, InvalidKeyException );
	}
}

export class InvalidTypeException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidTypeException';
		Error.captureStackTrace( this, InvalidTypeException );
	}
}

export class InvalidValueException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidValueException';
		Error.captureStackTrace( this, InvalidValueException );
	}
}
