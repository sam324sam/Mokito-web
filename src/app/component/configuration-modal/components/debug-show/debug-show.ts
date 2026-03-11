import { Component, Input, OnChanges } from '@angular/core';
import { EntityStoreService } from '../../../../services/entity-store.service';
import { Entity } from '../../../../models/entity/entity.model';

@Component({
  selector: 'app-debug-show',
  imports: [],
  templateUrl: './debug-show.html',
  styleUrl: './debug-show.css',
})
export class DebugShow implements OnChanges {
  @Input() isDebugSectionOpen: boolean = false;

  entityDebug: Entity[] = [];
  expandedEntities = new Set<number>();

  constructor(private readonly entityStoreService: EntityStoreService) {}

  ngOnChanges() {
    if (this.isDebugSectionOpen) {
      this.entityDebug = [...this.entityStoreService.getZOrder()];
    }
  }

  toggleEntity(id: number | null) {
    if (id == null) return;

    if (this.expandedEntities.has(id)) {
      this.expandedEntities.delete(id);
    } else {
      this.expandedEntities.add(id);
    }
  }

  isExpanded(id: number | null) {
    if (id == null) return false;
    return this.expandedEntities.has(id);
  }
}
