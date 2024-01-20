/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { IComponent } from 'app/core/game-object';
import { TvPrefab } from 'app/graphics/prefab/tv-prefab.model';
import { Object3D } from 'three';

class FlatNode extends Object3D {
	expandable: boolean;
	name: string;
	level: number;
	object: Object3D;
}

@Component( {
	selector: 'app-prefab-inspector',
	templateUrl: './prefab-inspector.component.html',
	styleUrls: [ './prefab-inspector.component.scss' ]
} )
export class PrefabInspectorComponent implements OnInit, IComponent, OnDestroy {

	currentObject: Object3D;

	data: TvPrefab;
	transformer = ( node: Object3D, level: number ) => {
		return {
			id: node.id,
			uuid: node.uuid,
			name: node.name,
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

	constructor ( private changeDet: ChangeDetectorRef ) {
	}

	hasChild = ( _: number, node: FlatNode ) => node.expandable;

	generateTreeData ( object3d: THREE.Object3D ): Object3D[] {
		// Convert the object and its children to a tree node
		const treeNode: Object3D = object3d;

		return [ treeNode ];
	}

	ngOnInit (): void {

		this.dataSource.data = this.generateTreeData( this.data );

		this.currentObject = this.data;

	}

	ngOnDestroy (): void {

		// const metadata = AssetFactory.getMeta( this.data.guid );

		// AssetFactory.updatePrefab( metadata.path, this.data );

		// AssetDatabase.setInstance( metadata.guid, this.data );

	}

	onNodeClicked ( node: FlatNode ) {

		if ( node.type == 'Mesh' ) {

			this.currentObject = node.object;

		} else {

			this.currentObject = null;

		}

		// this.changeDet.detectChanges();

		console.log( node.name );

	}

	onTransformChanged () {

		AssetDatabase.setInstance( this.data.guid, this.data );

	}

}
