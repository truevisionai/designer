/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

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
