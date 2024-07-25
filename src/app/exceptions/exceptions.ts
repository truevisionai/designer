import { TvRoad } from "app/map/models/tv-road.model";

export class ModelNotFoundException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'ModelNotFoundException';
	}
}

export class InvalidArgumentException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidArgumentException';
	}
}

export class DuplicateModelException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'DuplicateModelException';
	}
}

export class DuplicateKeyException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'DuplicateKeyException';
	}
}

export class InvalidModelException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidModelException';
	}
}

export class InvalidKeyException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidKeyException';
	}
}

export class InvalidTypeException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidTypeException';
	}
}

export class InvalidValueException extends Error {
	constructor ( message: string ) {
		super( message );
		this.name = 'InvalidValueException';
	}
}
