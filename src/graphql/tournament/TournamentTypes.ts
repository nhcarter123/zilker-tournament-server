import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import { Match } from '../match/MatchTypes';

export enum TournamentStatus {
  registration = 'registration',
  completed = 'completed',
  inactive = 'inactive'
}

export type Round = {
  completed: boolean;
  matches: Match[];
};

export type RoundPreview = {
  completed: boolean;
  matches: string[];
};

export type TournamentResponse = {
  name: string;
  date: Date;
  status: TournamentStatus;
  players: string[];
  rounds: RoundPreview[];
};

// export interface TournamentResult
//   extends Omit<Tournament, 'players' | 'rounds'> {
//   players: User[];
//   rounds: Round[];
// }

// export interface TournamentResultWithStats extends TournamentResult {
//   medianRating: number;
//   playerCount: number;
// }

const TournamentType: DocumentNode = gql`
  scalar Date

  enum MatchResult {
    whiteWon
    blackWon
    draw
    didNotStart
  }

  enum TournamentStatus {
    inactive
    registration
    completed
  }

  type Round {
    completed: Boolean!
    matches: [Match!]!
  }

  type RoundPreview {
    completed: Boolean!
    matches: [String!]!
  }

  type Tournament {
    _id: String!
    name: String!
    date: Date!
    status: TournamentStatus!
    players: [String!]!
    rounds: [RoundPreview!]!
  }
`;

export default TournamentType;
