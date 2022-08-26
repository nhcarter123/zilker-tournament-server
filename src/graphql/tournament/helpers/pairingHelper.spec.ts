import { expect } from 'chai';

import {
  createNewRound,
  getPlayerStats
} from 'graphql/tournament/helpers/pairingHelper';
import {
  EPairingAlgorithm,
  Round,
  Tournament,
  TournamentStatus
} from '../TournamentTypes';
import { Role, User } from '../../user/UserTypes';
import { MatchResult } from '../../match/MatchTypes';
//
// it('Should pair players using the swiss algorithm', () => {
//   const rounds: Round[] = [];
//
//   const tournament: Tournament = {
//     _id: '123',
//     name: 'test',
//     date: new Date(),
//     status: TournamentStatus.active,
//     pairingAlgorithm: EPairingAlgorithm.Swiss,
//     config: { maxPunchDown: 3, performanceWeight: 0, totalRounds: 5 },
//     players: players.map(p => p._id),
//     rounds: [],
//     tiebreakSeed: 0,
//     standings: [],
//     isDeleted: false,
//     organizationId: '123'
//   };
//
//   let stats = getPlayerStats(rounds, players);
//
//   const processRound = (round: Round) => {
//     // set winners
//     round.matches = round.matches.map(match =>
//       match.black !== 'bye'
//         ? {
//             ...match,
//             result:
//               match.whiteRating > match.blackRating
//                 ? MatchResult.whiteWon
//                 : MatchResult.blackWon,
//             completed: true
//           }
//         : match
//     );
//
//     rounds.push(round);
//     stats = getPlayerStats(rounds, players);
//   };
//
//   const round1 = createNewRound(tournament, stats, 0);
//
//   expect(round1.matches[0]?.white).to.be.equal('618c971dc8725e04b058948d');
//   expect(round1.matches[0]?.black).to.be.equal('618c913ac8725e04b058945c');
//   expect(round1.matches[1]?.white).to.be.equal('618c9cb2c8725e04b05894ef');
//   expect(round1.matches[1]?.black).to.be.equal('618c9851c8725e04b05894a0');
//   expect(round1.matches[2]?.white).to.be.equal('618c9296c8725e04b0589468');
//   expect(round1.matches[2]?.black).to.be.equal('618c9b09c8725e04b05894c9');
//   expect(round1.matches[3]?.white).to.be.equal('6191a4a3acdef1ddd09a3c8c');
//   expect(round1.matches[3]?.black).to.be.equal('618c9764c8725e04b0589495');
//   expect(round1.matches[4]?.white).to.be.equal('618c99b4c8725e04b05894af');
//   expect(round1.matches[4]?.black).to.be.equal('618f4534f283c2a963366e85');
//   expect(round1.matches[5]?.white).to.be.equal('618c9ab9c8725e04b05894bf');
//   expect(round1.matches[5]?.black).to.be.equal('bye');
//
//   processRound(round1);
//
//   const round2 = createNewRound(tournament, stats, 0);
//
//   processRound(round2);
//
//   const round3 = createNewRound(tournament, stats, 0);
// });

it('Should pair players using rating based algorithm', () => {
  const rounds: Round[] = [];

  const tournament: Tournament = {
    _id: '123',
    name: 'test',
    date: new Date(),
    status: TournamentStatus.active,
    pairingAlgorithm: EPairingAlgorithm.Rating,
    config: { maxPunchDown: 3, performanceWeight: 0, totalRounds: 5 },
    players: players.map(p => p._id),
    rounds: [],
    tiebreakSeed: 0,
    standings: [],
    isDeleted: false,
    organizationId: '123'
  };

  let stats = getPlayerStats(rounds, players);

  const processRound = (round: Round) => {
    // set winners
    round.matches = round.matches.map(match =>
      match.black !== 'bye'
        ? {
            ...match,
            result:
              match.whiteRating > match.blackRating
                ? MatchResult.whiteWon
                : MatchResult.blackWon,
            completed: true
          }
        : match
    );

    rounds.push(round);
    stats = getPlayerStats(rounds, players);
  };

  const round1 = createNewRound(tournament, stats, 0);

  // expect(round1.matches[0]?.white).to.be.equal('618c971dc8725e04b058948d');
  // expect(round1.matches[0]?.black).to.be.equal('618c913ac8725e04b058945c');
  // expect(round1.matches[1]?.white).to.be.equal('618c9cb2c8725e04b05894ef');
  // expect(round1.matches[1]?.black).to.be.equal('618c9851c8725e04b05894a0');
  // expect(round1.matches[2]?.white).to.be.equal('618c9296c8725e04b0589468');
  // expect(round1.matches[2]?.black).to.be.equal('618c9b09c8725e04b05894c9');
  // expect(round1.matches[3]?.white).to.be.equal('6191a4a3acdef1ddd09a3c8c');
  // expect(round1.matches[3]?.black).to.be.equal('618c9764c8725e04b0589495');
  // expect(round1.matches[4]?.white).to.be.equal('618c99b4c8725e04b05894af');
  // expect(round1.matches[4]?.black).to.be.equal('618f4534f283c2a963366e85');
  // expect(round1.matches[5]?.white).to.be.equal('618c9ab9c8725e04b05894bf');
  // expect(round1.matches[5]?.black).to.be.equal('bye');

  processRound(round1);
  const round2 = createNewRound(tournament, stats, 0);
  processRound(round2);
  const round3 = createNewRound(tournament, stats, 0);
  processRound(round3);
  const round4 = createNewRound(tournament, stats, 0);
  processRound(round4);
  const round5 = createNewRound(tournament, stats, 0);
  processRound(round5);
  const round6 = createNewRound(tournament, stats, 0);
  processRound(round6);
  const round7 = createNewRound(tournament, stats, 0);

  console.log('');
}).timeout(20000);

const players: User[] = [
  {
    _id: '1',
    phone: '+180',
    role: Role.admin,
    firstName: 'Micahel',
    lastName: 'Williams',
    rating: 2800,
    matchesPlayed: 0
  },
  {
    _id: '2',
    phone: '+1802234231',
    role: Role.admin,
    firstName: 'Eric',
    lastName: 'Kurtz',
    rating: 2700,
    matchesPlayed: 0
  },
  {
    _id: '3',
    phone: '+18023242',
    role: Role.admin,
    firstName: 'Vaugn',
    lastName: 'Stone',
    rating: 2600,
    matchesPlayed: 0
  },
  {
    _id: '4',
    phone: '+180232420',
    role: Role.admin,
    firstName: 'Marc',
    lastName: 'Jiang',
    rating: 2500,
    matchesPlayed: 0
  },
  {
    _id: '5',
    phone: '+16666',
    role: Role.admin,
    firstName: 'Tim',
    lastName: 'Mccley',
    rating: 2200,
    matchesPlayed: 0
  },

  {
    _id: '6',
    phone: '+180',
    role: Role.admin,
    firstName: 'Micahel',
    lastName: 'Williams',
    rating: 2056,
    matchesPlayed: 0
  },
  {
    _id: '7',
    phone: '+18023242',
    role: Role.admin,
    firstName: 'Vaugn',
    lastName: 'Stone',
    rating: 1894,
    matchesPlayed: 0
  },
  {
    _id: '8',
    phone: '+19999999',
    role: Role.admin,
    firstName: 'Alec',
    lastName: 'Carrier',
    rating: 1756,
    matchesPlayed: 0
  },
  {
    _id: '9',
    phone: '+1233324234399',
    role: Role.admin,
    firstName: 'Bob',
    lastName: 'Suave',
    rating: 1703,
    matchesPlayed: 0
  },
  {
    _id: '10',
    phone: '+18023242070',
    role: Role.admin,
    rating: 1620,
    firstName: 'dfdfg',
    lastName: 'dfgdg',
    matchesPlayed: 0
  },
  {
    _id: '11',
    phone: '+1802234231',
    role: Role.admin,
    firstName: 'Eric',
    lastName: 'Kurtz',
    rating: 1543,
    matchesPlayed: 0
  },
  {
    _id: '12',
    phone: '+182323',
    role: Role.admin,
    rating: 1403,
    firstName: 'Nate',
    lastName: 'Carter',
    matchesPlayed: 0
  },
  {
    _id: '13',
    phone: '+180232420',
    role: Role.admin,
    firstName: 'Marc',
    lastName: 'Jiang',
    rating: 1375,
    matchesPlayed: 0
  },
  {
    _id: '14',
    phone: '+180232420333',
    role: Role.admin,
    firstName: 'Jeremy',
    lastName: 'Seagull',
    rating: 1250,
    matchesPlayed: 0
  },
  {
    _id: '15',
    phone: '+16666',
    role: Role.admin,
    firstName: 'Tim',
    lastName: 'Mccley',
    rating: 1222,
    matchesPlayed: 0
  },
  {
    _id: '16',
    phone: '+1233324234399',
    role: Role.admin,
    firstName: 'Bob',
    lastName: 'Suave',
    rating: 1134,
    matchesPlayed: 0
  },
  {
    _id: '17',
    phone: '+180232420333',
    role: Role.admin,
    firstName: 'Jeremy',
    lastName: 'Seagull',
    rating: 1043,
    matchesPlayed: 0
  },
  {
    _id: '18',
    phone: '+180223423412123',
    role: Role.admin,
    firstName: 'Amy',
    lastName: 'Smith',
    rating: 959,
    matchesPlayed: 0
  },
  {
    _id: '19',
    phone: '+18023242070',
    role: Role.admin,
    rating: 821,
    firstName: 'dfdfg',
    lastName: 'dfgdg',
    matchesPlayed: 0
  },
  {
    _id: '20',
    phone: '+182323',
    role: Role.admin,
    rating: 880,
    firstName: 'Nate',
    lastName: 'Carter',
    matchesPlayed: 0
  },
  {
    _id: '21',
    phone: '+19999999',
    role: Role.admin,
    firstName: 'Alec',
    lastName: 'Carrier',
    rating: 803,
    matchesPlayed: 0
  },
  {
    _id: '22',
    phone: '+180223423412123',
    role: Role.admin,
    firstName: 'Amy',
    lastName: 'Smith',
    rating: 600,
    matchesPlayed: 0
  },
  {
    _id: '23',
    phone: '+180',
    role: Role.admin,
    firstName: 'Micahel',
    lastName: 'Williams',
    rating: 2800,
    matchesPlayed: 0
  },
  {
    _id: '24',
    phone: '+1802234231',
    role: Role.admin,
    firstName: 'Eric',
    lastName: 'Kurtz',
    rating: 2700,
    matchesPlayed: 0
  },
  {
    _id: '25',
    phone: '+18023242',
    role: Role.admin,
    firstName: 'Vaugn',
    lastName: 'Stone',
    rating: 2600,
    matchesPlayed: 0
  },
  {
    _id: '26',
    phone: '+180232420',
    role: Role.admin,
    firstName: 'Marc',
    lastName: 'Jiang',
    rating: 2500,
    matchesPlayed: 0
  },
  {
    _id: '27',
    phone: '+16666',
    role: Role.admin,
    firstName: 'Tim',
    lastName: 'Mccley',
    rating: 2200,
    matchesPlayed: 0
  },

  {
    _id: '28',
    phone: '+180',
    role: Role.admin,
    firstName: 'Micahel',
    lastName: 'Williams',
    rating: 2056,
    matchesPlayed: 0
  },
  {
    _id: '29',
    phone: '+18023242',
    role: Role.admin,
    firstName: 'Vaugn',
    lastName: 'Stone',
    rating: 1894,
    matchesPlayed: 0
  },
  {
    _id: '30',
    phone: '+19999999',
    role: Role.admin,
    firstName: 'Alec',
    lastName: 'Carrier',
    rating: 1756,
    matchesPlayed: 0
  },
  {
    _id: '31',
    phone: '+1233324234399',
    role: Role.admin,
    firstName: 'Bob',
    lastName: 'Suave',
    rating: 1703,
    matchesPlayed: 0
  },
  {
    _id: '32',
    phone: '+18023242070',
    role: Role.admin,
    rating: 1620,
    firstName: 'dfdfg',
    lastName: 'dfgdg',
    matchesPlayed: 0
  },
  {
    _id: '33',
    phone: '+1802234231',
    role: Role.admin,
    firstName: 'Eric',
    lastName: 'Kurtz',
    rating: 1543,
    matchesPlayed: 0
  },
  {
    _id: '34',
    phone: '+182323',
    role: Role.admin,
    rating: 1403,
    firstName: 'Nate',
    lastName: 'Carter',
    matchesPlayed: 0
  },
  {
    _id: '35',
    phone: '+180232420',
    role: Role.admin,
    firstName: 'Marc',
    lastName: 'Jiang',
    rating: 1375,
    matchesPlayed: 0
  },
  {
    _id: '36',
    phone: '+180232420333',
    role: Role.admin,
    firstName: 'Jeremy',
    lastName: 'Seagull',
    rating: 1250,
    matchesPlayed: 0
  },
  {
    _id: '37',
    phone: '+16666',
    role: Role.admin,
    firstName: 'Tim',
    lastName: 'Mccley',
    rating: 1222,
    matchesPlayed: 0
  },
  {
    _id: '38',
    phone: '+1233324234399',
    role: Role.admin,
    firstName: 'Bob',
    lastName: 'Suave',
    rating: 1134,
    matchesPlayed: 0
  },
  {
    _id: '39',
    phone: '+180232420333',
    role: Role.admin,
    firstName: 'Jeremy',
    lastName: 'Seagull',
    rating: 1043,
    matchesPlayed: 0
  },
  {
    _id: '40',
    phone: '+180223423412123',
    role: Role.admin,
    firstName: 'Amy',
    lastName: 'Smith',
    rating: 959,
    matchesPlayed: 0
  },
  {
    _id: '41',
    phone: '+18023242070',
    role: Role.admin,
    rating: 821,
    firstName: 'dfdfg',
    lastName: 'dfgdg',
    matchesPlayed: 0
  },
  {
    _id: '42',
    phone: '+182323',
    role: Role.admin,
    rating: 880,
    firstName: 'Nate',
    lastName: 'Carter',
    matchesPlayed: 0
  },
  {
    _id: '43',
    phone: '+19999999',
    role: Role.admin,
    firstName: 'Alec',
    lastName: 'Carrier',
    rating: 803,
    matchesPlayed: 0
  },
  {
    _id: '44',
    phone: '+180223423412123',
    role: Role.admin,
    firstName: 'Amy',
    lastName: 'Smith',
    rating: 600,
    matchesPlayed: 0
  }
];
