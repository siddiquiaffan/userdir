import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  // toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  surname: string;

  @Prop({ required: true, type: String })
  username: string;

  @Prop({ required: true, type: Date })
  birthdate: Date;

  @Prop({ required: true, type: Array<string>, default: [] })
  blockedUsers: string[];
}

const UserSchema = SchemaFactory.createForClass(User);
export { UserSchema };
