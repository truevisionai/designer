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

    get logs () { return TvConsole.logs; }

    constructor () { }

    ngOnInit () { }

    clear () {

        TvConsole.clear();

    }

}
