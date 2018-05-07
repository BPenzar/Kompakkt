/**
 * @author Benedikt Mildenberger
 */

import {Injectable} from '@angular/core';
import * as BABYLON from 'babylonjs';

import {BabylonService} from '../engine/babylon.service';
import Vector3 = BABYLON.Vector3;

@Injectable({
  providedIn: 'root'
})

export class CameraService {

  private canvas: HTMLCanvasElement;
  private scene: BABYLON.Scene;
  private arcRotateCamera: BABYLON.ArcRotateCamera;
  private universalCamera: BABYLON.UniversalCamera;
  private alpha: number;
  private beta: number;
  private radius: number;
  private x: number;
  private y: number;
  private z: number;
  private xRot: number;
  private yRot: number;

  constructor(
    private babylonService: BabylonService
  ) {
  }

  public createCameras(canvas: HTMLCanvasElement) {

    this.alpha = 9;
    this.beta = 1.3;
    this.radius = 100;

    this.canvas = canvas;
    this.scene = this.babylonService.getScene();

    this.arcRotateCamera = this.babylonService.createArcRotateCam('arcRotateCamera',
      this.alpha, this.beta, this.radius, Vector3.Zero());

    this.arcRotateSettings();

    this.x = 0;
    this.y = 50;
    this.z = 100;

    this.universalCamera = this.babylonService.createUniversalCam('universalCamera',
      new BABYLON.Vector3(this.x, this.y, this.z));
    this.universalSettings();

    this.xRot = this.universalCamera.rotation.x;
    this.yRot = this.universalCamera.rotation.y;

    this.arcRotateCamera.attachControl(canvas, true);

    this.setCamCollider();
  }

  // Very bad workaround which would normaly never have happend
  // under the supervision of the almighty Jan Wieners.
  // Current state: - waiting for Babylon forum.

  public setCamArcRotate() {

    if (this.scene.activeCamera.getClassName() !== 'ArcRotateCamera') {

      this.arcRotateCamera.dispose();
      this.arcRotateCamera = this.babylonService.createArcRotateCam('arcRotateCamera',
        this.alpha, this.beta, this.radius, Vector3.Zero());
      this.arcRotateSettings();
      this.setCameraActive(this.arcRotateCamera);
    }
  }

  public setCamUniversal() {

    if (this.scene.activeCamera.getClassName() !== 'UniversalCamera') {

      this.universalCamera.dispose();
      this.universalCamera = this.babylonService.createUniversalCam('universalCamera',
        {x: this.x, y: this.y, z: this.z});
      this.universalSettings();
      this.setCameraActive(this.universalCamera);
    }
  }

  public setBackToDefault() {

    switch (this.scene.activeCamera.getClassName()) {

      case 'ArcRotateCamera':
        this.setCamArcRotateDefault();
        break;
      case 'UniversalCamera':
        this.setCamUniversalDefault();
        break;
    }

    this.canvas.focus();
  }

  private setCameraDefaults(camera: any) {

    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    camera.setTarget(Vector3.Zero());
  }

  private setCameraActive(camera: any) {
    this.scene.activeCamera = camera;
    camera.attachControl(this.canvas, true);
  }

  private arcRotateSettings() {

    this.setCameraDefaults(this.arcRotateCamera);
    this.arcRotateCamera.panningSensibility = 25;
    this.arcRotateCamera.upperRadiusLimit = 200;
    this.canvas.focus();
  }

  private universalSettings() {

    this.setCameraDefaults(this.universalCamera);
    this.universalCamera.ellipsoid = new BABYLON.Vector3(10, 10, 10);
    this.universalCamera.checkCollisions = true;
    this.canvas.focus();
  }

  private setCamArcRotateDefault() {

    this.scene.activeCamera = this.arcRotateCamera;
    this.arcRotateCamera.attachControl(this.canvas, true);

    const animCamAlpha = this.babylonService.createCamAnimationCycle('animCam', 'alpha', 30);
    animCamAlpha.setKeys([
      {
        frame: 0,
        value: this.arcRotateCamera.alpha
      }, {
        frame: 30,
        value: this.alpha
      }
    ]);
    this.arcRotateCamera.animations.push(animCamAlpha);

    const animCamBeta = this.babylonService.createCamAnimationCycle('animCam', 'beta', 30);
    animCamBeta.setKeys([
      {
        frame: 0,
        value: this.arcRotateCamera.beta
      }, {
        frame: 30,
        value: this.beta
      }]);
    this.arcRotateCamera.animations.push(animCamBeta);

    const animCamRadius = this.babylonService.createCamAnimationCycle('animCam', 'radius', 30);
    animCamRadius.setKeys([
      {
        frame: 0,
        value: this.arcRotateCamera.radius
      }, {
        frame: 30,
        value: this.radius
      }]);
    this.arcRotateCamera.animations.push(animCamRadius);

    this.arcRotateCamera.setTarget(Vector3.Zero());

    this.scene.beginAnimation(this.arcRotateCamera, 0, 30, false, 1, function () {
    });
  }

  private setCamUniversalDefault() {

    const setBackAnm = this.babylonService.createCamAnimationStatic('animCam', 'position', 30);

    const setBackRotXAnm = this.babylonService.createCamAnimationCycle('animCam', 'rotation.x', 30);
    const setBackRotYAnm = this.babylonService.createCamAnimationCycle('animCam', 'rotation.y', 30);

    setBackAnm.setKeys([{
      frame: 0,
      value: new BABYLON.Vector3(this.universalCamera.position.x, this.universalCamera.position.y, this.universalCamera.position.z)
    }, {
      frame: 30,
      value: new BABYLON.Vector3(this.x, this.y, this.z)
    }]);
    setBackRotXAnm.setKeys([{
      frame: 15,
      value: this.universalCamera.rotation.x
    }, {
      frame: 30,
      value: this.xRot
    }]);
    setBackRotYAnm.setKeys([{
      frame: 15,
      value: this.universalCamera.rotation.y
    }, {
      frame: 30,
      value: this.yRot
    }]);

    this.universalCamera.animations.push(setBackAnm);
    this.universalCamera.animations.push(setBackRotXAnm);
    this.universalCamera.animations.push(setBackRotYAnm);

    this.scene.beginAnimation(this.universalCamera, 0, 30, false, 1, function () {
    });
  }

  // Suggestion: change to
  // https://doc.babylonjs.com/babylon101/cameras,_mesh_collisions_and_gravity#web-worker-based-collision-system-since-21
  private setCamCollider() {

    const planes = [];

    for (let i = 0; i <= 5; i++) {
      planes.push(this.babylonService.createCamCollider('plane' + String([i]), {height: 500, width: 500}));
      planes[i].visibility = 0;
    }

    planes[0].rotation.x = 90 * Math.PI / 180;  // lower
    planes[2].rotation.y = 90 * Math.PI / 180;  // side
    planes[3].rotation.x = Math.PI;             // side
    planes[4].rotation.y = 270 * Math.PI / 180; // side
    planes[5].rotation.x = 270 * Math.PI / 180; // upper

    for (let i = 0; i <= 5; i++) {
      this.babylonService.setPlaneCollision(planes[i], {x: 0, y: 0, z: 240});
    }

    this.scene.collisionsEnabled = true;

    return planes;
  }
}
