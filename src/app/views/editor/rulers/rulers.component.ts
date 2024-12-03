/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Camera, OrthographicCamera, Vector3 } from "three";
import * as THREE from "three";

interface Label {
	value: number,
	top: string,
	left: string,
	isVisible: boolean
}

@Component( {
	selector: 'app-rulers',
	templateUrl: './rulers.component.html',
	styleUrls: [ './rulers.component.scss' ]
} )
export class RulersComponent implements OnInit {

	@Input() viewUpdated: EventEmitter<any>;

	@Input() camera: OrthographicCamera;

	@Input() canvasConfig: { width: number, height: number, top: number };

	xAxisLabels: Label[] = [];

	yAxisLabels: Label[] = [];

	xAxisInterval: number = 10;

	yAxisInterval: number = 10;

	constructor () {
	}

	ngOnInit (): void {

		this.viewUpdated.subscribe( this.onViewUpdated.bind( this ) );

		this.createLabels();

	}

	onViewUpdated ( $event: any ): void {

		this.createLabels();
		this.updateLabels();

	}

	private createLabels (): void {

		// Clear existing labels
		this.yAxisLabels = [];
		this.xAxisLabels = [];

		// Determine the increment based on the camera's zoom level
		this.xAxisInterval = this.calculateLabelInterval( this.camera.zoom ) * 2;
		this.yAxisInterval = this.calculateLabelInterval( this.camera.zoom );

		// Determine the range of visible values for the y-axis and x-axis
		const xAxisRange = this.calculateAxisRange( this.camera, 'x' );
		const yAxisRange = this.calculateAxisRange( this.camera, 'y' );

		// Start from 0 and create labels up to the max range
		for ( let x = 0; x <= xAxisRange.max; x += this.xAxisInterval ) {
			this.xAxisLabels.push( {
				value: x,
				top: '0px',
				left: '0px',
				isVisible: true
			} );
		}
		// Also create labels down to the min range
		for ( let x = -this.xAxisInterval; x >= xAxisRange.min; x -= this.xAxisInterval ) {
			this.xAxisLabels.push( {
				value: x,
				top: '0px',
				left: '0px',
				isVisible: true
			} );
		}

		// Repeat the process for y-axis
		for ( let y = 0; y <= yAxisRange.max; y += this.yAxisInterval ) {
			this.yAxisLabels.push( {
				value: y,
				top: '0px',
				left: '0px',
				isVisible: true
			} );
		}
		for ( let y = -this.yAxisInterval; y >= yAxisRange.min; y -= this.yAxisInterval ) {
			this.yAxisLabels.push( {
				value: y,
				top: '0px',
				left: '0px',
				isVisible: true
			} );
		}

	}

	private calculateAxisRange ( camera: OrthographicCamera, axis: 'x' | 'y' ) {
		// You would implement the logic here to determine the min and max
		// visible values along the specified axis based on the camera's
		// position, zoom level, and aspect ratio.
		// This is a placeholder implementation:
		const size = axis === 'y' ? camera.top - camera.bottom : camera.right - camera.left;

		let min = camera.position[ axis ] - ( size / 2 ) / camera.zoom;
		let max = camera.position[ axis ] + ( size / 2 ) / camera.zoom;

		// Round to nearest multiple of 10
		min = Math.floor( min / 10 ) * 10;
		max = Math.ceil( max / 10 ) * 10;

		return { min, max };
	}

	private updateLabels (): void {

		const labelHeight = 20; // Replace with your label height. You might need to measure this dynamically.
		const labelWidth = 30; // Estimate or dynamically measure the width of your labels.

		// Calculate the vertical boundaries of the camera view
		const camTop = this.camera.position.y + ( this.camera.top / this.camera.zoom );
		const camBottom = this.camera.position.y + ( this.camera.bottom / this.camera.zoom );

		// Calculate the horizontal boundaries of the camera view
		const camLeft = this.camera.position.x + ( this.camera.left / this.camera.zoom );
		const camRight = this.camera.position.x + ( this.camera.right / this.camera.zoom );

		this.yAxisLabels.forEach( ( label ) => {

			// Use the label's xValue to determine its 3D position
			const labelPosition = new THREE.Vector3( 0, label.value, 0 ); // Change y and z if needed

			// Calculate the 2D position
			const pos2D = this.toScreenPosition( labelPosition, this.camera, this.canvasConfig.width, this.canvasConfig.height );

			// Update the label's style properties
			label.top = ( this.canvasConfig.top + pos2D.y - labelHeight / 2 ) + 'px';

			// Check if the label's yValue is within the camera's vertical boundaries
			label.isVisible = ( label.value <= camTop && label.value >= camBottom );

		} );

		this.xAxisLabels.forEach( ( label ) => {

			// Use the label's xValue to determine its 3D position
			const labelPosition = new THREE.Vector3( label.value, 0, 0 ); // Change y and z if needed

			// Calculate the 2D position
			const pos2D = this.toScreenPosition( labelPosition, this.camera, this.canvasConfig.width, this.canvasConfig.height );

			// Update the label's style properties
			label.left = ( pos2D.x - labelWidth / 2 ) + 'px';

			// Check if the label's yValue is within the camera's vertical boundaries
			label.isVisible = ( label.value <= camRight && label.value >= camLeft );

		} );
	}

	private calculateLabelInterval ( zoomLevel: number ): number {

		// Define zoom levels and corresponding intervals
		const zoomIntervals = [
			{ zoom: 0.05, interval: 1000 },
			{ zoom: 0.2, interval: 250 },
			{ zoom: 0.4, interval: 100 },
			{ zoom: 0.9, interval: 50 },
			{ zoom: 1.0, interval: 10 },
			{ zoom: 5.0, interval: 10 },
			{ zoom: 10.0, interval: 5 },
		];

		// Iterate over zoomIntervals to find the appropriate interval
		for ( let i = 0; i < zoomIntervals.length; i++ ) {
			if ( zoomLevel <= zoomIntervals[ i ].zoom ) {
				return zoomIntervals[ i ].interval;
			}
		}

		// Return default interval if no matching zoom level is found
		return 10;
	}

	// Assuming 'camera' is your Three.js camera and 'renderer' is your Three.js renderer
	private toScreenPosition ( obj: Vector3, camera: Camera, width: number, height: number ) {

		const vector = new THREE.Vector3();
		const widthHalf = 0.5 * width;
		const heightHalf = 0.5 * height;

		vector.copy( obj ).project( camera );

		vector.x = ( vector.x * widthHalf ) + widthHalf;
		vector.y = -( vector.y * heightHalf ) + heightHalf;

		return { x: vector.x, y: vector.y };
	}

}
