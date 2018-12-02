import {Injectable} from '@angular/core';
import {BabylonService} from '../babylon/babylon.service';
import {CameraService} from '../camera/camera.service';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {AnnotationService} from '../annotation/annotation.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationvrService {


  private controls = [];
  private textBlock = new BABYLON.GUI.TextBlock();

  private selectingControl: boolean;
  private selectedControl: boolean;
  private selectedIndex: number;
  public positionVector: BABYLON.Vector3;
  public actualRanking: number;

  constructor(private babylonService: BabylonService) {
    this.controls = [];
    this.positionVector = BABYLON.Vector3.Zero();
    this.actualRanking = 0;
    this.selectingControl = false;
    this.selectedControl = false;
    this.selectedIndex = -1;
  }

  public createVRAnnotationControls() {

    this.controls.push(this.createPlane('control0', 0.5, 'control0', -1.5, -0.9, 3));
    this.createLabel('<', BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.controls[0], 1024, 512));

    this.controls.push(this.createPlane('control1', 0.5, 'control1', 1.5, -0.9, 3));
    this.createLabel('>', BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.controls[1], 1024, 512));

    this.babylonService.getVRHelper().onNewMeshSelected.add(function (mesh) {
      if (mesh.name.indexOf('control') !== -1) {
        this.selectedIndex = mesh.name[mesh.name.length - 1];
        this.controls[this.selectedIndex].material.diffuseColor = BABYLON.Color3.Blue();
        this.controls[this.selectedIndex].text = 'Selecting';
        this.selectingControl = true;
      } else {
        this.selectingControl = false;
        this.selectingControl = false;
        if (this.selectedIndex !== -1) {
          this.controls[this.selectedIndex].material.diffuseColor = BABYLON.Color3.White();
          this.controls[this.selectedIndex].scaling.width = 1;
          this.controls[this.selectedIndex].scaling.height = 1;
          this.controls[this.selectedIndex].text = 'Control ' + this.selectedIndex;
          this.selectedIndex = -1;
        }
      }
    });

    this.babylonService.getScene().registerBeforeRender(function () {
      if (this.selectingControl && !this.selectedControl) {
        this.controls[this.selectedIndex].scaling.width += 0.005;
        this.controls[this.selectedIndex].scaling.height += 0.005;

        if (this.controlls[this.selectedIndex].scaling.width >= 1.2) {
          this.selectedControl = true;
          this.controls[this.selectedIndex].text = 'Selected';
        }
      }
      if (this.selectedControl) {
        this.controls[this.selectedIndex].material.diffuseColor = BABYLON.Color3.Red();
      }
    });
  }


  public createVRAnnotationContentField() {

    const plane = this.createPlane('textfield', 0.7, 'textfield', 0, -0.9, 3);
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane, 1024, 512);
    let rect1 = new BABYLON.GUI.Rectangle();
    rect1.cornerRadius = 45;
    rect1.thickness = 10;
    rect1.background = 'gray';
    rect1.alpha = 0.5;
    advancedTexture.addControl(rect1);

    this.textBlock.text = 'Look around to start the annotation tour.';
    this.textBlock.fontFamily = 'Lucida Console';
    this.textBlock.fontSize = '150';
    rect1.addControl(this.textBlock);
  }

  private createPlane(name: string, size: number, tag: string, posX: number, posY: number, posZ: number) {
    const plane = BABYLON.Mesh.CreatePlane(name, size, this.babylonService.getScene());
    BABYLON.Tags.AddTagsTo(plane, tag);
    plane.material = new BABYLON.StandardMaterial('contentMat', this.babylonService.getScene());
    plane.material.alpha = 1;
    plane.renderingGroupId = 1;
    // TODO: Das ist Schrott so kann man gar nicht selecten
    plane.parent = this.babylonService.getScene().activeCamera;
    plane.position.x = posX;
    plane.position.y = posY;
    plane.position.z = posZ;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    return plane;
  }

  private createLabel(text: string, advancedTexture: BABYLON.GUI.AdvancedDynamicTexture) {

    const rect1 = new BABYLON.GUI.Rectangle();
    rect1.cornerRadius = 45;
    rect1.thickness = 10;
    rect1.background = 'gray';
    rect1.alpha = 0.5;
    advancedTexture.addControl(rect1);

    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = text;
    textBlock.fontFamily = 'Lucida Console';
    textBlock.fontSize = '200';
    textBlock.color = 'white';
    rect1.addControl(textBlock);
  }

  /*
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

        const test = this.annotationService.annotations[index];
        const test2 = this.annotationService.annotations.length;
        console.log('annotation an der Stelle ' + index + ' ist ' + test + 'Array länge ' + test2);
        if (this.annotationService.annotations.length) {
          this.title = this.annotationService.annotations[index].title;
          const cameraVector = new BABYLON.Vector3(this.annotationService.annotations[index].cameraPosition[0].value,
            this.annotationService.annotations[index].cameraPosition[1].value,
            this.annotationService.annotations[index].cameraPosition[2].value);
          this.cameraService.moveCameraToTarget(cameraVector);
          // this.annotationmarkerService.toggleCreatorPopup(this.annotationService.annotations[index]._id);
        } else {
          this.actualRanking = 0;
        }
      }*/

}