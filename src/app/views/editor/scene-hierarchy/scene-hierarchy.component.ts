/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SceneService } from 'app/services/scene.service';
import { Subscription } from 'rxjs';
import { Object3D } from 'three';
import { Environment } from "../../../core/utils/environment";

class FlatNode extends Object3D {
	expandable: boolean;
	name: string;
	level: number;
	object: Object3D;
}

@Component( {
	selector: 'app-scene-hierarchy',
	templateUrl: './scene-hierarchy.component.html',
	styleUrls: [ './scene-hierarchy.component.scss' ]
} )
export class SceneHierarchyComponent implements OnInit, OnDestroy {

	showProperties = false;

	toggleProperties () {
		this.showProperties = !this.showProperties;
	}

	transformer = ( node: Object3D, level: number ) => {
		const name = this.debug ? node.id + ':' + node.name + ':' + node.type : node.name;
		return {
			id: node.id,
			uuid: node.uuid,
			name: name,
			type: node.type,
			children: node.children,
			expandable: !!node.children && node.children.length > 0,
			level: level,
			object: node,
		};
	};

	treeFlattener = new MatTreeFlattener( this.transformer, node => node.level, node => node.expandable, node => node.children );

	treeControl = new FlatTreeControl<FlatNode>( node => node.level, node => node.expandable );

	dataSource = new MatTreeFlatDataSource( this.treeControl, this.treeFlattener );

	private sceneChangedSubscription: Subscription;

	private debug = !Environment.production;

	private timeoutId: any = null;

	private readonly debounceDuration = 100; // duration in milliseconds

	constructor (
		private changeDet: ChangeDetectorRef,
		private sceneService: SceneService,
	) {
	}

	hasChild = ( _: number, node: FlatNode ) => node.expandable;

	generateTreeData ( object3d: THREE.Object3D ): Object3D[] {
		// Convert the object and its children to a tree node
		const treeNode: Object3D = object3d;

		return [ treeNode ];
	}

	get children () {

		if ( this.debug ) {
			return this.sceneService.scene;
		}

		return this.sceneService.mainLayer;
	}

	ngOnInit (): void {

		this.dataSource.data = this.generateTreeData( this.children );

		this.sceneChangedSubscription = SceneService.changed.subscribe( () => {

			// If there's a pending execution, cancel it
			if ( this.timeoutId ) {
				clearTimeout( this.timeoutId );
			}

			// Schedule a new execution
			this.timeoutId = setTimeout( () => {

				this.onSceneChanged();

			}, this.debounceDuration );

		} );

	}

	onSceneChanged (): void {

		this.dataSource.data = this.generateTreeData( this.children );

		this.changeDet.detectChanges();

	}

	ngOnDestroy (): void {

		this.sceneChangedSubscription?.unsubscribe();

	}

	onNodeClicked ( node: FlatNode ) {

	}
}
