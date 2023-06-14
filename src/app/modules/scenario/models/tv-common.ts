/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class File {

	public filepath: string;

	constructor ( filePath: string ) {

		this.filepath = filePath;

	}
}

export class Directory {

	public path: string;

	constructor ( path: string ) {

		this.path = path;
	}
}
