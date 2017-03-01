import { Team } from './team';
import { ProcessTemplate } from './process-template';

export interface Space {
    name: string;
    path: String;
    description: String;
    process?: ProcessTemplate;
    privateSpace?: boolean;
    teams: Team[];
    defaultTeam: Team;
    id: string;
    attributes: SpaceAttributes;
    type: string;
    links: SpaceLink;
    relationships: SpaceRelationships;
}

export class SpaceLink {
    self: string;
}

export class SpaceRelationships {
    areas: SpaceRelatedLink;
    iterations: SpaceRelatedLink;
}

export class SpaceRelatedLink {
    links: {
        related: string
    };
}

export class SpaceAttributes {
    name: string;
    'updated-at': string;
    'created-at': string;
    version: number;
}
