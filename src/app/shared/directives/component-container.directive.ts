/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Directive, ViewContainerRef } from '@angular/core';

@Directive( {
	selector: '[appComponentContainer]'
} )
export class ComponentContainerDirective {

	constructor ( public viewContainerRef: ViewContainerRef ) {
	}

}
