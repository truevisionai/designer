/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';


@Component( {
	selector: 'app-lockscreen',
	templateUrl: './lockscreen.component.html',
	styleUrls: [ './lockscreen.component.css' ]
} )
export class LockscreenComponent implements OnInit {
	@ViewChild( MatProgressBar ) progressBar: MatProgressBar;
	@ViewChild( MatButton ) submitButton: MatButton;

	lockscreenData = {
		password: ''
	};

	constructor () {
	}

	ngOnInit (): void {
	}

	unlock (): void {

		this.submitButton.disabled = true;
		this.progressBar.mode = 'indeterminate';
	}
}
