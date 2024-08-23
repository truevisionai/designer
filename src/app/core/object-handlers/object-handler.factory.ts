/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class ObjectHandlerFactory {

	constructor ( private injector: Injector ) {
	}

}