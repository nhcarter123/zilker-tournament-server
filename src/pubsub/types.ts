import { Tournament } from 'graphql/tournament/TournamentTypes';
import { MatchWithUserInfo } from 'graphql/match/MatchTypes';

export enum Subscription {
  MatchUpdated = 'MATCH_UPDATED',
  TournamentUpdated = 'TOURNAMENT_UPDATED'
}

export type TournamentUpdated = {
  tournamentUpdated: {
    tournament: Tournament;
    newRound: boolean;
  };
};

export type MatchUpdated = {
  matchUpdated: MatchWithUserInfo;
};
