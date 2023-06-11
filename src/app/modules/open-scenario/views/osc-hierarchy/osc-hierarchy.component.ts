import { Component, Input, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { OpenScenario } from '../../models/osc-scenario';
import { OscDialogService } from '../../services/osc-dialog.service';
import { OscEditor } from '../osc-editor/osc-editor';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscEntityInspector } from '../../inspectors/osc-entity-inspector/osc-entity-inspector.component';
import { AppInspector } from '../../../../core/inspector';
import { ContextMenuType, MenuService } from '../../../../services/menu.service';
import { ThreeService } from '../../../three-js/three.service';

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

@Component( {
    selector: 'app-osc-hierarchy',
    templateUrl: './osc-hierarchy.component.html',
} )
export class OscHierarchyComponent implements OnInit {


    @Input() scenario: OpenScenario;
    transformer = ( node: ScenarioNode, level: number ) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level: level,
            type: node.type,
        };
    };
    treeFlattener = new MatTreeFlattener( this.transformer, node => node.level, node => node.expandable, node => node.children );
    treeControl = new FlatTreeControl<ExampleNode>( node => node.level, node => node.expandable );
    dataSource = new MatTreeFlatDataSource( this.treeControl, this.treeFlattener );

    constructor (
        private dialogs: OscDialogService,
        private menuService: MenuService,
        private threeService: ThreeService
    ) {

        OscEditor.scenarioChanged.subscribe( () => {

            this.buildHierarchy();

        } );

    }

    hasChild = ( _: number, node: ExampleNode ) => node.expandable;

    ngOnInit () {

        this.buildHierarchy();

        this.registerContextMenu();

    }

    registerContextMenu (): any {

        this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [ {
            label: 'Add Vehicle',
            click: () => { this.dialogs.openAddVehicleDialog(); }
        } ] );

    }

    buildHierarchy () {

        var data: ScenarioNode[] = [
            {
                name: 'Header',
                type: NodeType.HEADER
            },
            {
                name: 'Road Network',
                type: NodeType.ROAD_NETWORK
            }
        ];

        var entityNode = {
            name: 'Entities',
            children: []
        };

        data.push( entityNode );

        this.scenario.objects.forEach( element => {

            entityNode.children.push( {
                name: element.name,
                type: NodeType.VEHICLE
            } );

        } );

        this.dataSource.data = data;

    }

    onClick ( node: ExampleNode ) {

        switch ( node.type ) {

            case NodeType.VEHICLE:
                this.openVehicleInspector( node );
                break;

            case NodeType.HEADER:
                this.openHeaderInspector( node );
                break;

            case NodeType.ROAD_NETWORK:
                this.openRoadNetworkDialog( node );
                break;

            default:
                break;
        }

    }

    onDoubleClick ( node: ExampleNode ) {

        switch ( node.type ) {

            case NodeType.VEHICLE:
                this.openVehicleInspector( node );
                break;

            case NodeType.HEADER:
                this.openHeaderInspector( node );
                break;

            case NodeType.ROAD_NETWORK:
                this.openRoadNetworkDialog( node );
                break;

            default:
                break;
        }

    }

    openRoadNetworkDialog ( node: ExampleNode ) {

        this.dialogs.openEditRoadNetworkDialog( null );

    }

    openHeaderInspector ( node: ExampleNode ) {


    }

    openVehicleInspector ( node: ExampleNode ) {


        var object = OscSourceFile.openScenario.objects.get( node.name );

        // SceneService.select( object.gameObject );
        // SceneService.focus( object.gameObject );

        // OscEditor.selectedEntityChanged.emit( object );

        this.threeService.focus( object.gameObject );

        AppInspector.setInspector( OscEntityInspector, object );

    }

    showContextMenu ( $event: MouseEvent ) {

        $event.preventDefault();

        this.menuService.showContextMenu( ContextMenuType.HIERARCHY );

    }
}
