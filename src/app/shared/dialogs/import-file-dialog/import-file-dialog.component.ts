/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { IFile } from '../../../core/models/file';
import { FileApiService } from 'app/core/services/file-api.service';

@Component( {
    selector: 'app-import-file-dialog',
    templateUrl: './import-file-dialog.component.html',
} )
export class ImportFileDialogComponent implements OnInit {

    public selectedFile: IFile;

    public files: IFile[] = [];

    public columns: string[] = [ 'name', 'updated_at', 'created_at' ];

    // @ViewChild( 'fileInput' ) fileInput: ElementRef;

    constructor (
        public dialogRef: MatDialogRef<ImportFileDialogComponent>,
        @Inject( MAT_DIALOG_DATA ) public data: any,
        private fileService: FileApiService
    ) {

    }

    ngOnInit (): void {

        this.fileService.getFileList( 'tv-map' ).subscribe( res => {

            if ( Array.isArray( res ) ) {

                this.files = res;

            }

        } );

    }

    selectFile ( file: IFile ) {

        this.selectedFile = file;

    }

    public fileChange ( event ) {

        const self = this;

        const reader = new FileReader();

        if ( event.target.files && event.target.files.length > 0 ) {

            const file = event.target.files[ 0 ];

            reader.readAsText( file );

            reader.onload = ( data ) => {

                self.selectedFile = new IFile( 'Untitled.xml' );
                self.selectedFile.contents = reader.result as string;
                self.selectedFile.online = false;

            };
        }

    }

    public onImport () {

        if ( this.selectedFile != null ) {

            this.fileService.getFile( this.selectedFile.name, this.selectedFile.type ).subscribe( file => {

                this.dialogRef.close( file );

            } );

        }

    }

    public onCancel () {

        this.dialogRef.close();

    }

    // public openFileDialog (): void {
    //
    //     const event = new MouseEvent( 'click', { bubbles: false } );
    //
    //     this.fileInput.nativeElement.dispatchEvent( event );
    //
    // }
}
