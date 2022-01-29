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
  //     `⚠️Location Update⚠️: The tournament will be held at Zilker Park on Saturday, 2:00pm. Location: https://goo.gl/maps/YSRkiokLoqX1Rm59A. -Zilker Park Chess`,
  //     phone
  //   ).catch(console.log);
  //   console.log(phone);
  //   console.log(count++);
  // }

  console.log('done');
}).timeout(120000);
