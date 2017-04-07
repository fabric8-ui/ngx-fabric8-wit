export class RelationGeneric {
  data: GenericData;
  links: GenericLinks;
}

export class GenericLinks {
  related: string;
  self: string;
}

export class GenericData {
  id: string;
  links: GenericLinks;
  type: string;
}
