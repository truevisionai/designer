/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { OpenDrive14Parser } from './open-drive-1-4.parser';
import { SnackBar } from 'app/services/snack-bar.service';

export class OpenDrive15Parser extends OpenDrive14Parser {

	constructor ( snackBar: SnackBar ) {
		super( snackBar );
	}

}
