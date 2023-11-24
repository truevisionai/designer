/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AssetNode } from '../file-node.model';
import { ProjectBrowserService } from '../project-browser.service';
import { MatTreeNestedDataSource } from "@angular/material/tree";

@Component( {
	selector: 'app-project-hierarchy',
	templateUrl: './project-hierarchy.component.html',
	styleUrls: [ './project-hierarchy.component.css' ]
} )
export class ProjectHierarchyComponent implements OnInit {

	@Input() treeControl;
	@Input() dataSource: MatTreeNestedDataSource<AssetNode>;

	selectedFolder: AssetNode;

	constructor (
		private projectBrowser: ProjectBrowserService
	) { }

	hasChild = ( _: number, node: AssetNode ) => true;

	ngOnInit () {
	}

	onClick ( node: AssetNode ) {

		this.selectedFolder = node;

		this.projectBrowser.folderChanged.emit( node );

	}
}
