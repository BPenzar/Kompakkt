import { Component, Input, OnInit } from '@angular/core';
import { Model } from '../../interfaces/model/model.interface';
import { BabylonService } from '../../services/babylon/babylon.service';
import * as BABYLON from 'babylonjs';
import { ActionService } from '../../services/action/action.service';
import { AnnotationService } from '../../services/annotation/annotation.service';
import { CameraService } from '../../services/camera/camera.service';
import { CatalogueService } from '../../services/catalogue/catalogue.service';
import { LoadingscreenhandlerService } from '../../services/loadingscreenhandler/loadingscreenhandler.service';


@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  @Input() model: Model;

  private actualModelName: string;

  constructor(private babylonService: BabylonService,
    private actionService: ActionService,
    private annotationService: AnnotationService,
    private cameraService: CameraService,
    private catalogueService: CatalogueService,
    private loadingScreenHandler: LoadingscreenhandlerService
  ) {
  }

  ngOnInit() {
    this.catalogueService.Observables.quality.subscribe((result) => this.loadModel());
    this.catalogueService.Observables.model.subscribe((result) => this.loadModel());
  }

  public changeModel(): void {
    this.catalogueService.updateActiveModel(this.model);
  }

  public loadModel(): void {
    if (!this.loadingScreenHandler.isLoading) {
      this.babylonService.getScene().meshes.map(model => model.dispose());

      const modelUrl = 'https://blacklodge.hki.uni-koeln.de:8065/models/';
      const quality = this.catalogueService.Observables.quality.source['value'];
      const modelPath = this.catalogueService.Observables.model.source['value'].processed[quality];

      this.babylonService.loadModel(modelUrl, modelPath).then(model => {
        // Warte auf Antwort von loadModel, da loadModel ein Promise<object> von ImportMeshAync übergibt
        // model ist hier das neu geladene Model, aus dem wir direkt den Namen nehmen können

        // Zentriere auf das neu geladene Model
        this.cameraService.setActiveCameraTarget(model.meshes[0]._boundingInfo.boundingBox.centerWorld);

        // Füge Tags hinzu und lade Annotationen
        BABYLON.Tags.AddTagsTo(model.meshes[0], this.model.name);
        this.actionService.pickableModel(this.model.name, true);
        this.annotationService.initializeAnnotationMode(this.model.name);
        this.actualModelName = this.model.name;
        this.annotationService.loadAnnotations(this.actualModelName);
      });
    }
  }
}
