import PostModel from './PostModel';
import UserModel from '../user/UserModel';
import type { PostType, PostConnection } from './PostTypes';
import type { Context } from '../TypeDefinitions';

type FindOnePost = {
  id: string,
};

// todo move
export type ConnectionArgs = {
  search: string,
  after: number,
  first: number,
};

type PostArgs = {
  title: string,
  description: string,
};

const resolvers = {
  Post: {
    user: async ({ user }: PostType) => await UserModel.findOne({ _id: user }),
  },
  post: async (obj: PostType, args: FindOnePost, context: Context): Promise<PostType> => {
    const { id } = args;
    const { user } = context;

    if (!user) {
      throw new Error('Unauthenticated');
    }

    return PostModel.findOne({ _id: id });
  },
  postAdd: async (obj: PostType, args: PostArgs, context: Context): Promise<PostType> => {
    const { title, description } = args;
    const { user } = context;

    if (!user) {
      throw new Error('Unauthenticated');
    }

    const post = new PostModel({
      title,
      description,
      user: user._id,
    });

    await post.save();

    const { _id } = post;

    return PostModel.findOne({ _id });
  },
  userPosts: async (args: ConnectionArgs, userId: string): Promise<PostConnection> => {
    const { search, after, first } = args;

    if (!userId) {
      throw new Error('NotFound');
    }

    const where = search
      ? {
        user: userId,
        title: {
          $regex: new RegExp(`^${search}^`, 'ig'),
        },
      }
      : {
        user: userId,
      };

    const posts = !after
      ? PostModel.find(where).limit(first)
      : PostModel.find(where)
        .skip(after)
        .limit(first);

    return {
      count: await PostModel.count(),
      posts: await posts,
    };
  },
  posts: async (obj: PostType, args: ConnectionArgs, context: Context): Promise<PostConnection> => {
    const { search, after, first } = args;
    const { user } = context;

    if (!user) {
      throw new Error('Unauthenticated');
    }

    const where = search
      ? {
        title: {
          $regex: new RegExp(`^${search}^`, 'ig'),
        },
      }
      : {};

    const posts = !after
      ? PostModel.find(where).limit(first)
      : PostModel.find(where)
        .skip(after)
        .limit(first);

    return {
      count: await PostModel.count(),
      posts: await posts,
    };
  },
};

export default resolvers;
