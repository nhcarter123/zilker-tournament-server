import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import { Match } from '../match/MatchTypes';

export enum TournamentStatus {
  created = 'created',
  active = 'active',
  completed = 'completed'
}

export type Round = {
  _id: string;
  completed: boolean;
  matches: Match[];
};

export type RoundPreview = {
  _id: string;
  completed: boolean;
  matches: string[];
};

export type TournamentResponse = {
  name: string;
  date: Date;
  status: TournamentStatus;
  players: string[];
  rounds: RoundPreview[];
  totalRounds: number;
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
    created
    active
    completed
  }

  type RoundPreview {
    _id: ID!
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
    totalRounds: Int!
  }
`;

export default TournamentType;
