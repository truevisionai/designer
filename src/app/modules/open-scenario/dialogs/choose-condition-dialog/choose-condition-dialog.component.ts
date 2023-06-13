/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AtStartCondition } from '../../models/conditions/tv-at-start-condition';
import { AbstractCondition } from '../../models/conditions/tv-condition';
import { DistanceCondition } from '../../models/conditions/tv-distance-condition';
import { ReachPositionCondition } from '../../models/conditions/tv-reach-position-condition';
import { SimulationTimeCondition } from '../../models/conditions/tv-simulation-time-condition';
import { ConditionCategory, ConditionType, Rule, StoryElementType } from '../../models/tv-enums';

@Component( {
	selector: 'app-choose-condition-dialog',
	templateUrl: './choose-condition-dialog.component.html',
	styleUrls: [ './choose-condition-dialog.component.css' ]
} )
export class ChooseConditionDialogComponent implements OnInit {

	selectedCategory: ConditionCategory;
	selectedType: ConditionType;
	selectedCondition: AbstractCondition;

	constructor (
		public dialogRef: MatDialogRef<ChooseConditionDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: any,
	) {

	}

	get types () {
		return ConditionType;
	}

	get categories () {
		return ConditionCategory;
	}

	ngOnInit () {

	}

	onCancel () {
		this.dialogRef.close( null );
	}

	onAdd () {

		switch ( this.selectedCategory ) {
			case ConditionCategory.ByEntity:
				this.createByEntity();
				break;
			case ConditionCategory.ByState:
				this.createByState();
				break;
			case ConditionCategory.ByValue:
				this.createByValue();
				break;
		}


		this.dialogRef.close( this.selectedCondition );
	}

	createByValue (): any {
		switch ( this.selectedType ) {
			case ConditionType.ByValue_Parameter:
				break;
			case ConditionType.ByValue_TimeOfDay:
				break;
			case ConditionType.ByValue_SimulationTime:
				this.selectedCondition = new SimulationTimeCondition( 0, Rule.greater_than );
				break;
		}
	}

	createByState (): any {
		switch ( this.selectedType ) {
			case ConditionType.ByState_AfterTermination:
				break;
			case ConditionType.ByState_AtStart:
				this.selectedCondition = new AtStartCondition( 'actName', StoryElementType.act );
				break;
			case ConditionType.ByState_Command:
				break;
			case ConditionType.ByState_Signal:
				break;
			case ConditionType.ByState_Controller:
				break;
		}
	}

	createByEntity (): any {
		switch ( this.selectedType ) {
			case ConditionType.ByEntity_EndOfRoad:
				break;
			case ConditionType.ByEntity_Collision:
				break;
			case ConditionType.ByEntity_Offroad:
				break;
			case ConditionType.ByEntity_TimeHeadway:
				break;
			case ConditionType.ByEntity_TimeToCollision:
				break;
			case ConditionType.ByEntity_Acceleration:
				break;
			case ConditionType.ByEntity_StandStill:
				break;
			case ConditionType.ByEntity_Speed:
				break;
			case ConditionType.ByEntity_RelativeSpeed:
				break;
			case ConditionType.ByEntity_TraveledDistance:
				break;
			case ConditionType.ByEntity_ReachPosition:
				this.selectedCondition = new ReachPositionCondition();
				break;
			case ConditionType.ByEntity_Distance:
				this.selectedCondition = new DistanceCondition();
				break;
			case ConditionType.ByEntity_RelativeDistance:
				break;
		}
	}
}
