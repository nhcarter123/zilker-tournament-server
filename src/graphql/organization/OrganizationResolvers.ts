import OrganizationModel from './OrganizationModel';
import { Organization } from './OrganizationTypes';
import { mapToOrganization, mapToOrganizations } from '../../mappers/mappers';
import { VerifiedContext } from '../TypeDefinitions';
import UserModel from '../user/UserModel';

interface IGetOrganizationArgs {
  organizationId: string;
}

interface IUpdateOrganizationArgs {
  organizationId: string;
  payload: {
    name?: string;
  };
}

const resolvers = {
  createOrganization: async (
    _: void,
    _args: void,
    context: VerifiedContext
  ): Promise<Organization> => {
    if (context.user.organizationId) {
      throw new Error('User already created an organization');
    }

    const organization = new OrganizationModel({
      name: `${context.user.firstName}'s Club`
    });

    await organization.save();

    await UserModel.findOneAndUpdate(
      { _id: context.user._id },
      { organizationId: organization._id }
    );

    return organization;
  },

  updateOrganization: async (
    _: void,
    { organizationId, payload }: IUpdateOrganizationArgs
  ): Promise<boolean> => {
    await OrganizationModel.findOneAndUpdate({ _id: organizationId }, payload, {
      new: true
    }).then(mapToOrganization);

    return true;
  },

  getOrganization: async (
    _: void,
    { organizationId }: IGetOrganizationArgs
  ): Promise<Nullable<Organization>> => {
    return OrganizationModel.findOne({ _id: organizationId }).then(
      mapToOrganization
    );
  },

  getOrganizations: async (): Promise<Organization[]> => {
    return OrganizationModel.find().then(mapToOrganizations);
  }
};

export default resolvers;
