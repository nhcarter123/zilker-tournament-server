import { FileUpload } from 'graphql-upload';
import UserModel from './UserModel';
import type { Context, VerifiedContext } from '../TypeDefinitions';
import { User } from './UserTypes';
import { mapToUser, mapToUsers } from '../../mappers/mappers';
import AmazonS3URI from 'amazon-s3-uri';
import { deletePhoto, uploadPhoto } from '../../aws/s3';

type UpdateUserDetailsPayload = {
  firstName?: string,
  lastName?: string,
  rating?: number,
};

type UploadPhotoArgs = {
  photo: FileUpload,
};

type GetUserArgs = {
  userId: string,
};

type GetUsersArgs = {
  userIds: string[],
  filterTerm?: string,
};

const resolvers = {
  // Query
  me: (_: void, args: void, context: Context): Nullable<User> => context.user,

  getUser: async (_: void, { userId }: GetUserArgs): Promise<Nullable<User>> => {
    return UserModel.findOne({ _id: userId }).then(mapToUser);
  },

  getUsers: async (_: void, { userIds, filterTerm }: GetUsersArgs): Promise<User[]> => {
    const query = filterTerm
      ? {
        _id: { $in: userIds },
        name: {
          $regex: new RegExp(`^${filterTerm}`, 'ig')
        }
      }
      : { _id: { $in: userIds } };

    return UserModel.find(query).then(mapToUsers);
  },

  // Mutation
  updateUserDetails: async (_: void, {
    payload
  }: { payload: UpdateUserDetailsPayload }, context: VerifiedContext): Promise<boolean> => {

    await UserModel.findOneAndUpdate({ _id: context.user._id }, payload);

    return true;
  },

  uploadPhoto: async (_: void, { photo }: UploadPhotoArgs, context: VerifiedContext): Promise<boolean> => {
    const url = await uploadPhoto(photo);

    await UserModel.findOneAndUpdate({ _id: context.user._id }, { photo: url });

    if (context.user.photo) {
      // delete old photo
      const uri = context.user.photo || '';
      const { key } = AmazonS3URI(uri);

      await deletePhoto(key || '');
    }

    return true;
  },

  deletePhoto: async (_: void, _args: void, context: VerifiedContext): Promise<boolean> => {
    const uri = context.user.photo || '';
    const { key } = AmazonS3URI(uri);

    await deletePhoto(key || '');

    await UserModel.findOneAndUpdate({ _id: context.user._id }, { $unset: { photo: 1 } });

    return true;
  }
};

export default resolvers;
