/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component( {
    selector: 'app-footer-bottom',
    templateUrl: './footer-bottom.component.html',
    styleUrls: ['./footer-bottom.component.css']
} )
export class FooterBottomComponent implements OnInit {

    showSlider: boolean;

    sliderValue: number = 1;
    sliderMin: number = 1;
    sliderMax: number = 1;
    sliderStep: number = 1;

    constructor (
        private route: ActivatedRoute,
        private router: Router,
    ) {
    }

    ngOnInit () {

        // this.router.events.subscribe( e => {
        //   if ( e instanceof NavigationEnd ) {
        //     Debug.log( e );
        //   }
        // } );    



    }

    selectAttachment ( frame: number ): any {

        // this.editorService.attachmentChanged.emit( frame );

    }

    resetSlider (): void {

        this.showSlider = false;
        this.sliderMin = 1;
        this.sliderMax = 1;

    }

    setSliderValues ( task: any ): void {

        this.showSlider = task.attachments.length > 1;
        this.sliderMin = 1;
        this.sliderMax = task.attachments.length;

    }

    ngOnDestroy () {

    }

    onSliderMoved ( e ) {

        // Debug.log( 'moved', this.sliderValue );

    }

    onSliderValueChanged ( e ) {

        this.selectAttachment( this.sliderValue );

    }

    onNextClick () {

        if ( this.sliderValue >= this.sliderMax ) return;

        this.sliderValue += 1;

        this.selectAttachment( this.sliderValue );

        // Debug.log( 'on next', this.sliderValue );

    }

    onBackClick () {

        if ( this.sliderValue <= this.sliderMin ) return;

        this.sliderValue -= 1;

        this.selectAttachment( this.sliderValue );

        // Debug.log( 'on back', this.sliderValue );
    }

    onSubmit () {

        // this.editorService.submitBtnClicked.emit();

    }

    @HostListener( 'document:keydown', ['$event'] )
    onKeyDown ( event: KeyboardEvent ) {

        // Debug.log( 'keydown', event );

        switch ( event.code ) {
            case 'BracketLeft':
                this.onBackClick();
                break;

            case 'BracketRight':
                this.onNextClick();
                break;
        }

    }

    // @HostListener( 'document:keypress', ['$event'] )
    // onKeyPress ( event: KeyboardEvent ) {

    //   Debug.log( 'keypress', event );

    // }

}
