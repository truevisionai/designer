import { Injectable } from '@angular/core';
import { OpenDrive14Parser } from './open-drive-1-4.parser';

@Injectable( {
	providedIn: 'root'
} )
export class OpenDrive15Parser extends OpenDrive14Parser {

	constructor () {
		super();
	}

}
