/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';

import { AuthService } from 'app/services/auth.service';
import { SnackBar } from 'app/services/snack-bar.service';

@Component( {
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: [ './forgot-password.component.css' ]
} )
export class ForgotPasswordComponent implements OnInit {

	userEmail;

	@ViewChild( MatProgressBar ) progressBar: MatProgressBar;

	@ViewChild( MatButton ) submitButton: MatButton;

	constructor ( private authService: AuthService, private snackBar: SnackBar ) {
	}

	ngOnInit (): void {
	}

	submitEmail (): void {

		this.submitButton.disabled = true;

		this.progressBar.mode = 'indeterminate';

		this.authService.forgotPassword( this.userEmail ).subscribe( response => {

			this.submitButton.disabled = false;

			this.progressBar.mode = 'determinate';

			this.snackBar.show( 'Please check your email inbox to reset the password' );

		}, error => {

			this.submitButton.disabled = false;

			this.progressBar.mode = 'determinate';

			this.snackBar.error( 'Error occured in resseting password' );

		} );
	}
}
