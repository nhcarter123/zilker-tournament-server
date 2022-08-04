import { TournamentMongo } from 'graphql/tournament/TournamentModel';
import { Tournament } from 'graphql/tournament/TournamentTypes';
import { MatchMongo } from 'graphql/match/MatchModel';
import { Match } from 'graphql/match/MatchTypes';
import { UserMongo } from '../graphql/user/UserModel';
import { User } from '../graphql/user/UserTypes';
import { OrganizationMongo } from '../graphql/organization/OrganizationModel';
import { Organization } from '../graphql/organization/OrganizationTypes';

// tournaments
export const mapToTournament = (
  tournament: Nullable<TournamentMongo>
): Nullable<Tournament> => {
  if (!tournament) {
    return null;
  }

  return { ...tournament.toObject(), _id: tournament._id.toString() };
};

export const mapToTournaments = (
  tournaments: TournamentMongo[]
): Tournament[] => {
  return tournaments.map(tournament => ({
    ...tournament.toObject(),
    _id: tournament._id.toString()
  }));
};

// users
export const mapToUserNonNull = (user: UserMongo): User => {
  return { ...user.toObject(), _id: user._id.toString() };
};

export const mapToUser = (user: Nullable<UserMongo>): Nullable<User> => {
  if (!user) {
    return null;
  }

  return { ...user.toObject(), _id: user._id.toString() };
};

export const mapToUsers = (users: UserMongo[]): User[] => {
  return users.map(user => ({
    ...user.toObject(),
    _id: user._id.toString()
  }));
};

// matches
export const mapToMatch = (match: Nullable<MatchMongo>): Nullable<Match> => {
  if (!match) {
    return null;
  }

  return { ...match.toObject(), _id: match._id.toString() };
};

export const mapToMatches = (matches: MatchMongo[]): Match[] => {
  return matches.map(match => ({
    ...match.toObject(),
    _id: match._id.toString()
  }));
};

export const mapToMatchIds = (matches: MatchMongo[]): string[] => {
  return matches.map(match => match._id.toString());
};

// organizations
export const mapToOrganization = (
  organization: Nullable<OrganizationMongo>
): Nullable<Organization> => {
  if (!organization) {
    return null;
  }

  return { ...organization.toObject(), _id: organization._id.toString() };
};

export const mapToOrganizations = (
  organizations: OrganizationMongo[]
): Organization[] => {
  return organizations.map(organization => ({
    ...organization.toObject(),
    _id: organization._id.toString()
  }));
};
