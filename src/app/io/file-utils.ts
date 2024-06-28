/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInfo } from 'app/services/app-info.service';

export class FileUtils {

	static getExtensionFromPath ( path: string ) {

		// if ( this.electron.isWindows ) {

		// 	const array = filename.split( '.' );

		// 	return array[ array.length - 1 ];
		// }

		// const regEx = /(?:\.([^.]+))?$/;

		// const extension = regEx.exec( filename )[ 1 ];

		// return extension;

		if ( !path ) return;

		// split by dot and return the last item

		return path.split( '.' ).pop();

	}

	static getDirectoryFromPath ( path: string ): string {

		if ( !path ) return;

		// split by slash or back-slash then remove the last item and add
		// slash or blash at the end

		if ( AppInfo.electron.isWindows ) {
			return path.split( '\\' ).slice( 0, -1 ).join( '\\' );
		}

		if ( AppInfo.electron.isLinux ) {
			return path.split( '/' ).slice( 0, -1 ).join( '/' );
		}

		if ( AppInfo.electron.isMacOS ) {
			return path.split( '/' ).slice( 0, -1 ).join( '/' );
		}

		throw new Error( 'unknown platform' + process.platform );

	}

	static getFilenameFromPath ( path: string ): string {

		if ( !path ) return;

		// if windows, split by backslash and return the last item
		if ( AppInfo.electron.isWindows ) {
			return path.split( '\\' ).pop();
		}

		// if linux, split by slash and return the last item
		if ( AppInfo.electron.isLinux ) {
			return path.split( '/' ).pop();
		}

		if ( AppInfo.electron.isMacOS ) {
			return path.split( '/' ).pop();
		}

		throw new Error( 'unknown platform' + process.platform );
	}

	static getFilenameWithoutExtension ( path: string ): string|undefined {

		if ( !path ) return;

		const filename = FileUtils.getFilenameFromPath( path );

		const extension = FileUtils.getExtensionFromPath( path );

		return filename.replace( '.' + extension, '' );

	}

	static pathToFileURL ( path: string ): string {

		if ( !path ) return;

		const isWindows = AppInfo.electron.isWindows;

		const prefix = isWindows ? 'file:///' : 'file://';

		if ( isWindows ) {
			path = path.replace( /\\/g, '/' );
		}

		return prefix + path;
	}

}
