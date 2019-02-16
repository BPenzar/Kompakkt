import {AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {AnnotationService} from '../../services/annotation/annotation.service';
import {AnnotationComponent} from '../annotation/annotation.component';
import {AnnotationmarkerService} from '../../services/annotationmarker/annotationmarker.service';
// 15/02/19
import {AnnotationsEditorComponent} from '../annotations-editor/annotations-editor.component';

@Component({
  selector: 'app-annotationcards',
  templateUrl: './annotationcards.component.html',
  styleUrls: ['./annotationcards.component.scss']
})
export class AnnotationcardsComponent implements OnInit, AfterViewInit {

  public popup_is_open = '';

  @ViewChildren(AnnotationComponent)
  annotationsList: QueryList<AnnotationComponent>;

  // 15/02/19
  @ViewChildren(AnnotationsEditorComponent)
  editorAnnotationsList: QueryList<AnnotationsEditorComponent>;


  constructor(public annotationService: AnnotationService, private annotationmarkerService: AnnotationmarkerService) {
  }


  ngOnInit() {
  }


  ngAfterViewInit(): void {

    // 15/02/19
    this.editorAnnotationsList.changes.subscribe(
      () => {

        this.annotationsList.forEach(function (value) {
          })
        } 
      );

    this.annotationsList.changes.subscribe(
      () => {
        // 15/02/19
        // setVisabile only for newly created annotation (double click on mesh)
        this.setVisability(this.annotationmarkerService.open_popup, true);

        this.annotationsList.forEach(function (value) {
          })
        } 
      );
    

    this.annotationmarkerService.popupIsOpen().subscribe(
      popup_is_open => this.setVisability(popup_is_open, true)
    );

  }

  public setVisability(id: string, visibility: boolean) {
    if (this.annotationsList.find(annotation => annotation.id === id) != null) {
      this.hideAllCards();
      this.annotationsList.find(annotation => annotation.id === id).visabilityAnnotationCard(visibility);
    }
  }

  public hideAllCards() {
    if (this.annotationsList != null) {
      this.annotationsList.forEach(function (value) {
        value.visabilityAnnotationCard(false);
      });
    }
  }

}
