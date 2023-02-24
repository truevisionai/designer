/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AppService } from 'app/core/services/app.service';
import { AuthService } from 'app/core/services/auth.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { CustomValidators } from 'ng2-validation';
import { ElectronService } from 'ngx-electron';

@Component( {
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: [ './signup.component.css' ]
} )
export class SignupComponent implements OnInit {

    @ViewChild( MatProgressBar ) progressBar: MatProgressBar;
    @ViewChild( MatButton ) submitButton: MatButton;

    signupForm: FormGroup;

    get agreed () {
        return this.signupForm.controls[ 'agreed' ] as FormControl;
    }

    get password () {
        return this.signupForm.controls[ 'password' ] as FormControl;
    }

    get confirmPassword () {
        return this.signupForm.controls[ 'confirmPassword' ] as FormControl;
    }

    get name () {
        return this.signupForm.controls[ 'name' ] as FormControl;
    }

    get email () {
        return this.signupForm.controls[ 'email' ] as FormControl;
    }

    constructor (
        private authService: AuthService,
        private router: Router,
        private electron: ElectronService
    ) {
    }

    ngOnInit () {

        this.authService.logout();

        const password = new FormControl( '', Validators.required );
        const confirmPassword = new FormControl( '', CustomValidators.equalTo( password ) );

        this.signupForm = new FormGroup( {
            name: new FormControl( '', [ Validators.required ] ),
            email: new FormControl( '', [ Validators.required, Validators.email ] ),
            password,
            confirmPassword,
            agreed: new FormControl( '', ( control: FormControl ) => {
                const agreed = control.value;
                if ( !agreed ) {
                    return { agreed: true };
                }
                return null;
            } )
        } );
    }

    signup () {

        const form = this.signupForm.value;

        this.submitButton.disabled = true;

        this.progressBar.mode = 'indeterminate';

        console.log( form );

        this.authService.register(
            form.name,
            form.email,
            form.password,
            form.confirmPassword,
            form.agreed
        ).subscribe(
            response => this.onSuccess( response ),
            error => this.onError( error )
        );
    }

    onSuccess ( response: any ): void {

        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';

        SnackBar.show( 'Successfully signed in' );

        this.router.navigateByUrl( AppService.homeUrl );
    }


    onError ( error: any ): void {

        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';

        let message = 'some error occured';

        if ( error != null && error.message != null ) message = error.message;

        SnackBar.error( message );

    }

}
