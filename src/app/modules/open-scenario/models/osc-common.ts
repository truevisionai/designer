/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class OscFile {

	public filepath: string;

	constructor ( filePath: string ) {

		this.filepath = filePath;

	}
}

export class OscDirectory {

	public path: string;

	constructor ( path: string ) {

		this.path = path;
	}
}
