import {Injectable} from '@angular/core';

import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

import {BabylonService} from '../babylon/babylon.service';
import {CameraService} from '../camera/camera.service';
import {AnnotationService} from '../annotation/annotation.service';

import ActionEvent = BABYLON.ActionEvent;
import { leave } from '@angular/core/src/profile/wtf_impl';

@Injectable({
  providedIn: 'root'
})
export class AnnotationvrService {

  private controlPrevious: BABYLON.AbstractMesh;
  private controlNext: BABYLON.AbstractMesh;
  private annotationTextGround: BABYLON.AbstractMesh;
  private annotationTextField: GUI.TextBlock;

  // FULLSCREEN_GUI
  private advancedTextureFullscreen: BABYLON.GUI.AdvancedDynamicTexture;
  
  private selectingControlPrevious: boolean;
  private selectedControlPrevious: boolean;
  private selectingControlNext: boolean;
  private selectedControlNext: boolean;

  public actualRanking: number;

  private posXcontrolPrevious: number;
  private posYcontrolPrevious: number;
  private posZcontrolPrevious: number;
  private posXcontrolNext: number;
  private posYcontrolNext: number;
  private posZcontrolNext: number;
  private posXtextfield: number;
  private posYtextfield: number;
  private posZtextfield: number;

  constructor(private babylonService: BabylonService,
              private annotationService: AnnotationService,
              private cameraService: CameraService) {

    this.selectingControlPrevious = false;
    this.selectedControlPrevious = false;
    this.selectingControlNext = false;
    this.selectedControlNext = false;

    this.actualRanking = 0;
  
    this.posXcontrolPrevious = -1.5;
    this.posYcontrolPrevious = -0.9;
    this.posZcontrolPrevious = 3;

    this.posXcontrolNext = 1.5;
    this.posYcontrolNext = -0.9;
    this.posZcontrolNext = 3;

    this.posXtextfield = 0;
    this.posYtextfield = -0.9;
    this.posZtextfield = 3;
    
    this.babylonService.vrModeIsActive.subscribe(vrModeIsActive => {
      if (vrModeIsActive) {
        
        // FULLSCREEN_GUI
        this.advancedTextureFullscreen = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI2");
        console.log(this.advancedTextureFullscreen);
        this.advancedTextureFullscreen.isForeground = true;

        this.createVRAnnotationControls();
        this.createVRAnnotationContentField();
      } else {

        // FULLSCREEN_GUI
        this.advancedTextureFullscreen.isForeground = false;
 
        this.deleteVRElements();
      }
    });
  }

  // Function -- Create Annotation-Controls -- Mesh_Plane + Aktive_Camera-Connection + Label_Clickable -- Next-Annotation + Previous-Annotation
  public createVRAnnotationControls() {

    // Previous Control
    this.controlPrevious = BABYLON.MeshBuilder.CreatePlane('controlPrevious', {height: 1, width: 1}, this.babylonService.getScene());
    this.controlPrevious.parent = this.babylonService.getScene().activeCamera;
    this.controlPrevious.position.x = this.posXcontrolPrevious;
    this.controlPrevious.position.y = this.posYcontrolPrevious;
    this.controlPrevious.position.z = this.posZcontrolPrevious;
    this.controlPrevious.material = new BABYLON.StandardMaterial('controlMat', this.babylonService.getScene());
    this.controlPrevious.material.alpha = 1;
    this.controlPrevious.renderingGroupId = 1;
    this.controlPrevious.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    BABYLON.Tags.AddTagsTo(this.controlPrevious, 'control');

    const label = this.createLabel();
    GUI.AdvancedDynamicTexture.CreateForMesh(this.controlPrevious).addControl(label);

    // FULLSCREEN_GUI
    const labelFullscreen = this.createLabelFullscreen();
    BABYLON.Tags.AddTagsTo(label, 'control');
    this.advancedTextureFullscreen.addControl(labelFullscreen);
    
    // Next Control
    this.controlNext = BABYLON.MeshBuilder.CreatePlane('controlNext', {height: 1, width: 1}, this.babylonService.getScene());
    this.controlNext.parent = this.babylonService.getScene().activeCamera;
    this.controlNext.position.x = this.posXcontrolNext;
    this.controlNext.position.y = this.posYcontrolNext;
    this.controlNext.position.z = this.posZcontrolNext;
    this.controlNext.material = new BABYLON.StandardMaterial('controlMat', this.babylonService.getScene());
    this.controlNext.material.alpha = 1;
    this.controlNext.renderingGroupId = 1;
    this.controlNext.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    BABYLON.Tags.AddTagsTo(this.controlNext, 'control');
    
    const label2 = this.createLabel2();
    GUI.AdvancedDynamicTexture.CreateForMesh(this.controlNext).addControl(label2);
  }

  private createLabelFullscreen(){

    const label = BABYLON.GUI.Button.CreateSimpleButton("but1", "Next Annotation");
    label.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    label.width = '5%';
    label.height = '5%';
    label.color = 'black';
    label.thickness = 1;
    label.background = 'black';
    label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    label.onPointerMoveObservable.add(() => {
      if(this.controlPrevious.metadata){
        this.controlPrevious.metadata = null;
        this.previousAnnotation();
      }
    });
   return label;
  }

  private createLabel() {

    const label = new GUI.Ellipse('controlPreviousLabel');
    label.width = '100%';
    label.height = '100%';
    label.color = 'white';
    label.thickness = 1;
    label.background = 'black';
    label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    label.onPointerMoveObservable.add(() => {
      if(this.controlPrevious.metadata){
        this.controlPrevious.metadata = null;
        this.previousAnnotation();
      }
    });
   return label;
  }

  private createLabel2() {

    const label = new GUI.Ellipse('controlNextLabel');
    label.width = '100%';
    label.height = '100%';
    label.color = 'white';
    label.thickness = 1;
    label.background = 'black';
    label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    label.onPointerMoveObservable.add(() => {
      if(this.controlNext.metadata){
        this.controlNext.metadata = null;
        this.nextAnnotation();
      }
    });
    return label;
  }

  // Function -- create Mesh: AnnotationContent (TextMesh + TextFieldLabel)
  public createVRAnnotationContentField() {

    this.annotationTextGround = BABYLON.Mesh.CreatePlane('annotationTextGround', 1, this.babylonService.getScene());
    this.annotationTextGround.material = new BABYLON.StandardMaterial('contentMat', this.babylonService.getScene());
    this.annotationTextGround.material.alpha = 1;
    this.annotationTextGround.renderingGroupId = 1;
    this.annotationTextGround.parent = this.babylonService.getScene().activeCamera;
    this.annotationTextGround.position.x = this.posXtextfield;
    this.annotationTextGround.position.y = this.posYtextfield;
    this.annotationTextGround.position.z = this.posZtextfield;
    this.annotationTextGround.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    BABYLON.Tags.AddTagsTo(this.annotationTextGround, 'control');

    const rect1 = new GUI.Rectangle();
    rect1.cornerRadius = 45;
    rect1.thickness = 10;
    rect1.background = 'gray';
    rect1.alpha = 0.5;

    GUI.AdvancedDynamicTexture.CreateForMesh(this.annotationTextGround, 1024, 512).addControl(rect1);

    this.annotationTextField = new GUI.TextBlock();
    this.annotationTextField.text = 'Look around to start the annotation tour.';
    this.annotationTextField.fontFamily = 'Lucida Console';
    this.annotationTextField.fontSize = '50';
    rect1.addControl(this.annotationTextField);
  }

  public deleteVRElements() {

        this.babylonService.getScene().getMeshesByTags('control').forEach(function (value) {
          value.dispose();
        });
  }

  // private moveVRcontrols() {

  // }

  private previousAnnotation() {

    if (this.annotationService.annotations.length) {
      if (this.actualRanking === 0) {
        this.actualRanking = this.annotationService.annotations.length;
      }
      if (this.actualRanking !== 0) {
        this.actualRanking = this.actualRanking - 1;
      }
    }
    if (this.actualRanking < 0) {
      this.actualRanking = 0;
    }
    if (this.actualRanking > this.annotationService.annotations.length) {
      this.actualRanking = this.annotationService.annotations.length;
    }
    this.getAction(this.actualRanking);
  }

  private nextAnnotation() {

    if (this.annotationService.annotations.length) {
      if (this.actualRanking > this.annotationService.annotations.length - 1) {
        this.actualRanking = this.annotationService.annotations.length - 1;
      } else {
        this.actualRanking = this.actualRanking + 1;
      }
      if (this.actualRanking === this.annotationService.annotations.length) {
        this.actualRanking = 0;
      }
    } else {
      this.actualRanking = 0;
    }
    if (this.actualRanking < 1) {
      this.actualRanking = 0;
    }
    if (this.actualRanking > this.annotationService.annotations.length) {
      this.actualRanking = 0;
    }
    this.getAction(this.actualRanking);
  }

  private getAction(index: number) {

    if (this.annotationService.annotations.length) {
      this.annotationTextField.text = this.annotationService.annotations[index].title;

      let cameraVector;
      let i = 1;
      this.babylonService.getScene().getMeshesByTags('plane', mesh => {

        // DEBUG
        if (Math.abs(i % 2) != 1){
          i++;
        }
        else {
          i++;
          
          const annoID = this.annotationService.annotations[index]["_id"] + "_pick";

          if (annoID === mesh.name){

            cameraVector = mesh.position;
            this.cameraService.moveVRCameraToTarget(cameraVector);
          }
        }
      });
    } else {
      this.actualRanking = 0;
    }
  }


}
