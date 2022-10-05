/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';

@Component( {
	selector: 'app-console',
	templateUrl: './console.component.html',
	styleUrls: [ './console.component.css' ]
} )
export class ConsoleComponent implements OnInit {

	constructor () {
	}

	get logs () {
		return TvConsole.logs;
	}

	ngOnInit () {
	}

	clear () {

		TvConsole.clear();

	}

}
