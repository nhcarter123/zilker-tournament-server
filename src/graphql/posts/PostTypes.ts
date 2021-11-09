import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export type PostType = {
  _id: string;
  title: string;
  description: string;
  user: string;
};

export type PostConnection = {
  count: number;
  posts: Array<PostType>;
};

const postType: DocumentNode = gql`
  type Post {
    _id: String
    title: String
    description: String
    user: User
  }

  type PostConnection {
    count: Int
    posts: [Post]
  }
`;

export default postType;
