/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvElectronService } from './tv-electron.service';

declare const buffer;
declare const fbxToGlTF;

@Injectable( {
	providedIn: 'root'
} )
export class PreloadApiService {

	public buffer: {
		from: ( buffer: any, from?: any ) => any;
	};

	public fbxToGlTF: any;

	constructor ( private electronService: TvElectronService, ) {
		if ( this.electronService.isElectronApp ) {
			this.buffer = buffer;
			this.fbxToGlTF = fbxToGlTF;
		}
	}

}
