/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule, FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from '../../shared/shared.module';
import { ThreeJsModule } from '../three-js/three-js.module';
import { TvMapModule } from '../tv-map/tv-map.module';
import { ImportOpenScenarioDialogComponent } from './dialogs/tutorials-dialog/import-open-scenario-dialog.component';
import { EntityEventInspectorComponent } from './inspectors/entity-event-inspector/entity-event-inspector.component';
import { ActionsInspectorComponent } from './inspectors/tv-actions-inspector/tv-player-actions-inspector.component';
import { EntityInspector } from './inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { FileHeaderComponent } from './inspectors/tv-file-header/tv-file-header.component';
import { ParamatersInspectorComponent } from './inspectors/tv-paramaters-inspector/tv-paramaters-inspector.component';
import { TrajectoriesInspectorComponent } from './inspectors/tv-trajectories-inspector/tv-trajectories-inspector.component';
import { TrajectoryInspectorComponent } from './inspectors/tv-trajectory-inspector/tv-trajectory-inspector.component';
import { ScenarioInstance } from './services/scenario-instance';
import { ActionComponent } from './views/action/action.component';
import { FollowTrajectoryComponent } from './views/actions/follow-trajectory/follow-trajectory.component';
import { LaneChangeComponent } from './views/actions/lane-change/lane-change.component';
import { LaneOffsetActionComponent } from './views/actions/lane-offset-action/lane-offset-action.component';
import { LongitudinalDistanceActionComponent } from './views/actions/longitudinal-distance-action/longitudinal-distance-action.component';
import { PositionActionComponent } from './views/actions/position-action/position-action.component';
import { SpeedActionComponent } from './views/actions/speed-action/speed-action.component';
import { ConditionEditorComponent } from './views/condition-editor/condition-editor.component';
import { AccelerationConditionComponent } from './views/conditions/accleration-condition/acceleration-condition.component';
import { ConditionByEntityComponent } from './views/conditions/condition-by-entity/condition-by-entity.component';
import { DistanceConditionComponent } from './views/conditions/distance-condition/distance-condition.component';
import { EndOfRoadConditionComponent } from './views/conditions/end-of-road-condition/end-of-road-condition.component';
import { OffRoadConditionEditorComponent } from './views/conditions/off-road-condition-editor/off-road-condition-editor.component';
import { ReachPositionConditionComponent } from './views/conditions/reach-position-condition/reach-position-condition.component';
import { RelativeDistanceConditionComponent } from './views/conditions/relative-distance-condition/relative-distance-condition.component';
import { RelativeSpeedConditionComponent } from './views/conditions/relative-speed-condition-editor/relative-speed-condition.component';
import {
	SimulationTimeConditionEditorComponent
} from './views/conditions/simulation-time-condition-editor/simulation-time-condition-editor.component';
import { SpeedConditionEditorComponent } from './views/conditions/speed-condition-editor/speed-condition-editor.component';
import { StandStillConditionEditorComponent } from './views/conditions/stand-still-condition-editor/stand-still-condition-editor.component';
import {
	TimeHeadwayConditionEditorComponent
} from './views/conditions/time-headway-condition-editor/time-headway-condition-editor.component';
import {
	TraveledDistanceConditionEditorComponent
} from './views/conditions/traveled-distance-condition-editor/traveled-distance-condition-editor.component';
import { DynamicsEditorComponent } from './views/dynamics-editor/dynamics-editor.component';
import { EventEditorComponent } from './views/event-editor/event-editor.component';
import { ManeuverEditorComponent } from './views/maneuver-editor/maneuver-editor.component';
import { PositionEditorComponent } from './views/position-editor/position-editor.component';
import { LanePositionEditorComponent } from './views/positions/lane-position-editor/lane-position-editor.component';
import {
	RelativeObjectPositionEditorComponent
} from './views/positions/relative-object-position-editor/relative-object-position-editor.component';
import { RelativeWorldComponent } from './views/positions/relative-world/relative-world.component';
import { RoadPositionEditorComponent } from './views/positions/road-position-editor/road-position-editor.component';
import { WorldPositionEditorComponent } from './views/positions/world-position-editor/world-position-editor.component';
import { TargetEditorComponent } from './views/target-editor/target-editor.component';
import { ActEditorComponent } from './views/tv-act-editor/tv-act-editor.component';
import { ScenarioTreeComponent } from './views/tv-hierarchy/scenario-tree.component';

@NgModule( {
	declarations: [
		ScenarioTreeComponent,
		EntityInspector,
		FileHeaderComponent,
		ActionComponent,
		PositionEditorComponent,
		EventEditorComponent,
		ConditionEditorComponent,
		ManeuverEditorComponent,
		DistanceConditionComponent,
		WorldPositionEditorComponent,
		RelativeObjectPositionEditorComponent,
		SimulationTimeConditionEditorComponent,
		SpeedActionComponent,
		TargetEditorComponent,
		DynamicsEditorComponent,
		LaneChangeComponent,
		PositionActionComponent,
		RoadPositionEditorComponent,
		LanePositionEditorComponent,
		TrajectoryInspectorComponent,
		ActionsInspectorComponent,
		FollowTrajectoryComponent,
		TrajectoriesInspectorComponent,
		ParamatersInspectorComponent,
		ReachPositionConditionComponent,
		RelativeSpeedConditionComponent,
		SpeedConditionEditorComponent,
		TraveledDistanceConditionEditorComponent,
		ConditionByEntityComponent,
		TimeHeadwayConditionEditorComponent,
		StandStillConditionEditorComponent,
		OffRoadConditionEditorComponent,
		EndOfRoadConditionComponent,
		RelativeDistanceConditionComponent,
		AccelerationConditionComponent,
		LaneOffsetActionComponent,
		LongitudinalDistanceActionComponent,
		EntityEventInspectorComponent,
		RelativeWorldComponent,
		ImportOpenScenarioDialogComponent,
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
        MatTooltipModule,
        MatMenuModule,
        MatCardModule,
        MatToolbarModule,
    ],
	entryComponents: [
		EntityInspector,
		TrajectoryInspectorComponent,
		ActionsInspectorComponent,
		FollowTrajectoryComponent,
		TrajectoriesInspectorComponent,
		ActEditorComponent,
		SpeedActionComponent,
		ParamatersInspectorComponent,
		EventEditorComponent,
		ScenarioTreeComponent
	],
	exports: [
		ImportOpenScenarioDialogComponent,
		ScenarioTreeComponent,
	],
	providers: [
		ScenarioInstance
	]
} )
export class ScenarioModule {
}
