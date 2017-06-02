export interface SpaceTemplate {
  attributes: SpaceTemplateAttributes,
  id: string,
  type:string
}

export class SpaceTemplateAttributes {
  'created-at': string;
  description: string;
  name: string;
  template: string;
  'updated-at': string;
  version: number;
};
