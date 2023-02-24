/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( {
    providedIn: 'root'
} )
export class SearchService {

    public searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>( '' );
    public searchTerm$: Observable<string> = this.searchTerm.asObservable();

    constructor () {
    }
}
