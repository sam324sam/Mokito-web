import { Component, Input } from '@angular/core';
import { EntityStoreService } from '../../../../services/entity-store.service';
import { Entity } from '../../../../models/entity/entity.model';

@Component({
  selector: 'app-debug-show',
  imports: [],
  templateUrl: './debug-show.html',
  styleUrl: './debug-show.scss',
})
export class DebugShow {
  @Input() isDebugSectionOpen: boolean = false;
  entityDebug: Entity[] = [];
  constructor(private readonly entityStoreService: EntityStoreService) {
    this.entityDebug = this.entityStoreService.getAllEntities();
  }
}
