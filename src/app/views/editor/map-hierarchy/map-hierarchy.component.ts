/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Subscription } from 'rxjs';
import { MapEvents } from 'app/events/map-events';
import { MapService } from 'app/services/map/map.service';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { SplineDebugService } from 'app/services/debug/spline-debug.service';
import { DebugState } from 'app/services/debug/debug-state';
import { MapHierarchyBuilder } from './map-hierarchy.builder';
import { MapHierarchyFocusService } from './map-hierarchy-focus.service';
import {
	MapHierarchyFlatNode,
	MapHierarchyNestedNode,
	MapHierarchyNodeType
} from './map-hierarchy.models';

const REFRESH_DEBOUNCE_MS = 120;

@Component( {
	selector: 'app-map-hierarchy',
	templateUrl: './map-hierarchy.component.html',
	styleUrls: [ './map-hierarchy.component.scss' ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class MapHierarchyComponent implements OnInit, OnDestroy {

	treeControl = new FlatTreeControl<MapHierarchyFlatNode>( node => node.level, node => node.expandable );

	private transformer = ( node: MapHierarchyNestedNode, level: number ): MapHierarchyFlatNode => ( {
		...node,
		level,
		expandable: !!node.children && node.children.length > 0,
	} );

	private treeFlattener = new MatTreeFlattener<MapHierarchyNestedNode, MapHierarchyFlatNode>(
		this.transformer,
		node => node.level,
		node => node.expandable,
		node => node.children ?? []
	);

	dataSource = new MatTreeFlatDataSource( this.treeControl, this.treeFlattener );

	selectedNodeId?: string;

	private readonly subscriptions = new Subscription();

	private refreshTimer?: ReturnType<typeof setTimeout>;

	private highlightedRoad?: TvRoad;

	private highlightedSpline?: AbstractSpline;

	constructor (
		private readonly mapService: MapService,
		private readonly builder: MapHierarchyBuilder,
		private readonly focusService: MapHierarchyFocusService,
		private readonly changeDetector: ChangeDetectorRef,
		private readonly roadDebug: RoadDebugService,
		private readonly splineDebug: SplineDebugService,
	) {
	}

	hasChild = ( _: number, node: MapHierarchyFlatNode ) => node.expandable;

	ngOnInit (): void {
		this.loadTree();
		this.listenToMapEvents();
	}

	ngOnDestroy (): void {
		this.subscriptions.unsubscribe();
		if ( this.refreshTimer ) {
			clearTimeout( this.refreshTimer );
		}
		this.clearRoadHighlight();
	}

	onNodeClicked ( node: MapHierarchyFlatNode ): void {

		if ( !node ) return;

		this.clearRoadHighlight();

		this.selectedNodeId = node.id;

		this.selectNode( node );

		this.focusService.focus( node.data );

		this.changeDetector.markForCheck();
	}

	isSelected ( node: MapHierarchyFlatNode ): boolean {
		return node.id === this.selectedNodeId;
	}

	refreshTree (): void {
		this.loadTree();
	}

	getNodeIcon ( node: MapHierarchyFlatNode ): string {
		switch ( node.type ) {
			case MapHierarchyNodeType.Road:
				return 'alt_route';
			case MapHierarchyNodeType.LaneSection:
				return 'account_tree';
			case MapHierarchyNodeType.Lane:
			default:
				return 'linear_scale';
		}
	}

	private selectNode ( node: MapHierarchyFlatNode ): void {

		switch ( node.type ) {
			case MapHierarchyNodeType.Road:
				this.highlightRoad( node.data as TvRoad );
				return;

			case MapHierarchyNodeType.LaneSection: {
				this.clearRoadHighlight();
				const section = node.data as TvLaneSection;
				const parentRoad = section?.getRoad?.() ?? section?.road;
				if ( parentRoad ) {
					this.highlightRoad( parentRoad );
				}
				return;
			}

			default:
				this.clearRoadHighlight();
		}
	}

	private listenToMapEvents (): void {

		const rebuildEmitters = [
			MapEvents.mapImported,
			MapEvents.mapRemoved,
			MapEvents.roadCreated,
			MapEvents.roadRemoved,
			MapEvents.roadUpdated,
			MapEvents.laneCreated,
			MapEvents.laneRemoved,
			MapEvents.laneUpdated,
		];

		rebuildEmitters.forEach( emitter => {
			this.subscriptions.add( emitter.subscribe( () => this.scheduleRefresh() ) );
		} );
	}

	private scheduleRefresh (): void {

		if ( this.refreshTimer ) {
			clearTimeout( this.refreshTimer );
		}

		this.refreshTimer = setTimeout( () => this.loadTree(), REFRESH_DEBOUNCE_MS );
	}

	private loadTree (): void {

		this.dataSource.data = this.builder.build( this.mapService.roads );

		this.changeDetector.markForCheck();
	}

	private highlightRoad ( road: TvRoad ): void {

		if ( !road ) return;

		if ( this.highlightedRoad && this.highlightedRoad !== road ) {
			this.roadDebug.unHighlightRoad( this.highlightedRoad );
		}

		this.roadDebug.highlightRoad( road );
		this.highlightedRoad = road;

		const spline = road?.spline;

		if ( this.highlightedSpline && this.highlightedSpline !== spline ) {
			this.splineDebug.setDebugState( this.highlightedSpline, DebugState.DEFAULT );
		}

		if ( spline ) {
			this.splineDebug.highlight( spline );
			this.highlightedSpline = spline;
		} else {
			this.highlightedSpline = undefined;
		}
	}

	private clearRoadHighlight (): void {

		if ( this.highlightedRoad ) {
			this.highlightedRoad = undefined;
		}

		if ( this.highlightedSpline ) {
			this.highlightedSpline = undefined;
		}

		this.splineDebug.clear();
	}
}
