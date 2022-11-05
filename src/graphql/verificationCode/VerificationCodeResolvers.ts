import VerificationCodeModel from './VerificationCodeModel';
import UserModel from '../user/UserModel';
import { customAlphabet } from 'nanoid/non-secure';
import { generateToken } from '../utils';
import { sendText } from './helpers/sms';
import { User } from '../user/UserTypes';
import { mapToUser, mapToUserNonNull } from '../../mappers/mappers';
import crypto from 'crypto';
import { sendEmail } from '../../aws/ses';

const nanoid = customAlphabet('1234567890', 4);

type VerifyCodeArgs = {
  code: string;
};

interface IVerifyPhoneArgs {
  phone: string;
}

interface ILoginEmailArgs {
  email: string;
  password: string;
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
        {
          $and: [
            { phone: verificationCode.phone },
            { phone: { $exists: true } }
          ]
        },
        {
          $and: [
            { email: verificationCode.email },
            { email: { $exists: true } }
          ]
        }
      ]
    });

    const token = generateToken(
      user?.phone || verificationCode.phone || verificationCode.email || ''
    );

    if (user) {
      await UserModel.updateOne({ _id: user._id }, { token });
    } else {
      if (verificationCode.phone) {
        user = new UserModel({
          phone: verificationCode.phone,
          token
        });
      } else {
        user = new UserModel({
          email: verificationCode.email,
          password: verificationCode.password,
          token
        });
      }

      await user.save();
    }

    // add new token to user
    user.token = token;

    return mapToUserNonNull(user);
  },

  verifyPhone: async (
    _: void,
    { phone }: IVerifyPhoneArgs
  ): Promise<boolean> => {
    const code = nanoid();

    // second layer of rate limiting in case of spoofing
    const existingCodesByUser = await VerificationCodeModel.count({ phone });

    if (existingCodesByUser > 6) {
      throw new Error('Rate limit exceeded');
    }

    const verificationCode = new VerificationCodeModel({
      phone,
      code
    });

    await verificationCode.save();

    await sendText(`Verification code: ${code}. Zilker Chess.`, phone);

    return true;
  },

  verifyEmail: async (
    _: void,
    { email, password }: ILoginEmailArgs
  ): Promise<boolean> => {
    const code = nanoid();
    const lowerEmail = email.toLowerCase();
    const hashedPassword = await hash(password);

    const existingUser = await UserModel.findOne({
      email
    }).then(mapToUser);

    if (existingUser) {
      throw new Error('This email is already in use');
    }

    // second layer of rate limiting in case of spoofing
    const existingCodesByUser = await VerificationCodeModel.count({
      email: lowerEmail
    });

    if (existingCodesByUser > 6) {
      throw new Error('Rate limit exceeded');
    }

    const verificationCode = new VerificationCodeModel({
      email: lowerEmail,
      password: hashedPassword,
      code
    });

    await verificationCode.save();

    await sendEmail(lowerEmail, code);

    return true;
  },

  loginEmail: async (
    _: void,
    { email, password }: ILoginEmailArgs
  ): Promise<Maybe<User>> => {
    const lowerEmail = email.toLowerCase();

    const existingUser = await UserModel.findOne({
      email: lowerEmail
    }).then(mapToUser);

    if (!existingUser?.password) {
      throw new Error('Incorrect email or password');
    }

    const passwordMatches = await verify(password, existingUser.password);

    if (!passwordMatches) {
      throw new Error('Incorrect email or password');
    }

    return existingUser;
  }
};

export default resolvers;
