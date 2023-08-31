/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { IComponent } from 'app/core/game-object';
import { PropInstance } from 'app/core/models/prop-instance.model';

// import { ProjectBrowserService } from 'app/views/editor/project-browser/project-browser.service';

@Component( {
	selector: 'app-prop-instance-inspector',
	templateUrl: './prop-instance-inspector.component.html',
	styles: [
		`.example-card {
			max-width: 400px;
		}

		.example-header-image {
			background-size: cover;
			cursor: pointer;
		}

		.example-header-image:hover {
			border: 1px solid blue;
		}

		`
	]

} )
export class PropInstanceInspectorComponent implements OnInit, IComponent, OnDestroy {

	data: PropInstance;

	// TODO: Fix Editing, Position, Rotation, Scale

	previewImage: string;

	constructor () {
	}

	get metadata () {
		return AssetDatabase.getMetadata( this.data.guid );
	}

	ngOnInit (): void {

		if ( this.data ) {

			this.previewImage = this.metadata.preview;

		}

	}

	ngOnDestroy (): void {
	}

	onPropModelClicked () {

		console.error( 'method not implemented' );
		// this.projectBrowser.showFileByGuid( this.data.guid );

	}

}
