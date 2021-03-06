import {Component, Input, OnInit} from '@angular/core';
// 11/02/19
import {Annotation} from 'src/app/interfaces/annotation2/annotation2';
// import {Annotation} from '../../interfaces/annotation/annotation';
import {DataService} from '../../services/data/data.service';
import {AnnotationService} from '../../services/annotation/annotation.service';
import {BabylonService} from '../../services/babylon/babylon.service';
import {CameraService} from '../../services/camera/camera.service';
import {AnnotationmarkerService} from '../../services/annotationmarker/annotationmarker.service';


@Component({
  selector: 'app-annotations-editor',
  templateUrl: './annotations-editor.component.html',
  styleUrls: ['./annotations-editor.component.scss']
})

export class AnnotationsEditorComponent implements OnInit {

  @Input() annotation: Annotation;

  public collapsed = true;
  public editMode = false;
  public labelMode = 'edit';
  public labelModeText = 'edit';
  public preview = '';

  constructor(private dataService: DataService, private annotationService: AnnotationService,
              private babylonService: BabylonService, private cameraService: CameraService,
              private annotationmarkerService: AnnotationmarkerService) {
  }

  ngOnInit() {

    if (this.annotation) {
        // 11/02/19
      // this.preview = this.annotation.preview;
      this.preview = this.annotation.body.content.relatedPerspective.preview;

      // 15/02/19
      // EditMode -- OnInit -- newly creaded annotation (by double click)
      if (this.annotationmarkerService.open_popup === this.annotation._id){
              
        this.collapsed = true;
        this.editMode = false;
        this.labelMode = 'edit';
        this.labelModeText = 'edit';
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
    // 11/02/19
    this.annotation.body.content.relatedPerspective.vector = this.cameraService.getActualCameraPosAnnotation();
    // this.annotation.cameraPosition = this.cameraService.getActualCameraPosAnnotation();
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
    if (this.editMode) {
      this.collapsed = true;
      this.editMode = false;
      this.labelMode = 'edit';
      this.labelModeText = 'edit';
      this.save();
    } else {
      this.collapsed = false;
      this.editMode = true;
      this.labelMode = 'remove_red_eye';
      this.labelModeText = 'view';
    }
  }

  private save(): void {
    this.dataService.updateAnnotation(this.annotation._id, this.annotation.body.content.title, this.annotation.body.content.description,
      this.preview, this.annotation.body.content.relatedPerspective.vector, this.annotation.validated);
    // this.dataService.updateAnnotation(this.annotation._id, this.annotation.title, this.annotation.description,
    //   this.preview, this.annotation.cameraPosition, this.annotation.validated);
  }

  public onSubmit(event) {
  }

  public setEditMode(mode: boolean) {
    if (!mode && this.editMode) {
      this.editMode = false;
      this.labelMode = 'edit';
      this.labelModeText = 'edit';
      this.save();
    } else if (mode && !this.editMode) {
      this.collapsed = false;
      this.editMode = true;
      this.labelMode = 'remove_red_eye';
      this.labelModeText = 'view';
    } else {
      return;
    }
  }
}


