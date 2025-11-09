/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoad } from 'app/map/models/tv-road.model';

export enum MapHierarchyNodeType {
	Road = 'road',
	LaneSection = 'lane-section',
	Lane = 'lane',
}

export type MapHierarchyNodeData = TvRoad | TvLaneSection | TvLane;

export interface MapHierarchyNestedNode {
	id: string;
	label: string;
	type: MapHierarchyNodeType;
	data: MapHierarchyNodeData;
	children?: MapHierarchyNestedNode[];
	parentRoadId?: number;
}

export interface MapHierarchyFlatNode extends MapHierarchyNestedNode {
	level: number;
	expandable: boolean;
}
