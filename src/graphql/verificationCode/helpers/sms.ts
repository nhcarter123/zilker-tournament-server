import Vonage from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || '',
  apiSecret: process.env.VONAGE_API_SECRET || ''
});

const from = process.env.VONAGE_PHONE || '';

export const sendText = async (body: string, to: string) => {
  return vonage.message.sendSms(from, to, body, {}, (err, responseData) => {
    if (err) {
      throw new Error('Unable to send text message');
    } else if (responseData.messages[0]) {
      if (responseData.messages[0]['status'] !== '0') {
        throw new Error('Unable to send text message');
      }
    }
  });
};

// import * as infopib from 'infobip';
//
// //Initialize the client
// const client = new infopib.Infobip(
//   process.env.BIP_USERNAME || '',
//   process.env.BIP_PASSWORD
// );
//
// interface IMessage {
//   status: {
//     groupName: string;
//   };
// }
//
// interface ISMSResponse {
//   messages: IMessage[];
// }
//
// export const sendText = async (body: string, to: string) => {
//   //Set the message
//   const message = {
//     from: process.env.BIP_PHONE,
//     to,
//     text: body
//   };
//
//   //Send an SMS
//   // @ts-ignore
//   return client.SMS.send(message).then((res: ISMSResponse) => {
//     const message = (res.messages || [])[0];
//
//     if (message) {
//       const error = message.status.groupName === 'REJECTED';
//
//       if (error) {
//         throw new Error('Unable to send text message');
//       }
//     }
//   });
// };
