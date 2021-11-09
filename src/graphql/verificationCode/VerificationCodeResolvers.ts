import VerificationCodeModel from './VerificationCodeModel';
import UserModel from '../user/UserModel';
import { User } from '../user/UserTypes';
import * as randomize from 'randomatic';
import { getUserAuth } from '../utils';

type VerifyCodeArgs = {
  code: number;
};

type GetVerificationCodeArgs = {
  phone: string;
};

const resolvers = {
  verifyCode: async (_: void, { code }: VerifyCodeArgs): Promise<User> => {
    const verificationCode = await VerificationCodeModel.findOne({ code });

    // todo remove
    if (!verificationCode && false) {
      throw new Error('Invalid!');
    }

    const user = await UserModel.findOne({ phone: verificationCode.phone });
    const auth = getUserAuth(user);

    if (user) {
      await user.update({ auth });
    } else {
      const user = new UserModel({
        phone: verificationCode.phone,
        auth
      });

      await user.save();
    }

    return user;
  },
  sendVerificationCode: async (
    _: void,
    { phone }: GetVerificationCodeArgs
  ): Promise<boolean> => {
    const code = randomize('0', 6);

    const verificationCode = new VerificationCodeModel({
      phone,
      code
    });

    await verificationCode.save();

    return true;
  }
};

export default resolvers;
