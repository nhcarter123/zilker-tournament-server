import * as infopib from 'infobip';

//Initialize the client
const client = new infopib.Infobip(
  process.env.BIP_USERNAME || '',
  process.env.BIP_PASSWORD
);

export const sendText = async (body: string, to: string) => {
  //Set the message
  const message = {
    from: 'InfoSMS',
    to,
    text: body
  };

  //Send an SMS
  return client.SMS.send(message);
};
