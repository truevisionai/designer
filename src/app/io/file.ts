/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FileUtils } from 'app/io/file-utils';

export class IFile {

	constructor (
		public name?: string,
		public path?: string,
		public contents?: string,
		public type?: string,
		public online?: boolean,
		public updatedAt?: Date
	) {
	}

	get directory () {
		return FileUtils.getDirectoryFromPath( this.path );
	}

	get filename () {
		return FileUtils.getFilenameFromPath( this.path );
	}
}
