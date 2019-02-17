import {Component, Input, OnInit} from '@angular/core';
import {Annotation} from '../../interfaces/annotation/annotation';

import {DataService} from '../../services/data/data.service';
import {AnnotationService} from '../../services/annotation/annotation.service';
import {BabylonService} from '../../services/babylon/babylon.service';
import {CameraService} from '../../services/camera/camera.service';
import {AnnotationmarkerService} from '../../services/annotationmarker/annotationmarker.service';

// 16/02/19
import {AfterViewInit, QueryList, ViewChildren} from '@angular/core';

// 15/02/19
import {AnnotationComponent} from '../annotation/annotation.component';

@Component({
  selector: 'app-annotations-editor',
  templateUrl: './annotations-editor.component.html',
  styleUrls: ['./annotations-editor.component.scss']
})
export class AnnotationsEditorComponent implements OnInit {

  @Input() annotation: Annotation;

  // 16/02/19
  @ViewChildren(AnnotationComponent)
  annotationsList: QueryList<AnnotationComponent>;
  
  public collapsed = true;
  // 15/02/19
  // 16/02/19
  public editMode = false;
  public labelMode = 'edit';
  public labelModeText = 'edit';
  public preview = '';

  constructor(private dataService: DataService, private annotationService: AnnotationService,
              private babylonService: BabylonService, private cameraService: CameraService,
              private annotationmarkerService: AnnotationmarkerService,
              private annotationComponent: AnnotationComponent
              ) {
  }

  ngOnInit() {

    if (this.annotation) {
      this.preview = this.annotation.preview;

      
      console.log("this.annotationsList");
      console.log(this.annotationsList);

      // 15/02/19
      // EditMode -- OnInit -- newly creaded annotation (by double click)
      if (this.annotationmarkerService.open_popup === this.annotation._id){
        
        // 15/02/19
        this.collapsed = false;
        // this.annotationComponent.editMode = true;
        // this.annotationComponent.labelMode = 'remove_red_eye';
        // this.annotationComponent.labelModeText = 'view';

        // 16/02/19
        this.editMode = true;
        this.labelMode = 'remove_red_eye';
        this.labelModeText = 'view';
      }
    }
  }

  public getValidation(validated) {
    if (validated) {
      this.annotation.validated = true;
      return 'validated';
    } else {
      this.annotation.validated = false;
      return 'unvalidated';
    }
  }

  public async selectPerspective() {
    this.annotation.cameraPosition = this.cameraService.getActualCameraPosAnnotation();
    await this.babylonService.createPreviewScreenshot(400).then(detailScreenshot => {

      /*
      const i = new Image();
      i.onload = function() {
        alert( i.width + ', ' + i.height );
      };
      i.src = detailScreenshot;*/
      this.preview = detailScreenshot;
    });
  }

  public deleteAnnotation(): void {
    this.annotationService.deleteAnnotation(this.annotation);
  }

  public toggleEditViewMode() {
    // 15/02/19
    if (this.editMode) {
      this.collapsed = true;
      // this.annotationComponent.editMode = false;
      // this.annotationComponent.labelMode = 'edit';
      // this.annotationComponent.labelModeText = 'edit';
      // 16/02/19
      this.editMode = false;
      this.labelMode = 'edit';
      this.labelModeText = 'edit';
      this.save();
    } else {
      this.collapsed = false;
      // this.annotationComponent.editMode = true;
      // this.annotationComponent.labelMode = 'remove_red_eye';
      // this.annotationComponent.labelModeText = 'view';
      // 16/02/19
      this.editMode = true;
      this.labelMode = 'remove_red_eye';
      this.labelModeText = 'view';
    }
  }

  private save(): void {
    this.dataService.updateAnnotation(this.annotation._id, this.annotation.title, this.annotation.description,
      this.preview, this.annotation.cameraPosition, this.annotation.validated);
  }

  public onSubmit(event) {
    // console.log(event);
  }
}


