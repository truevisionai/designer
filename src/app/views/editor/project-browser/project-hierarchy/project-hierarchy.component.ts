/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileNode } from "../file-node.model";

@Component( {
    selector: 'app-project-hierarchy',
    templateUrl: './project-hierarchy.component.html',
    styleUrls: [ './project-hierarchy.component.css' ]
} )
export class ProjectHierarchyComponent implements OnInit {

    @Output() folderChanged = new EventEmitter<FileNode>();

    @Input() treeControl;
    @Input() dataSource;

    selectedFolder;

    getLevel = ( node: FileNode ) => node.level;
    isExpandable = ( node: FileNode ) => node.expandable;
    hasChild = ( _: number, node: FileNode ) => true;

    constructor () { }

    ngOnInit () {
    }

    onClick ( node: FileNode ) {

        // console.log( 'folder-selected-in-hierarchy', node.name );

        this.selectedFolder = node;

        this.folderChanged.emit( node );

    }
}
