import VerificationCodeModel from './VerificationCodeModel';
import UserModel from '../user/UserModel';
import { customAlphabet } from 'nanoid/non-secure';
import { generateToken } from '../utils';
import { sendText } from './helpers/twilio';
import { User } from '../user/UserTypes';
import { mapToUserNonNull } from '../../mappers/mappers';

const nanoid = customAlphabet('1234567890', 4);

type VerifyCodeArgs = {
  code: string;
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
      await UserModel.updateOne({ _id: user._id }, { token });
    } else {
      user = new UserModel({
        phone: verificationCode.phone,
        token
      });

      await user.save();
    }

    return mapToUserNonNull(user);
  },

  sendVerificationCode: async (
    _: void,
    { phone }: GetVerificationCodeArgs
  ): Promise<boolean> => {
    const code = nanoid();

    const verificationCode = new VerificationCodeModel({
      phone,
      code
    });

    await verificationCode.save();

    await sendText(`Verification code: ${code}. Zilker Park Chess.`, phone);

    return true;
  }
};

export default resolvers;
