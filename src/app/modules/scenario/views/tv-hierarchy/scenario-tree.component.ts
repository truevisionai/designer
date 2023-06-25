/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AppInspector } from '../../../../core/inspector';
import { MainFileService } from '../../../../services/main-file.service';
import { ContextMenuType, MenuService } from '../../../../services/menu.service';
import { ThreeService } from '../../../three-js/three.service';
import { EntityInspector } from '../../inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { TvScenario } from '../../models/tv-scenario';
import { ScenarioInstance } from '../../services/scenario-instance';

/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface ScenarioNode {
	name: string;
	type?: NodeType;
	children?: ScenarioNode[];
}

/** Flat node with expandable and level information */
interface ExampleNode {
	expandable: boolean;
	name: string;
	level: number;
	type: NodeType;
}

enum NodeType {
	VEHICLE = 'vehicle',
	PEDESTRIAN = 'pedestrian',
	TRAFFIC_LIGHT = 'traffic_light',
	HEADER = 'header',
	ROAD_NETWORK = 'road_network'
}

// @Component( {
// 	selector: 'app-scenario-tree',
// 	templateUrl: './scenario-tree.component.html',
// } )
// export class ScenarioTreeComponent implements OnInit {


// }
