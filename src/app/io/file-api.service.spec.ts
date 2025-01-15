import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileApiService } from './file-api.service';
import { OpenDriveService } from 'app/map/services/open-drive.service';
import { ApiService } from '../services/api.service';

describe( 'FileApiService', () => {

	let service: FileApiService;

	let httpMock: HttpTestingController;
	let openDriveService: jasmine.SpyObj<OpenDriveService>;
	let apiService: jasmine.SpyObj<ApiService>;

	beforeEach( () => {
		const openDriveSpy = jasmine.createSpyObj( 'OpenDriveService', [ 'getOpenDriveOutput', 'getSceneOutput' ] );
		const apiSpy = jasmine.createSpyObj( 'ApiService', [ 'put' ] );

		TestBed.configureTestingModule( {
			imports: [ HttpClientTestingModule ],
			providers: [
				FileApiService,
				{ provide: OpenDriveService, useValue: openDriveSpy },
				{ provide: ApiService, useValue: apiSpy }
			]
		} );

		service = TestBed.inject( FileApiService );
		httpMock = TestBed.inject( HttpTestingController );
		openDriveService = TestBed.inject( OpenDriveService ) as jasmine.SpyObj<OpenDriveService>;
		apiService = TestBed.inject( ApiService ) as jasmine.SpyObj<ApiService>;
	} );

	afterEach( () => {
		httpMock.verify();
	} );

	it( 'should return false for combined size less than maxSize', () => {
		const openDriveState = 'a'.repeat( 500000 ); // 500 KB
		const tvMapState = 'a'.repeat( 400000 ); // 400 KB
		const result = service.isExceedingMaxFileSize( openDriveState, tvMapState );
		expect( result ).toBeFalse();
	} );

	it( 'should return true for combined size equal to maxSize', () => {
		const openDriveState = 'a'.repeat( 600000 ); // 600 KB
		const tvMapState = 'a'.repeat( 400000 ); // 400 KB
		const result = service.isExceedingMaxFileSize( openDriveState, tvMapState );
		expect( result ).toBeTrue();
	} );

	it( 'should return true for combined size greater than maxSize', () => {
		const openDriveState = 'a'.repeat( 700000 ); // 700 KB
		const tvMapState = 'a'.repeat( 400000 ); // 400 KB
		const result = service.isExceedingMaxFileSize( openDriveState, tvMapState );
		expect( result ).toBeTrue();
	} );

	it( 'should handle empty strings and return false', () => {
		const openDriveState = '';
		const tvMapState = '';
		const result = service.isExceedingMaxFileSize( openDriveState, tvMapState );
		expect( result ).toBeFalse();
	} );

} );
