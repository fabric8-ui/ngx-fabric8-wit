export interface Area {
  id: string;
  attributes: AreaAttributes;
  type: string;
}

export class AreaAttributes {
  name: string;
  'updated-at': string;
  'created-at': string;
  'parent_path': string;
  'parent_path_resolved': string;
  version: number;
}
