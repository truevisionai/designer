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
import { ActionEditorComponent } from './views/tv-story-editor/action-editor/action-editor.component';
import {
	FollowTrajectoryActionComponent
} from './views/tv-story-editor/actions/private-actions/follow-trajectory-action/follow-trajectory-action.component';
import { LaneChangeActionComponent } from './views/tv-story-editor/actions/private-actions/lane-change-action/lane-change-action.component';
import {
	PositionActionEditorComponent
} from './views/tv-story-editor/actions/private-actions/position-action-editor/position-action-editor.component';
import { SpeedActionComponent } from './views/tv-story-editor/actions/private-actions/speed-action/speed-action.component';
import { ConditionEditorComponent } from './views/tv-story-editor/condition-editor/condition-editor.component';
import {
	DistanceConditionEditorComponent
} from './views/tv-story-editor/conditions/by-entity/distance-condition-editor/distance-condition-editor.component';
import {
	ReachPositionConditionEditorComponent
} from './views/tv-story-editor/conditions/by-entity/reach-position-condition-editor/reach-position-condition-editor.component';
import {
	RelativeSpeedConditionEditorComponent
} from './views/tv-story-editor/conditions/by-entity/relative-speed-condition-editor/relative-speed-condition-editor.component';
import {
	SpeedConditionEditorComponent
} from './views/tv-story-editor/conditions/by-entity/speed-condition-editor/speed-condition-editor.component';
import {
	TimeHeadwayConditionEditorComponent
} from './views/tv-story-editor/conditions/by-entity/time-headway-condition-editor/time-headway-condition-editor.component';
import {
	TraveledDistanceConditionEditorComponent
} from './views/tv-story-editor/conditions/by-entity/traveled-distance-condition-editor/traveled-distance-condition-editor.component';
import {
	SimulationTimeConditionEditorComponent
} from './views/tv-story-editor/conditions/by-value/simulation-time-condition-editor/simulation-time-condition-editor.component';
import { ConditionByEntityComponent } from './views/tv-story-editor/conditions/condition-by-entity/condition-by-entity.component';
import { DynamicsEditorComponent } from './views/tv-story-editor/dynamics-editor/dynamics-editor.component';
import { EventEditorComponent } from './views/tv-story-editor/event-editor/event-editor.component';
import { ManeuverEditorComponent } from './views/tv-story-editor/maneuver-editor/maneuver-editor.component';
import { PositionEditorComponent } from './views/tv-story-editor/position-editor/position-editor.component';
import { LanePositionEditorComponent } from './views/tv-story-editor/positions/lane-position-editor/lane-position-editor.component';
import {
	RelativeObjectPositionEditorComponent
} from './views/tv-story-editor/positions/relative-object-position-editor/relative-object-position-editor.component';
import { RoadPositionEditorComponent } from './views/tv-story-editor/positions/road-position-editor/road-position-editor.component';
import { WorldPositionEditorComponent } from './views/tv-story-editor/positions/world-position-editor/world-position-editor.component';
import { TargetEditorComponent } from './views/tv-story-editor/target-editor/target-editor.component';

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
		ActionEditorComponent,
		PositionEditorComponent,
		EventEditorComponent,
		ConditionEditorComponent,
		ManeuverEditorComponent,
		DistanceConditionEditorComponent,
		WorldPositionEditorComponent,
		RelativeObjectPositionEditorComponent,
		SimulationTimeConditionEditorComponent,
		// ChooseActionDialogComponent,
		SpeedActionComponent,
		TargetEditorComponent,
		DynamicsEditorComponent,
		LaneChangeActionComponent,
		// EditStoryDialog,
		// EditObjectInitDialog,
		PositionActionEditorComponent,
		RoadPositionEditorComponent,
		LanePositionEditorComponent,
		TrajectoryInspectorComponent,
		ActionsInspectorComponent,
		FollowTrajectoryActionComponent,
		TrajectoriesInspectorComponent,
		// NewScenarioDialogComponent,
		// EditActionsDialogComponent,
		// ActEditorComponent,
		// ChooseConditionDialogComponent,
		ParamatersInspectorComponent,
		ReachPositionConditionEditorComponent,
		RelativeSpeedConditionEditorComponent,
		SpeedConditionEditorComponent,
		TraveledDistanceConditionEditorComponent,
		ConditionByEntityComponent,
		TimeHeadwayConditionEditorComponent,
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
		FollowTrajectoryActionComponent,
		TrajectoriesInspectorComponent,
		NewScenarioDialogComponent,
		ActEditorComponent,
		ChooseConditionDialogComponent,
		SpeedActionComponent,
		ParamatersInspectorComponent,
		EventEditorComponent
	]
} )
export class OpenScenarioModule {
}
