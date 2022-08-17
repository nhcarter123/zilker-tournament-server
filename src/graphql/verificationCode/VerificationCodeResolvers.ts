import VerificationCodeModel from './VerificationCodeModel';
import UserModel from '../user/UserModel';
import { customAlphabet } from 'nanoid/non-secure';
import { generateToken } from '../utils';
import { sendText } from './helpers/twilio';
import { User } from '../user/UserTypes';
import { mapToUser, mapToUserNonNull } from '../../mappers/mappers';
import crypto from 'crypto';

const nanoid = customAlphabet('1234567890', 4);

type VerifyCodeArgs = {
  code: string;
};

interface ILoginPhoneArgs {
  phone: string;
}

interface ILoginEmailArgs {
  email: string;
  password: string;
}

enum EVerificationCodeType {
  Phone = 'Phone',
  Email = 'Email'
}

const hash = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(8).toString('hex');

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
};

const verify = async (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    if (!salt) {
      throw reject('invalid');
    }
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(key == derivedKey.toString('hex'));
    });
  });
};

const resolvers = {
  verifyCode: async (_: void, { code }: VerifyCodeArgs): Promise<User> => {
    const verificationCode = await VerificationCodeModel.findOne({ code });

    if (!verificationCode) {
      throw new Error('Invalid code');
    }

    let user = await UserModel.findOne({
      $or: [
        { phone: verificationCode.phone },
        { email: verificationCode.email }
      ]
    });

    const token = generateToken(
      user?.phone || verificationCode.phone || verificationCode.email
    );

    if (user) {
      await UserModel.updateOne({ _id: user._id }, { token });
    } else {
      if (verificationCode.phone === EVerificationCodeType.Phone) {
        user = new UserModel({
          phone: verificationCode.phone,
          token
        });
      } else {
        const hashedPassword = await hash(verificationCode.password);

        user = new UserModel({
          email: verificationCode.email,
          password: hashedPassword,
          token
        });
      }

      await user.save();
    }

    return mapToUserNonNull(user);
  },

  loginPhone: async (_: void, { phone }: ILoginPhoneArgs): Promise<boolean> => {
    const code = nanoid();

    const existingCodesByUser = await VerificationCodeModel.count({ phone });

    if (existingCodesByUser > 3) {
      throw new Error('Rate limit exceeded');
    }

    const verificationCode = new VerificationCodeModel({
      source: phone,
      type: EVerificationCodeType.Phone,
      code
    });

    await verificationCode.save();

    await sendText(`Verification code: ${code}. Zilker Chess.`, phone);

    return true;
  },

  loginEmail: async (
    _: void,
    { email, password }: ILoginEmailArgs
  ): Promise<Nullable<User>> => {
    const code = nanoid();

    const existingUser = await UserModel.findOne({
      email
    }).then(mapToUser);

    if (existingUser) {
      if (existingUser.password) {
        const passwordMatches = await verify(password, existingUser.password);

        if (passwordMatches) {
          return existingUser;
        }
      }
    }

    const existingCodesByUser = await VerificationCodeModel.count({ email });

    if (existingCodesByUser > 3) {
      throw new Error('Rate limit exceeded');
    }

    const verificationCode = new VerificationCodeModel({
      source: email,
      type: EVerificationCodeType.Email,
      code
    });

    await verificationCode.save();

    // TODO: VERY BAD REMOVE WHEN EMAIL OR PHONE IS LIVE
    const token = generateToken(email);
    const hashedPassword = await hash(password);

    const user = new UserModel({
      email: email,
      password: hashedPassword,
      token
    });

    await user.save();

    return mapToUser(user);
  }
};

export default resolvers;
