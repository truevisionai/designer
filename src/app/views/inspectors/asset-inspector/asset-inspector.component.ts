/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ComponentFactoryResolver, Input, OnDestroy, OnInit } from '@angular/core';
import { Asset } from 'app/assets/asset.model';
import { DynamicInspectorComponent } from '../dynamic-inspector/dynamic-inspector.component';

@Component( {
	selector: 'app-assets-inspector',
	templateUrl: './asset-inspector.component.html',
	styleUrls: [ './asset-inspector.component.scss' ]
} )
export class AssetInspectorComponent extends DynamicInspectorComponent implements OnDestroy {

	@Input() data: Asset;

	constructor (
		componentFactoryResolver: ComponentFactoryResolver,
	) {
		super( componentFactoryResolver );
	}

	ngOnDestroy (): void {

		super.ngOnDestroy();

	}

}
