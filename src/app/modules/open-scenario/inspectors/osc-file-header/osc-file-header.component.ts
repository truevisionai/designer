/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { OscFileHeader } from '../../models/osc-file-header';

@Component( {
	selector: 'app-osc-file-header',
	templateUrl: './osc-file-header.component.html'
} )
export class OscFileHeaderComponent implements OnInit {

	@Input() fileHeader: OscFileHeader;

	constructor () {
	}

	ngOnInit () {


	}

}
