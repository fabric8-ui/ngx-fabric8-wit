import { RelationGeneric, GenericLinks } from './generic';

export interface Area {
  id: string;
  attributes: AreaAttributes;
  type: string;
  links: GenericLinks;
  relationships: AreaRelations;
}

export class AreaAttributes {
  name: string;
  'updated-at': string;
  'created-at': string;
  'parent_path': string;
  'parent_path_resolved': string;
  version: number;
}

export class AreaRelations {
  children: RelationGeneric;
  parent: RelationGeneric;
  space: RelationGeneric;
  workitems: RelationGeneric;
}
