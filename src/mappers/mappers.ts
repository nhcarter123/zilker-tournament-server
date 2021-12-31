import { TournamentMongo } from 'graphql/tournament/TournamentModel';
import { Tournament } from 'graphql/tournament/TournamentTypes';
import { MatchMongo } from 'graphql/match/MatchModel';
import { Match } from 'graphql/match/MatchTypes';

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
