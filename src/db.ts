import { connect } from 'mongoose';

export const connectToDb = () =>
  connect(process.env.DB_URI || '')
    .then(mongoose => {
      const info = mongoose.connections[0];
      console.log(
        `Connected to mongodb 🍃 at ${info.host}:${info.port}/${info.name}`
      );
    })
    .catch(error => {
      console.error(`Unable to connect to database: ${error}`);
      process.exit(1);
    });
