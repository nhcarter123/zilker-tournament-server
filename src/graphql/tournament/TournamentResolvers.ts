import { find, uniq } from 'lodash';
import TournamentModel, { TournamentMongo } from './TournamentModel';
import {
  EPairingAlgorithm,
  Round,
  RoundPreview,
  RoundWithUserInfo,
  Tournament,
  TournamentStatus
} from './TournamentTypes';
import {
  createNewRound,
  createStandings,
  getPlayerStats
} from './helpers/pairingHelper';
import UserModel from '../user/UserModel';
import MatchModel from '../match/MatchModel';
import { Match, MatchResult } from '../match/MatchTypes';
import { sendText } from '../verificationCode/helpers/twilio';
import pubsub from '../../pubsub/pubsub';
import { Subscription, TournamentUpdated } from '../../pubsub/types';
import { VerifiedContext } from '../TypeDefinitions';
import {
  mapToMatches,
  mapToMatchIds,
  mapToTournament,
  mapToTournaments,
  mapToUsers
} from '../../mappers/mappers';
import { addHistoryToMatch } from '../match/MatchResolvers';

type CreateTournamentArgs = {
  name: string;
};

type UpdateTournamentArgs = {
  tournamentId: string;
  payload: UpdateTournamentPayload;
};

type UpdateTournamentPayload = {
  name?: string;
  date?: Date;
  status?: TournamentStatus;
  pairingAlgorithm?: EPairingAlgorithm;
  isDeleted?: boolean;
};

type JoinTournamentArgs = {
  tournamentId: string;
};

type AutoJoinTournamentArgs = {
  organizationId: string;
};

type KickPlayerArgs = {
  tournamentId: string;
  userId: string;
};

type GetTournamentArgs = {
  tournamentId: string;
};

type GetRoundArgs = {
  tournamentId: string;
  roundId: string;
};

type DeleteRoundArgs = {
  tournamentId: string;
  roundId: string;
};

type completeRoundArgs = {
  tournamentId: string;
  newRound: boolean;
  textAlert: boolean;
};

const resolvers = {
  // Queries
  getMyTournament: async (
    _: void,
    _args: void,
    context: VerifiedContext
  ): Promise<Nullable<TournamentMongo>> => {
    return TournamentModel.findOne({
      status: TournamentStatus.active,
      isDeleted: false,
      players: { $in: [context.user._id] }
    });
  },

  getTournament: async (
    _: void,
    { tournamentId }: GetTournamentArgs
  ): Promise<TournamentMongo | null> => {
    return TournamentModel.findOne({ _id: tournamentId });
  },

  getTournaments: async (): Promise<Tournament[]> => {
    return TournamentModel.find({ isDeleted: false })
      .sort({ date: -1 })
      .then(mapToTournaments);
  },

  // Mutations
  createTournament: async (
    _: void,
    { name }: CreateTournamentArgs
  ): Promise<boolean> => {
    const tournament = new TournamentModel({
      name
    });

    await tournament.save();

    return true;
  },

  updateTournament: async (
    _: void,
    { tournamentId, payload }: UpdateTournamentArgs
  ): Promise<boolean> => {
    const tournament = await TournamentModel.findOneAndUpdate(
      { _id: tournamentId },
      payload,
      { new: true }
    ).then(mapToTournament);

    if (tournament) {
      pubsub.publish<TournamentUpdated>(Subscription.TournamentUpdated, {
        tournamentUpdated: { tournament, newRound: false }
      });
    }

    return true;
  },

  joinTournament: async (
    _: void,
    { tournamentId }: JoinTournamentArgs,
    context: VerifiedContext
  ): Promise<{ tournamentId: string }> => {
    const tournament = await TournamentModel.findOneAndUpdate(
      { _id: tournamentId },
      { $addToSet: { players: context.user._id } },
      { new: true }
    ).then(mapToTournament);

    if (tournament) {
      pubsub.publish<TournamentUpdated>(Subscription.TournamentUpdated, {
        tournamentUpdated: { tournament, newRound: false }
      });
    }

    return { tournamentId };
  },

  autoJoinTournament: async (
    _: void,
    { organizationId }: AutoJoinTournamentArgs,
    context: VerifiedContext
  ): Promise<{ tournamentId: string }> => {
    console.log(organizationId);
    console.log(context.user._id);

    const isInAnotherActiveTournament = await TournamentModel.findOne(
      { status: TournamentStatus.active },
      { $in: { players: context.user._id } }
    );

    if (isInAnotherActiveTournament) {
      throw new Error('Is in another active tournament!');
    }

    const tournament = await TournamentModel.findOneAndUpdate(
      { status: TournamentStatus.active }, // todo change this
      { $addToSet: { players: context.user._id } },
      { new: true }
    ).then(mapToTournament);

    if (!tournament) {
      throw new Error('No tournament found!');
    }

    pubsub.publish<TournamentUpdated>(Subscription.TournamentUpdated, {
      tournamentUpdated: { tournament, newRound: false }
    });

    return { tournamentId: tournament._id };
  },

  kickPlayer: async (
    _: void,
    { tournamentId, userId }: KickPlayerArgs
  ): Promise<boolean> => {
    const tournament = await TournamentModel.findOneAndUpdate(
      { _id: tournamentId },
      { $pull: { players: userId } },
      { new: true }
    ).then(mapToTournament);

    if (tournament) {
      pubsub.publish<TournamentUpdated>(Subscription.TournamentUpdated, {
        tournamentUpdated: { tournament, newRound: false }
      });
    }

    return true;
  },

  getRound: async (
    _: void,
    { tournamentId, roundId }: GetRoundArgs
  ): Promise<Nullable<RoundWithUserInfo>> => {
    // todo use context
    const tournament: TournamentMongo | null = await TournamentModel.findOne({
      _id: tournamentId
    });

    if (!tournament) {
      throw new Error('Tournament not found!');
    }

    const round = find(
      tournament.rounds,
      round => round._id.toString() === roundId
    );

    if (!round) {
      throw new Error('Round not found!');
    }

    const matches = await MatchModel.find({ _id: { $in: round.matches } }).then(
      mapToMatches
    );
    const userIds = matches
      .flatMap(match => [match.white, match.black])
      .filter(id => id !== 'bye');

    const users = await UserModel.find({ _id: { $in: userIds } }).then(
      mapToUsers
    );

    const matchesWithUserInfo = matches.map(match => ({
      ...match,
      white: find(users, user => user._id === match.white) || null,
      black: find(users, user => user._id === match.black) || null
    }));

    return {
      _id: roundId,
      completed: false,
      matches: matchesWithUserInfo
    };
  },

  deleteRound: async (
    _: void,
    { tournamentId, roundId }: DeleteRoundArgs
  ): Promise<boolean> => {
    // todo use context
    const tournament: Nullable<Tournament> = await TournamentModel.findOne({
      _id: tournamentId
    }).then(mapToTournament);

    if (!tournament) {
      throw new Error('Tournament not found!');
    }

    const round = find(
      tournament.rounds,
      round => round._id.toString() === roundId
    );

    if (!round) {
      throw new Error('Round not found!');
    }

    // todo abstract all this repeated code - had to do this for crunch
    // get all matches
    const matches = await MatchModel.find({
      _id: {
        $in: tournament.rounds.flatMap((round: RoundPreview) => round.matches)
      }
    }).then(mapToMatches);

    const userIds = uniq(
      matches
        .flatMap(match => [match.white, match.black])
        .concat(tournament.players)
        .filter(id => id !== 'bye')
    );

    const players = await UserModel.find({
      _id: { $in: userIds }
    }).then(mapToUsers);

    const rounds: Round[] = tournament.rounds.map((round: RoundPreview) => ({
      ...round,
      matches: round.matches
        .map(_id => find(matches, match => match._id === _id))
        .flatMap(v => (v ? [v] : []))
    }));

    const stats = getPlayerStats(rounds, players);

    await UserModel.bulkWrite(
      Object.entries(stats).map(([userId, stat]) => ({
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              rating: stat.previousRating,
              matchesPlayed: stat.matchesPlayed - 1
            }
          }
        }
      }))
    );

    const updatedRounds = rounds.filter(
      round => round._id.toString() !== roundId
    );
    const standings = createStandings(getPlayerStats(updatedRounds, players));

    await MatchModel.deleteMany({ _id: { $in: round.matches } });

    const updatedTournament = await TournamentModel.findOneAndUpdate(
      { _id: tournamentId },
      { $pull: { rounds: { _id: round._id } }, standings },
      { new: true }
    ).then(mapToTournament);

    if (updatedTournament) {
      pubsub.publish<TournamentUpdated>(Subscription.TournamentUpdated, {
        tournamentUpdated: { tournament: updatedTournament, newRound: true }
      });
    }

    return true;
  },

  completeRound: async (
    _: void,
    { tournamentId, newRound, textAlert }: completeRoundArgs
  ): Promise<boolean> => {
    // todo use context
    const tournament: Tournament | null = await TournamentModel.findOne({
      _id: tournamentId
    }).then(mapToTournament);

    if (!tournament) {
      throw new Error('Tournament not found!');
    }

    // add results to all of last round's matches if they have none
    const index = tournament.rounds.length - 1;

    if (index !== -1) {
      const lastRoundsMatches = tournament.rounds[index]?.matches;

      await MatchModel.updateMany(
        {
          $and: [
            {
              _id: { $in: lastRoundsMatches }
            },
            { result: { $exists: false } }
          ]
        },
        { $set: { result: MatchResult.didNotStart } }
      );

      // complete all rounds
      await MatchModel.updateMany(
        {
          _id: { $in: lastRoundsMatches }
        },
        { $set: { completed: true } }
      );
    }

    // get all matches
    const matches = await MatchModel.find({
      _id: {
        $in: tournament.rounds.flatMap((round: RoundPreview) => round.matches)
      }
    }).then(mapToMatches);

    const userIds = uniq(
      matches
        .flatMap(match => [match.white, match.black])
        .concat(tournament.players)
        .filter(id => id !== 'bye')
    );

    const players = await UserModel.find({
      _id: { $in: userIds }
    }).then(mapToUsers);

    const rounds: Round[] = tournament.rounds.map((round: RoundPreview) => ({
      ...round,
      matches: round.matches
        .map(_id => find(matches, match => match._id === _id))
        .flatMap(v => (v ? [v] : []))
    }));

    const stats = getPlayerStats(rounds, players);
    const standings = createStandings(stats);
    const maxPunchDown = Math.ceil(tournament.players.length / 12);

    const nextRound = createNewRound(
      tournamentId,
      stats,
      tournament.players,
      maxPunchDown,
      tournament.tiebreakSeed + rounds.length,
      tournament.pairingAlgorithm as EPairingAlgorithm // can be parsed better
    );

    const updatedRounds = tournament.rounds.map(round => ({
      _id: round._id,
      matches: round.matches,
      completed: true
    }));

    if (newRound) {
      const matchesWithHistory: Match[] = [];

      for (const match of nextRound.matches) {
        const matchWithHistory = await addHistoryToMatch(match);
        matchesWithHistory.push(matchWithHistory);
      }

      const matchIds = await MatchModel.insertMany(matchesWithHistory).then(
        mapToMatchIds
      );

      updatedRounds.push({
        ...nextRound,
        matches: matchIds
      });
    }

    await UserModel.bulkWrite(
      Object.entries(stats).map(([userId, stat]) => ({
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              rating: stat.rating,
              matchesPlayed: stat.matchesPlayed
            }
          }
        }
      }))
    );

    const updatedTournament = await TournamentModel.findOneAndUpdate(
      { _id: tournamentId },
      {
        rounds: updatedRounds,
        status: newRound ? TournamentStatus.active : TournamentStatus.completed,
        standings
      },
      { new: true }
    ).then(mapToTournament);

    if (textAlert && newRound) {
      players
        .filter(player => tournament.players.includes(player._id))
        .map(player =>
          sendText(
            `⚠️🚨 Round ${updatedRounds.length} is starting 🚨⚠️`,
            player.phone
          ).catch(e => console.log(e))
        );
    }

    if (updatedTournament) {
      pubsub.publish<TournamentUpdated>(Subscription.TournamentUpdated, {
        tournamentUpdated: { tournament: updatedTournament, newRound }
      });
    }

    return true;
  }
};

export default resolvers;
