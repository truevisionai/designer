import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { QuestionsComponent } from './questions.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe( 'QuestionsComponent', () => {
	let component: QuestionsComponent;
	let fixture: ComponentFixture<QuestionsComponent>;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [
				ReactiveFormsModule,
				MatStepperModule,
				MatRadioModule,
				MatCheckboxModule,
				MatFormFieldModule,
				MatInputModule,
				BrowserAnimationsModule
			],
			declarations: [ QuestionsComponent ],
			providers: [ FormBuilder ]
		} ).compileComponents();
	} );

	beforeEach( () => {
		fixture = TestBed.createComponent( QuestionsComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create the component', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should validate the profile form group', () => {
		const profileGroup = component.profileGroup;
		expect( profileGroup.valid ).toBeFalse();

		profileGroup.controls[ 'profile' ].setValue( 'student' );
		expect( profileGroup.valid ).toBeTrue();
	} );

	it( 'should validate the languages form group', () => {
		const languages = component.languages;
		expect( languages.valid ).toBeFalse();

		languages.controls[ 'cpp' ].setValue( true );
		expect( languages.valid ).toBeTrue();
	} );

	it( 'should enable and disable otherLanguageName field based on other checkbox', () => {
		const languages = component.languages;
		const otherCheckbox = languages.controls[ 'other' ];
		const otherLanguageName = languages.controls[ 'otherLanguageName' ];

		expect( otherLanguageName.disabled ).toBeTrue();

		otherCheckbox.setValue( true );
		fixture.detectChanges();
		expect( otherLanguageName.enabled ).toBeTrue();
		expect( hasRequiredValidator( otherLanguageName ) ).toBeTrue();

		otherCheckbox.setValue( false );
		fixture.detectChanges();
		expect( otherLanguageName.disabled ).toBeTrue();
		expect( otherLanguageName.value ).toBe( '' );
	} );

	it( 'should validate the simulators form group', () => {
		const simulators = component.simulators;
		expect( simulators.valid ).toBeFalse();

		simulators.controls[ 'carla' ].setValue( true );
		expect( simulators.valid ).toBeTrue();
	} );

	it( 'should enable and disable otherSimulatorName field based on other checkbox', () => {
		const simulators = component.simulators;
		const otherCheckbox = simulators.controls[ 'other' ];
		const otherSimulatorName = simulators.controls[ 'otherSimulatorName' ];

		expect( otherSimulatorName.disabled ).toBeTrue();

		otherCheckbox.setValue( true );
		fixture.detectChanges();
		expect( otherSimulatorName.enabled ).toBeTrue();
		expect( hasRequiredValidator( otherSimulatorName ) ).toBeTrue();

		otherCheckbox.setValue( false );
		fixture.detectChanges();
		expect( otherSimulatorName.disabled ).toBeTrue();
		expect( otherSimulatorName.value ).toBe( '' );
	} );

	it( 'should validate the frameworks form group', () => {
		const frameworks = component.frameworks;
		expect( frameworks.valid ).toBeFalse();

		frameworks.controls[ 'ros' ].setValue( true );
		expect( frameworks.valid ).toBeTrue();
	} );

	it( 'should enable and disable otherFrameworkName field based on other checkbox', () => {
		const frameworks = component.frameworks;
		const otherCheckbox = frameworks.controls[ 'other' ];
		const otherFrameworkName = frameworks.controls[ 'otherFrameworkName' ];

		expect( otherFrameworkName.disabled ).toBeTrue();

		otherCheckbox.setValue( true );
		fixture.detectChanges();
		expect( otherFrameworkName.enabled ).toBeTrue();
		expect( hasRequiredValidator( otherFrameworkName ) ).toBeTrue();

		otherCheckbox.setValue( false );
		fixture.detectChanges();
		expect( otherFrameworkName.disabled ).toBeTrue();
		expect( otherFrameworkName.value ).toBe( '' );
	} );

	it( 'should validate the robots form group', () => {
		const robots = component.robots;
		expect( robots.valid ).toBeFalse();

		robots.controls[ 'cars' ].setValue( true );
		expect( robots.valid ).toBeTrue();
	} );

	it( 'should enable and disable otherRobotName field based on other checkbox', () => {
		const robots = component.robots;
		const otherCheckbox = robots.controls[ 'other' ];
		const otherRobotName = robots.controls[ 'otherRobotName' ];

		expect( otherRobotName.disabled ).toBeTrue();

		otherCheckbox.setValue( true );
		fixture.detectChanges();
		expect( otherRobotName.enabled ).toBeTrue();
		expect( hasRequiredValidator( otherRobotName ) ).toBeTrue();

		otherCheckbox.setValue( false );
		fixture.detectChanges();
		expect( otherRobotName.disabled ).toBeTrue();
		expect( otherRobotName.value ).toBe( '' );
	} );

	it( 'should submit the form when valid', () => {
		spyOn( console, 'log' );
		component.profileGroup.controls[ 'profile' ].setValue( 'student' );
		component.languages.controls[ 'cpp' ].setValue( true );
		component.simulators.controls[ 'carla' ].setValue( true );
		component.frameworks.controls[ 'ros' ].setValue( true );
		component.robots.controls[ 'cars' ].setValue( true );

		component.submit();
		expect( console.log ).toHaveBeenCalledWith( component.parentForm.value );
	} );

	function hasRequiredValidator ( control: AbstractControl ): boolean {
		const validator = control.validator ? control.validator( {} as AbstractControl ) : null;
		return !!( validator && validator.required );
	}
} );
