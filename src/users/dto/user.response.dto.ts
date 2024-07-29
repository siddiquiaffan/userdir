import { UserDocument } from '../entities/user.entity';

export default class UserResponseDto {
  constructor(
    public _id: string,
    public name: string,
    public surname: string,
    public username: string,
    public birthdate: Date,
    public blockedUsers: string[],
  ) {}

  static from = ({
    _id,
    name,
    surname,
    username,
    birthdate,
    blockedUsers,
  }: UserDocument & { age?: number }): UserResponseDto =>
    new UserResponseDto(
      _id.toString(),
      name,
      surname,
      username,
      birthdate,
      blockedUsers,
    );
}
