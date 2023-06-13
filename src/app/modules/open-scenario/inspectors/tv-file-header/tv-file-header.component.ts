/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { FileHeader } from '../../models/tv-file-header';

@Component( {
	selector: 'app-tv-file-header',
	templateUrl: './tv-file-header.component.html'
} )
export class FileHeaderComponent implements OnInit {

	@Input() fileHeader: FileHeader;

	constructor () {
	}

	ngOnInit () {


	}

}
