/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component( {
    selector: 'app-app-loader',
    templateUrl: './app-loader.component.html',
    styleUrls: [ './app-loader.component.css' ]
} )
export class AppLoaderComponent implements OnInit {
    title;
    message;

    constructor ( public dialogRef: MatDialogRef<AppLoaderComponent> ) {
    }

    ngOnInit () {
    }

}
