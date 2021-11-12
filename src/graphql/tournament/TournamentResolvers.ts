import TournamentModel from './TournamentModel';
import { TournamentStatus, Tournament } from './TournamentTypes';

type CreateTournamentArgs = {
  name: string;
};

type JoinTournamentArgs = {
  tournamentId: string;
  userId: string;
};

const resolvers = {
  // Queries
  getActiveTournament: async (): Promise<Tournament> => {
    return TournamentModel.findOne({
      $and: [
        {
          status: { $ne: TournamentStatus.completed }
        },
        {
          status: { $ne: TournamentStatus.inactive }
        }
      ]
    });
  },

  getTournaments: async (): Promise<Tournament[]> => {
    return TournamentModel.find({});
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

  joinTournament: async (
    _: void,
    { tournamentId, userId }: JoinTournamentArgs
  ): Promise<boolean> => {
    await TournamentModel.updateOne(
      { _id: tournamentId },
      { $addToSet: { players: userId } }
    );

    return true;
  }
};

export default resolvers;
