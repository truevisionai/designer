/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { IComponent } from 'app/core/game-object';
import { DynamicMeta } from 'app/core/models/metadata.model';
import { PropModel } from 'app/core/models/prop-model.model';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/services/prop-manager';
import { Object3D, Vector3 } from 'three';

interface ObjectTreeNode {
	name: string;
	children?: ObjectTreeNode[];
}

interface FlatNode {
	expandable: boolean;
	name: string;
	level: number;
}

@Component( {
	selector: 'app-prop-model-inspector',
	templateUrl: './prop-model-inspector.component.html'
} )
export class PropModelInspectorComponent implements OnInit, IComponent, OnDestroy {

	private _transformer = ( node: ObjectTreeNode, level: number ) => {
		return {
			expandable: !!node.children && node.children.length > 0,
			name: node.name,
			level: level,
		};
	}

	treeControl = new FlatTreeControl<FlatNode>(
		node => node.level, node => node.expandable );

	treeFlattener = new MatTreeFlattener(
		this._transformer, node => node.level, node => node.expandable, node => node.children );

	dataSource = new MatTreeFlatDataSource( this.treeControl, this.treeFlattener );


	public data: DynamicMeta<PropModel>;

	public rotationVariance: Vector3;

	public scaleVariance: Vector3;

	public object: Object3D;

	constructor ( private assetService: AssetLoaderService ) {

	}

	hasChild = ( _: number, node: FlatNode ) => node.expandable;

	generateTreeData ( object3d: THREE.Object3D ): ObjectTreeNode[] {
		// Convert the object and its children to a tree node
		const treeNode: ObjectTreeNode = {
			name: object3d.name + ':' + object3d.type,
			children: object3d.children.map( child => this.generateTreeData( child )[ 0 ] ),
		};

		return [ treeNode ];
	}

	get prop () {
		return this.data.data as PropModel;
	}


	ngOnInit () {

		// this.rotationVariance = new Vector3( this.prop.rotationVariance.x, this.prop.rotationVariance.y, this.prop.rotationVariance.z );

		// this.scaleVariance = new Vector3( this.prop.scaleVariance.x, this.prop.scaleVariance.y, this.prop.scaleVariance.z );

		this.object = AssetDatabase.getInstance( this.data.guid ) as Object3D;

		console.log( this.object );

		PropManager.setProp( this.data );

		this.dataSource.data = this.generateTreeData( this.object );
	}

	ngOnDestroy () {

		this.updateAssetFile();

	}

	updateAssetFile () {

		// AssetFactory.updatePropModelByGuid( this.data.guid, this.prop );

	}

	rotationChanged () {

		this.updateAssetFile();

		CommandHistory.execute( new SetValueCommand( this.prop, 'rotationVariance', this.rotationVariance ) );
	}

	scaleChanged () {

		this.updateAssetFile();

		CommandHistory.execute( new SetValueCommand( this.prop, 'scaleVariance', this.scaleVariance ) );
	}

	onNodeClicked ( node: ObjectTreeNode ) {
		console.log( node.name );
	}
}
