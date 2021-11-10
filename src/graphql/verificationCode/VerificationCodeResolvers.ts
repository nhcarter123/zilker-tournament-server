import VerificationCodeModel from './VerificationCodeModel';
import UserModel from '../user/UserModel';
import { User } from '../user/UserTypes';
import * as randomize from 'randomatic';
import { generateToken } from '../utils';

type VerifyCodeArgs = {
  code: number;
};

type GetVerificationCodeArgs = {
  phone: string;
};

const resolvers = {
  verifyCode: async (_: void, { code }: VerifyCodeArgs): Promise<User> => {
    const verificationCode = await VerificationCodeModel.findOne({ code });

    if (!verificationCode) {
      throw new Error('Invalid!');
    }

    let user = await UserModel.findOne({
      phone: verificationCode.phone
    });

    const token = generateToken(user?.phone || verificationCode.phone);

    if (user) {
      await user.update({ token });
    } else {
      user = new UserModel({
        phone: verificationCode.phone,
        token
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
