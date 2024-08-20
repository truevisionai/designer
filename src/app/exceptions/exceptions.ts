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

export class LaneSectionNotFound extends ModelNotFoundException {
	constructor ( message: string = 'LaneSectionNotFound' ) {
		super( message );
		this.name = 'LaneSectionNotFound';
		Error.captureStackTrace( this, LaneSectionNotFound );
	}
}

export class LaneNotFound extends ModelNotFoundException {
	constructor ( message: string = 'LaneNotFound' ) {
		super( message );
		this.name = 'LaneNotFound';
		Error.captureStackTrace( this, LaneNotFound );
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

export class NoGeometriesFound extends Error {
	constructor ( message: string = 'NoGeometriesFound' ) {
		super( message );
		this.name = 'NoGeometriesFound';
		Error.captureStackTrace( this, NoGeometriesFound );
	}
}

export class InvalidRoadLength extends Error {
	constructor ( message: string = 'InvalidRoadLength' ) {
		super( message );
		this.name = 'InvalidRoadLength';
		Error.captureStackTrace( this, InvalidRoadLength );
	}
}
