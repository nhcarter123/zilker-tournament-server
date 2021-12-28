import UserModel from '../../user/UserModel';
import { connectToDb } from '../../../db';
import { sendText } from '../../verificationCode/helpers/twilio';

import * as dotenv from 'dotenv';
dotenv.config();

it('Should send all players an update about the tournament', async () => {
  await connectToDb();

  const phoneNumbers = await UserModel.find({}).then(models =>
    models.map(model => model.phone)
  );

  let count = 0;

  // for (const phone of phoneNumbers) {
  //   await sendText(
  //     `The tournament is canceled this week due to weather + sickness. -Zilker Park Chess`,
  //     phone
  //   );
  //   console.log(phone);
  //   console.log(count++);
  // }

  console.log('done');
}).timeout(120000);
