/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AppService } from 'app/services/app.service';
import { AuthService } from 'app/services/auth.service';
import { SnackBar } from 'app/services/snack-bar.service';

@Component( {
	selector: 'app-signin',
	templateUrl: './signin.component.html',
	styleUrls: [ './signin.component.css' ]
} )
export class SigninComponent implements OnInit {

	@ViewChild( MatProgressBar ) progressBar: MatProgressBar;
	@ViewChild( 'signinButton' ) submitButton: MatButton;
	@ViewChild( 'resendButton' ) resendButton: MatButton;

	form: FormGroup;

	error: string;
	message: string;
	showResendEmailConfirmationLink: boolean;

	constructor (
		private authService: AuthService,
		private router: Router,
		private snackBar: SnackBar
	) {
	}

	get email (): FormControl {
		return this.form?.get( 'email' ) as FormControl;
	}

	get password (): FormControl {
		return this.form?.get( 'password' ) as FormControl;
	}

	ngOnInit () {

		this.authService.logout();

		this.form = new FormGroup( {
			email: new FormControl( '', [ Validators.required, Validators.email ] ),
			password: new FormControl( '', Validators.required ),
			rememberMe: new FormControl( false )
		} );

	}

	onSubmit () {

		const formData = this.form.value;

		this.submitButton.disabled = true;

		this.progressBar.mode = 'indeterminate';

		this.authService
			.login( formData.email, formData.password )
			.subscribe( res => this.onSuccess( res ), err => this.onError( err ) );
	}

	onError ( errorResponse: any ) {

		this.submitButton.disabled = false;
		this.progressBar.mode = 'determinate';

		this.error = errorResponse?.error || 'Error';
		this.message = errorResponse?.message || 'Something went wrong';

		if ( errorResponse?.code == 423 ) {
			this.showResendEmailConfirmationLink = true;
		}

		this.snackBar.error( this.message );

	}

	onSuccess ( response: any ) {

		this.submitButton.disabled = false;
		this.progressBar.mode = 'determinate';

		this.snackBar.show( 'Successfully signed in' );

		this.router.navigateByUrl( AppService.homeUrl );

	}

	resendEmailConfirmationLink () {

		if ( this.email.invalid ) {
			this.email.markAsTouched();
			return;
		}

		this.resendButton.disabled = true;

		this.showResendEmailConfirmationLink = false;

		this.authService.resendEmailConfirmationLink( this.email.value ).subscribe( res => {

			this.snackBar.success( 'Email confirmation link sent. Please check your inbox.' );

		}, err => {

			this.resendButton.disabled = false;

			this.snackBar.error( err?.message || 'Something went wrong' );

		}, () => {

			this.resendButton.disabled = false;

		} )


	}
}
