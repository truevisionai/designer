/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from 'app/core/services/auth.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { Router } from '@angular/router';
import { AppService } from 'app/core/services/app.service';
import { AppLinks } from 'app/services/app-links';
import { ElectronService } from 'ngx-electron';

@Component( {
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: [ './signin.component.css' ]
} )
export class SigninComponent implements OnInit {

    @ViewChild( MatProgressBar ) progressBar: MatProgressBar;
    @ViewChild( MatButton ) submitButton: MatButton;

    signinForm: FormGroup;

    constructor ( private authService: AuthService, private router: Router, private electron: ElectronService ) { }

    ngOnInit () {

        this.authService.logout();

        this.signinForm = new FormGroup( {
            email: new FormControl( '', [Validators.required, Validators.email] ),
            password: new FormControl( '', Validators.required ),
            rememberMe: new FormControl( false )
        } );

    }

    signin () {

        const formData = this.signinForm.value;

        this.submitButton.disabled = true;

        this.progressBar.mode = 'indeterminate';

        this.authService
            .login( formData.email, formData.password )
            .subscribe( res => this.onSuccess( res ), err => this.onError( err ) );
    }

    onError ( error: any ) {

        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';

        let message = 'some error occured';

        if ( error != null && error.message != null ) message = error.message;

        SnackBar.error( message );

    }

    onSuccess ( response: any ) {

        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';

        SnackBar.show( 'Successfully signed in' );

        this.router.navigateByUrl( AppService.homeUrl );

    }

    onCreateAccount () {

        this.electron.shell.openExternal( AppLinks.createAccountLink );

    }

    onForgotPassword () {

        this.electron.shell.openExternal( AppLinks.forgotPasswordLink );

    }
}
