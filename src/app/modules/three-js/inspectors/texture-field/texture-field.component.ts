/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { Texture } from 'three';

@Component( {
	selector: 'app-texture-field',
	templateUrl: './texture-field.component.html',
	styleUrls: [ './texture-field.component.css' ]
} )
/**
 * @deprecated
 */
export class TextureFieldComponent implements OnInit {

	@Input() data: Texture | null;
	@Input() label: string = 'Texture';

	@Output() changed = new EventEmitter<Texture>();

	@ViewChild( 'canvas' ) canvas: ElementRef;

	private input: any;

	constructor () {
	}

	get canvasEl (): HTMLCanvasElement {
		return <HTMLCanvasElement> this.canvas.nativeElement;
	}

	get texture () {
		return this.data;
	}

	set texture ( value ) {
		this.data = value;
	}

	ngOnInit (): void {

		const dom = document.createElement( 'span' );
		const form = document.createElement( 'form' );

		this.input = document.createElement( 'input' );
		this.input.type = 'file';
		this.input.addEventListener( 'change', ( event: any ) => {

			this.loadFile( event.target.files[ 0 ] );

		} );

		form.appendChild( this.input );

		if ( this.data != null ) this.setValue( this.texture );
	}

	loadFile ( file ) {

		if ( file.type.match( 'image.*' ) ) {

			const reader = new FileReader();

			if ( file.type === 'image/targa' ) {

				// reader.addEventListener( 'load', function ( event ) {
				//
				//     // var canvas = new THREE.TGALoader().parse( event.target.result );
				//     //
				//     // var texture = new THREE.CanvasTexture( canvas, mapping );
				//     // texture.sourceFile = file.name;
				//     //
				//     // scope.setValue( texture );
				//     //
				//     // if ( scope.onChangeCallback ) scope.onChangeCallback( texture );
				//
				// }, false );
				//
				// reader.readAsArrayBuffer( file );
				//
			} else {

				reader.addEventListener( 'load', ( event: any ) => {

					const image = document.createElement( 'img' );

					image.addEventListener( 'load', ( event: any ) => {

						const texture = new Texture( image, THREE.UVMapping );
						texture.source = file.name;
						texture.format = file.type === 'image/jpeg' ? THREE.RGBAFormat : THREE.RGBAFormat;
						texture.needsUpdate = true;

						this.setValue( texture );

						this.changed.emit( texture );

					}, false );

					image.src = event.target.result;

				}, false );

				reader.readAsDataURL( file );

			}

		}

		// form.reset();

	}

	onClick () {

		this.input.click();

	}

	private setValue ( texture: Texture ) {

		const canvas = this.canvasEl;
		const context = canvas.getContext( '2d' );

		if ( texture !== null ) {

			const image = texture.image;

			if ( image !== undefined && image.width > 0 ) {

				canvas.title = texture.source.data;

				const scale = canvas.width / image.width;
				context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

			} else {

				canvas.title = texture.source.data + ' (error)';
				context.clearRect( 0, 0, canvas.width, canvas.height );

			}

		} else {

			canvas.title = 'empty';

			if ( context !== null ) {

				// Seems like context can be null if the canvas is not visible

				context.clearRect( 0, 0, canvas.width, canvas.height );

			}

		}

		this.texture = texture;

	}
}
