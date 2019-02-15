import {Component, Input, OnInit} from '@angular/core';
import {Model} from '../../interfaces/model/model.interface';
import {CatalogueService} from '../../services/catalogue/catalogue.service';
import {LoadModelService} from '../../services/load-model/load-model.service';

// 15/02/19
// import {AnnotationcardsComponent} from '../annotationcards/annotationcards.component';


@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {

  @Input() model: Model;

  constructor(private catalogueService: CatalogueService,
              private loadModelService: LoadModelService,
              // 15/02/19
              // private annotationCardComp: AnnotationcardsComponent
              ) {
  }

  ngOnInit() {
  }

  public async changeModel() {
    this.loadModelService.loadModel(this.model);

    // 15/02/19
    // this.annotationCardComp.hideAllCards();
  }
}
