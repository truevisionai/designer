import { Injectable } from '@angular/core';
import { TvElectronService } from '../tv-electron.service';
import { IFile } from 'app/io/file';

interface OpenDialogReturnValue {
	/**
	 * whether or not the dialog was canceled.
	 */
	canceled: boolean;
	/**
	 * An array of file paths chosen by the user. If the dialog is cancelled this will
	 * be an empty array.
	 */
	filePaths: string[];
	/**
	 * An array matching the `filePaths` array of base64 encoded strings which contains
	 * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
	 * this to be populated. (For return values, see table here.)
	 *
	 * @platform darwin,mas
	 */
	bookmarks?: string[];
}

interface SaveDialogReturnValue {
	/**
		 * whether or not the dialog was canceled.
		 */
	canceled: boolean;
	/**
	 * An array of file paths chosen by the user. If the dialog is cancelled this will
	 * be an empty array.
	 */
	filePath: string;
	/**
	 * An array matching the `filePaths` array of base64 encoded strings which contains
	 * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
	 * this to be populated. (For return values, see table here.)
	 *
	 * @platform darwin,mas
	 */
	bookmarks?: string[];
}

export interface IDialogProvider {

	openDialog ( options: any ): Promise<OpenDialogReturnValue>;

	saveDialog ( options: any ): Promise<SaveDialogReturnValue>;

}

@Injectable( {
	providedIn: 'root'
} )
export class DialogService {

	private dialogProvider: IDialogProvider;

	constructor ( private electron: TvElectronService ) {

		if ( this.electron.isElectronApp ) {

			this.dialogProvider = new ElectronDialogProvider( this.electron );

		} else {

			this.dialogProvider = new WebDialogProvider();

		}

	}

	openDialog ( options: any ): Promise<OpenDialogReturnValue> {

		return this.dialogProvider.openDialog( options );

	}

	saveDialog ( options: any ): Promise<SaveDialogReturnValue> {

		return this.dialogProvider.saveDialog( options );

	}

}

export class ElectronDialogProvider implements IDialogProvider {

	constructor (
		private electron: TvElectronService
	) {

	}

	openDialog ( options: any ): Promise<OpenDialogReturnValue> {

		const filters = options?.extensions?.map( ( extension: string ) => {
			return {
				name: extension,
				extensions: [ extension.replace( '.', '' ) ]
			}
		} );

		const openOptions = {
			title: options?.title || 'Select file',
			buttonLabel: options?.title || 'Import',
			filters: filters,
			message: options?.title || 'Select file'
		};

		return this.electron.remote.dialog.showOpenDialog( openOptions );

	}

	saveDialog ( options: any ): Promise<SaveDialogReturnValue> {

		const saveOptions: Electron.SaveDialogOptions = {
			title: 'Save File',
			defaultPath: options?.defaultPath || '',
			filters: [
				{ name: 'All Files', extensions: [ options?.extension ] }
			]
		};

		return this.electron.remote.dialog.showSaveDialog( saveOptions );

	}

}


export class WebDialogProvider implements IDialogProvider {

	constructor () {

	}

	openDialog ( options: any ): Promise<any> {

		throw new Error( 'Method not implemented.' );

	}

	saveDialog ( options: any ): Promise<any> {

		throw new Error( 'Method not implemented.' );

	}

}
