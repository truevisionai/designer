import { Component, ComponentFactoryResolver, Input, OnDestroy, OnInit } from '@angular/core';
import { AssetService } from 'app/core/asset/asset.service';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { DynamicInspectorComponent } from '../dynamic-inspector/dynamic-inspector.component';

@Component( {
	selector: 'app-asset-inspector',
	templateUrl: './asset-inspector.component.html',
	styleUrls: [ './asset-inspector.component.scss' ]
} )
export class AssetInspectorComponent extends DynamicInspectorComponent implements OnDestroy {

	@Input() data: AssetNode;

	constructor (
		componentFactoryResolver: ComponentFactoryResolver,
		private assetSerice: AssetService,
	) {
		super( componentFactoryResolver );
	}

	ngOnDestroy (): void {

		super.ngOnDestroy();

		this.assetSerice.saveAsset( this.data );

	}

}
