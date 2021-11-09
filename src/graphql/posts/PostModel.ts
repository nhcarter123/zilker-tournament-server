import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const Schema: mongoose.Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    user: {
      type: ObjectId,
      ref: 'User'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'post',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
);

export default mongoose.model('Post', Schema);
