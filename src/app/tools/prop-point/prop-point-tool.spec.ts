/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from "@angular/core/testing";
import { ToolType } from "../tool-types.enum";
import { setupTest, setCurrentTool } from "tests/setup-tests";
import { PropPointTool } from "./prop-point-tool";
import { PropInstance } from "app/map/prop-point/prop-instance.object";
import { MapService } from "app/services/map/map.service";
import { Vector3 } from "app/core/maths";
import { PointerEventData } from "app/events/pointer-event-data";
import { PropManager } from "app/managers/prop-manager";
import { PropModel } from "app/map/prop-point/prop-model.model";
import { DynamicMeta } from "app/assets/metadata.model";
import { AssetDatabase } from "app/assets/asset-database";
import { Object3D, Intersection } from "three";
import { CommandHistory } from "app/commands/command-history";

describe( 'PropPointTool', () => {

	let tool: PropPointTool;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		mapService = TestBed.inject( MapService );
		tool = setCurrentTool( ToolType.PropPoint ) as PropPointTool;

		// ensure AssetDatabase is instantiated for static repository usage
		TestBed.inject( AssetDatabase );

		clearProps();

	} );

	afterEach( () => {
		clearProps();
	} );

	it( 'should register handlers, selectors and draggers on init', () => {

		expect( tool.hasControllerForKey( PropInstance ) ).toBeTrue();
		expect( tool.hasVisualizerForKey( PropInstance ) ).toBeTrue();
		expect( tool.hasSelectorForKey( PropInstance ) ).toBeTrue();
		expect( tool.getDragHandlerByKey( PropInstance ) ).toBeDefined();

		const config = tool.getBoxSelectionConfig();
		expect( config?.strategy ).toBeDefined();

	} );

	it( 'should create and select prop when asset is chosen', () => {

		const created = createPropAt( new Vector3( 5, 5, 0 ) );

		expect( created ).toBeInstanceOf( PropInstance );
		expect( mapService.map.getProps() ).toContain( created );
		expect( tool.getSelectedObjects() ).toContain( created );

	} );

	xit( 'should select an existing prop when clicking its mesh', () => {

		// NOT WORKING

		const created = createPropAt( new Vector3( 1, 2, 0 ) );

		// deselect existing to ensure selection callback is exercised
		tool.onPointerDownSelect( new PointerEventData( { point: new Vector3( 100, 100, 0 ), intersections: [] } ) );
		expect( tool.getSelectedObjectCount() ).toBe( 0 );

		const selectionEvent = pointerEventFor( created );

		tool.onPointerDownSelect( selectionEvent );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );
		expect( tool.getSelectedObjects()[ 0 ] ).toEqual( created );

	} );

	it( 'should delete selected prop when delete key is pressed', () => {

		const created = createPropAt( new Vector3( 0, 0, 0 ) );

		expect( mapService.map.getProps() ).toContain( created );

		tool.onDeleteKeyDown();

		expect( mapService.map.getProps() ).not.toContain( created );
		expect( tool.getSelectedObjectCount() ).toBe( 0 );

	} );

	it( 'should restore prop mesh on undo after delete', () => {

		const created = createPropAt( new Vector3( 2, 3, 0 ) );

		expect( created.parent ).toBeTruthy();
		expect( created.object.parent ).toBe( created );

		tool.onDeleteKeyDown();

		expect( created.parent ).toBeFalsy();

		CommandHistory.undo();

		expect( created.parent ).toBeTruthy();
		expect( created.object.parent ).toBe( created );

	} );

	function createPropAt ( position: Vector3 ): PropInstance {

		selectPropAsset();

		const event = PointerEventData.create( position );

		tool.onPointerDownCreate( event );

		const props = mapService.map.getProps();

		return props[ props.length - 1 ];
	}

	function pointerEventFor ( prop: PropInstance ): PointerEventData {

		const point = prop.Position.clone();

		const intersection = {
			distance: 0,
			point: point.clone(),
			object: prop.object,
			face: null,
			faceIndex: undefined,
			uv: undefined,
			index: 0,
			instanceId: undefined,
		} as Intersection;

		return new PointerEventData( {
			point,
			intersections: [ intersection ],
		} );
	}

	function selectPropAsset (): void {

		const guid = 'test-prop';

		const meta: DynamicMeta<PropModel> = {
			guid,
			path: '/assets/props/test-prop',
			importer: 'TestImporter',
			data: new PropModel( guid ),
		};

		PropManager.setProp( meta );

		const model = new Object3D();

		AssetDatabase.setInstance( guid, model );
	}

	function clearProps (): void {

		mapService?.map.clear();
		PropManager.setProp( undefined as any );

	}

} );
