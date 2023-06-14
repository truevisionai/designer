/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule, FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from '../../shared/shared.module';
import { ThreeJsModule } from '../three-js/three-js.module';
import { TvMapModule } from '../tv-map/tv-map.module';
import { AddEntityInitDialogComponent } from './dialogs/add-entity-init-dialog/add-entity-init-dialog.component';
import { AddVehicleDialogComponent } from './dialogs/add-vehicle-dialog/add-vehicle-dialog.component';
import { ChooseActionDialogComponent } from './dialogs/choose-action-dialog/choose-action-dialog.component';
import { ChooseConditionDialogComponent } from './dialogs/choose-condition-dialog/choose-condition-dialog.component';
import { EditActionComponent } from './dialogs/edit-actions-dialog/edit-action/edit-action.component';
import { EditEventsComponent } from './dialogs/edit-actions-dialog/edit-events/edit-events.component';
import { EditManeuverComponent } from './dialogs/edit-actions-dialog/edit-maneuver/edit-maneuver.component';
import { EditObjectInitDialog } from './dialogs/edit-object-init-dialog/edit-object-init.dialog';
import { EditPositionDialogComponent } from './dialogs/edit-position-dialog/edit-position-dialog.component';
import { EditRoadNetworkDialogComponent } from './dialogs/edit-road-network-dialog/edit-road-network-dialog.component';
import { EditStoryDialog } from './dialogs/edit-story-dialog/edit-story-dialog.component';
import { NewScenarioDialogComponent } from './dialogs/new-scenario-dialog/new-scenario-dialog.component';
import { ActionsInspectorComponent } from './inspectors/tv-actions-inspector/tv-player-actions-inspector.component';
import { EntityInspector } from './inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { FileHeaderComponent } from './inspectors/tv-file-header/tv-file-header.component';
import { ParamatersInspectorComponent } from './inspectors/tv-paramaters-inspector/tv-paramaters-inspector.component';
import { TrajectoriesInspectorComponent } from './inspectors/tv-trajectories-inspector/tv-trajectories-inspector.component';
import { TrajectoryInspectorComponent } from './inspectors/tv-trajectory-inspector/tv-trajectory-inspector.component';
import { ActEditorComponent } from './views/tv-act-editor/tv-act-editor.component';
import { HierarchyComponent } from './views/tv-hierarchy/tv-hierarchy.component';
import { ActionComponent } from './views/action/action.component';
import {
	FollowTrajectoryComponent
} from './views/actions/follow-trajectory/follow-trajectory.component';
import { LaneChangeComponent } from './views/actions/lane-change/lane-change.component';
import {
	PositionActionComponent
} from './views/actions/position-action/position-action.component';
import { SpeedActionComponent } from './views/actions/speed-action/speed-action.component';
import { ConditionEditorComponent } from './views/condition-editor/condition-editor.component';
import {
	DistanceConditionComponent
} from './views/conditions/distance-condition/distance-condition.component';
import {
	ReachPositionConditionComponent
} from './views/conditions/reach-position-condition/reach-position-condition.component';
import {
	RelativeSpeedConditionEditorComponent
} from './views/conditions/relative-speed-condition-editor/relative-speed-condition-editor.component';
import {
	SpeedConditionEditorComponent
} from './views/conditions/speed-condition-editor/speed-condition-editor.component';
import {
    StandStillConditionEditorComponent
} from './views/conditions/stand-still-condition-editor/stand-still-condition-editor.component';
import {
	TimeHeadwayConditionEditorComponent
} from './views/conditions/time-headway-condition-editor/time-headway-condition-editor.component';
import {
	TraveledDistanceConditionEditorComponent
} from './views/conditions/traveled-distance-condition-editor/traveled-distance-condition-editor.component';
import {
	SimulationTimeConditionEditorComponent
} from './views/conditions/simulation-time-condition-editor/simulation-time-condition-editor.component';
import { ConditionByEntityComponent } from './views/conditions/condition-by-entity/condition-by-entity.component';
import { DynamicsEditorComponent } from './views/dynamics-editor/dynamics-editor.component';
import { EventEditorComponent } from './views/event-editor/event-editor.component';
import { ManeuverEditorComponent } from './views/maneuver-editor/maneuver-editor.component';
import { PositionEditorComponent } from './views/position-editor/position-editor.component';
import { LanePositionEditorComponent } from './views/positions/lane-position-editor/lane-position-editor.component';
import {
	RelativeObjectPositionEditorComponent
} from './views/positions/relative-object-position-editor/relative-object-position-editor.component';
import { RoadPositionEditorComponent } from './views/positions/road-position-editor/road-position-editor.component';
import { WorldPositionEditorComponent } from './views/positions/world-position-editor/world-position-editor.component';
import { TargetEditorComponent } from './views/target-editor/target-editor.component';

@NgModule( {
    declarations: [
        // EditorComponent,
        // EditorLayoutComponent,
        // MenuBarComponent,
        HierarchyComponent,
        EntityInspector,
        FileHeaderComponent,
        // AddVehicleDialogComponent,
        // EditPositionDialogComponent,
        AddEntityInitDialogComponent,
        // EditRoadNetworkDialogComponent,
        EditManeuverComponent,
        EditEventsComponent,
        EditActionComponent,
        ActionComponent,
        PositionEditorComponent,
        EventEditorComponent,
        ConditionEditorComponent,
        ManeuverEditorComponent,
        DistanceConditionComponent,
        WorldPositionEditorComponent,
        RelativeObjectPositionEditorComponent,
        SimulationTimeConditionEditorComponent,
        // ChooseActionDialogComponent,
        SpeedActionComponent,
        TargetEditorComponent,
        DynamicsEditorComponent,
        LaneChangeComponent,
        // EditStoryDialog,
        // EditObjectInitDialog,
        PositionActionComponent,
        RoadPositionEditorComponent,
        LanePositionEditorComponent,
        TrajectoryInspectorComponent,
        ActionsInspectorComponent,
        FollowTrajectoryComponent,
        TrajectoriesInspectorComponent,
        // NewScenarioDialogComponent,
        // EditActionsDialogComponent,
        // ActEditorComponent,
        // ChooseConditionDialogComponent,
        ParamatersInspectorComponent,
        ReachPositionConditionComponent,
        RelativeSpeedConditionEditorComponent,
        SpeedConditionEditorComponent,
        TraveledDistanceConditionEditorComponent,
        ConditionByEntityComponent,
        TimeHeadwayConditionEditorComponent,
        StandStillConditionEditorComponent,
    ],
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		ThreeJsModule,
		CoreModule,
		PerfectScrollbarModule,
		FlexLayoutModule,
		FlexModule,
		TvMapModule,
		MatStepperModule,
	],
	entryComponents: [
		EntityInspector,
		AddVehicleDialogComponent,
		EditPositionDialogComponent,
		AddEntityInitDialogComponent,
		EditRoadNetworkDialogComponent,
		ChooseActionDialogComponent,
		EditStoryDialog,
		EditObjectInitDialog,
		TrajectoryInspectorComponent,
		ActionsInspectorComponent,
		FollowTrajectoryComponent,
		TrajectoriesInspectorComponent,
		NewScenarioDialogComponent,
		ActEditorComponent,
		ChooseConditionDialogComponent,
		SpeedActionComponent,
		ParamatersInspectorComponent,
		EventEditorComponent
	]
} )
export class ScenarioModule {
}
