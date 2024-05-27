import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from 'app/services/app.service';
import { ProfileService } from 'app/services/profile.service';

// Custom validator function
export function requireCheckboxesToBeCheckedValidator ( minRequired = 1 ): ValidatorFn {

	return function validate ( formGroup: FormGroup ): ValidationErrors | null {

		let checked = 0;

		Object.keys( formGroup.controls ).forEach( key => {
			const control = formGroup.controls[ key ];
			if ( control?.value === true ) {
				checked++;
			}
		} );

		if ( checked < minRequired ) {
			return {
				requireOneCheckboxToBeChecked: true
			};
		}

		return null;
	};
}

@Component( {
	selector: 'app-questions',
	templateUrl: './questions.component.html',
	styleUrls: [ './questions.component.scss' ],
} )
export class QuestionsComponent implements OnInit {

	@Output() submitted = new EventEmitter();

	@Input() showHeader = true;

	profiles = [
		'student',
		'researcher',
		'professional',
		'hobbyist'
	];

	profileGroup = this.fb.group( {
		profile: [ '', Validators.required ],
	} );

	languages = this.fb.group( {
		cpp: false,
		python: false,
		csharp: false,
		rust: false,
		golang: false,
		java: false,
		other: false,
		otherLanguageName: { value: '', disabled: true }  // Add this line
	}, {
		validators: requireCheckboxesToBeCheckedValidator( 1 ),
	} );

	simulators = this.fb.group( {
		awsim: false,
		airsim: false,
		carla: false,
		gazebo: false,
		lgsvl: false,
		sumo: false,
		other: false,
		otherSimulatorName: { value: '', disabled: true }
	}, {
		validators: requireCheckboxesToBeCheckedValidator( 1 ),
	} );

	frameworks = this.fb.group( {
		ros: false,
		ros2: false,
		baiduApollo: false,
		autoware1: false,
		autoware2: false,
		other: false,
		otherFrameworkName: { value: '', disabled: true }
	}, {
		validators: requireCheckboxesToBeCheckedValidator( 1 ),
	} );

	robots = this.fb.group( {
		cars: false,
		drones: false,
		industrial: false,
		educational: false,
		agricultural: false,
		delivery: false,
		other: false,
		otherRobotName: { value: '', disabled: true }
	}, {
		validators: requireCheckboxesToBeCheckedValidator( 1 ),
	} );

	parentForm: FormGroup;

	constructor (
		private fb: FormBuilder,
		private router: Router,
		private userService: ProfileService
	) { }

	ngOnInit () {

		this.parentForm = this.fb.group( {
			personal: this.profileGroup,
			languages: this.languages,
			simulators: this.simulators,
			frameworks: this.frameworks,
			robots: this.robots
		} );

		this.languages.get( 'other' ).valueChanges.subscribe( checked => {
			const otherLanguageName = this.languages.get( 'otherLanguageName' );
			if ( checked ) {
				otherLanguageName.setValidators( Validators.required );
				otherLanguageName.enable();
			} else {
				otherLanguageName.disable();
				otherLanguageName.setValue( '' );  // Clear the value if 'Other' is unchecked
			}
		} );

		this.simulators.get( 'other' ).valueChanges.subscribe( checked => {
			const otherSimulatorName = this.simulators.get( 'otherSimulatorName' );
			if ( checked ) {
				otherSimulatorName.setValidators( Validators.required );
				otherSimulatorName.enable();
			} else {
				otherSimulatorName.disable();
				otherSimulatorName.setValue( '' );  // Clear the value if 'Other' is unchecked
			}
		} );

		this.frameworks.get( 'other' ).valueChanges.subscribe( checked => {
			const otherFrameworkName = this.frameworks.get( 'otherFrameworkName' );
			if ( checked ) {
				otherFrameworkName.setValidators( Validators.required );
				otherFrameworkName.enable();
			} else {
				otherFrameworkName.disable();
				otherFrameworkName.setValue( '' );  // Clear the value if 'Other' is unchecked
			}
		} );

		this.robots.get( 'other' ).valueChanges.subscribe( checked => {
			const otherRobotName = this.robots.get( 'otherRobotName' );
			if ( checked ) {
				otherRobotName.setValidators( Validators.required );
				otherRobotName.enable();
			} else {
				otherRobotName.disable();
				otherRobotName.setValue( '' );  // Clear the value if 'Other' is unchecked
			}
		} );

	}
	submit () {

		console.log( this.parentForm?.value );

		if ( this.parentForm?.valid ) {
			this.userService.updateProfile( this.parentForm.value );
		}


		this.submitted.emit();

		// non-modal view
		if ( this.showHeader ) {
			this.router.navigateByUrl( AppService.homeUrl );
		}

	}

}
