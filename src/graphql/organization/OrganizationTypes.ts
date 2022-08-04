import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export interface Organization {
  _id: string;
  name: string;
}

const OrganizationType: DocumentNode = gql`
  input UpdateOrganizationPayload {
    name: String!
  }

  type Organization {
    _id: String!
    name: String!
  }
`;

export default OrganizationType;
