import { Component, OnInit } from '@angular/core';
import { VehicleActorTool } from '../../../../core/tools/vehicle-actor-tool';
import { BaseTool } from '../../../../core/tools/base-tool';
import { ToolManager } from '../../../../core/tools/tool-manager';

@Component( {
    selector: 'app-osc-tool-bar',
    templateUrl: './osc-tool-bar.component.html'
} )
export class OscToolBarComponent implements OnInit {

    addVehicleTool = VehicleActorTool;

    // temp
    addPedestrianTool = OscToolBarComponent;
    addBikeTool = OscToolBarComponent;

    selectedToolName: string;

    constructor () {

    }

    ngOnInit () {

        ToolManager.toolChanged.subscribe( e => this.onToolChanged( e ) );

    }

    addVehicle () {

        ToolManager.currentTool = new VehicleActorTool();

    }

    addPedestrian () {

        ToolManager.clear();

    }

    addBike () {

        ToolManager.clear();

    }

    private onToolChanged ( tool: BaseTool ) {

        if ( tool === null ) {

            this.selectedToolName = null;

        } else {

            this.selectedToolName = tool.name;

        }
    }
}
