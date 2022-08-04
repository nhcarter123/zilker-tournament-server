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

it('Should pair players using the swiss algorithm', () => {
  const rounds: Round[] = [];

  const tournament: Tournament = {
    _id: '123',
    name: 'test',
    date: new Date(),
    status: TournamentStatus.active,
    pairingAlgorithm: EPairingAlgorithm.Swiss,
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

  expect(round1.matches[0]?.white).to.be.equal('618c971dc8725e04b058948d');
  expect(round1.matches[0]?.black).to.be.equal('618c913ac8725e04b058945c');
  expect(round1.matches[1]?.white).to.be.equal('618c9cb2c8725e04b05894ef');
  expect(round1.matches[1]?.black).to.be.equal('618c9851c8725e04b05894a0');
  expect(round1.matches[2]?.white).to.be.equal('618c9296c8725e04b0589468');
  expect(round1.matches[2]?.black).to.be.equal('618c9b09c8725e04b05894c9');
  expect(round1.matches[3]?.white).to.be.equal('6191a4a3acdef1ddd09a3c8c');
  expect(round1.matches[3]?.black).to.be.equal('618c9764c8725e04b0589495');
  expect(round1.matches[4]?.white).to.be.equal('618c99b4c8725e04b05894af');
  expect(round1.matches[4]?.black).to.be.equal('618f4534f283c2a963366e85');
  expect(round1.matches[5]?.white).to.be.equal('618c9ab9c8725e04b05894bf');
  expect(round1.matches[5]?.black).to.be.equal('bye');

  processRound(round1);

  const round2 = createNewRound(tournament, stats, 0);

  processRound(round2);

  const round3 = createNewRound(tournament, stats, 0);
});

it('Should pair players using rating based algorithm', () => {
  const rounds: Round[] = [];

  const tournament: Tournament = {
    _id: '123',
    name: 'test',
    date: new Date(),
    status: TournamentStatus.active,
    pairingAlgorithm: EPairingAlgorithm.Swiss,
    config: { maxPunchDown: 3, performanceWeight: 0, totalRounds: 5 },
    players: [],
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

  console.log('');
});

const players: User[] = [
  {
    _id: '618c913ac8725e04b058945c',
    phone: '+180232420',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eJpZCI6IisxODAyMzI0MjAiLCJpYXQiOjE2MzY2MDIxNzAsImV4cCI6MTYzODUwMjk3MH0.sMus1dQJen0KN6TRerAatOGGZfKc9INbSHG9pfaRb-0',
    role: Role.admin,
    firstName: 'Marc',
    lastName: 'Jiang',
    rating: 2500,
    matchesPlayed: 0
  },
  {
    _id: '618c9296c8725e04b0589468',
    phone: '+18023242',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MiIsImlhdCI6MTYzNjYwMjUxOCwiZXhwIjoxNjM4NTAzMzE4fQ.Itl37NLx37JA8xV9gVFiYocb9o04y8_MoIByhD86mm4',
    role: Role.admin,
    firstName: 'Vaugn',
    lastName: 'Stone',
    rating: 2600,
    matchesPlayed: 0
  },
  {
    _id: '618c971dc8725e04b058948d',
    phone: '+180',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAiLCJpYXQiOjE2MzY2MDM2NzcsImV4cCI6MTYzODUwNDQ3N30.QUTlOtuSyrQIyU7BDMkVR8Rh0QSN23udtGGMgZ4Hh8w',
    role: Role.admin,
    firstName: 'Micahel',
    lastName: 'Williams',
    rating: 2800,
    matchesPlayed: 0
  },
  {
    _id: '618c9764c8725e04b0589495',
    phone: '+182323',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODIzMjMiLCJpYXQiOjE2MzY3ODExOTEsImV4cCI6MTYzODY4MTk5MX0.810cFdQiMSQNED4cCqBCFBT8-UwrO6HeNMoqpKKxUg8',
    role: Role.admin,
    rating: 1403,
    firstName: 'Nate',
    lastName: 'Carter',
    matchesPlayed: 0
  },
  {
    _id: '618c9851c8725e04b05894a0',
    phone: '+1802234231',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMjM0MjMxIiwiaWF0IjoxNjM2ODE4MjE2LCJleHAiOjE2Mzg3MTkwMTZ9.YaR_o8BITzLsGnhHdMDSVTmMzERvsJBZTAGcEJ2rBxQ',
    role: Role.admin,
    firstName: 'Eric',
    lastName: 'Kurtz',
    rating: 2700,
    matchesPlayed: 0
  },
  {
    _id: '618c99b4c8725e04b05894af',
    phone: '+180232420333',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MjAzMzMiLCJpYXQiOjE2MzY2MDQzNDAsImV4cCI6MTYzODUwNTE0MH0.NxLsRIS6Kr6PZaPpyOWfWmiMI6UzOkv0DXTUarUrJuY',
    role: Role.admin,
    firstName: 'Jeremy',
    lastName: 'Seagull',
    rating: 1250,
    matchesPlayed: 0
  },
  {
    _id: '618c9ab9c8725e04b05894bf',
    phone: '+180223423412123',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMjM0MjM0MTIxMjMiLCJpYXQiOjE2MzY2MDQ2MDEsImV4cCI6MTYzODUwNTQwMX0.v4BPQubZ9pPcWwx07LHEn2oYbHnjw3fh_QuPVTKwVJE',
    role: Role.admin,
    firstName: 'Amy',
    lastName: 'Smith',
    rating: 600,
    matchesPlayed: 0
  },
  {
    _id: '618c9b09c8725e04b05894c9',
    phone: '+1233324234399',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxMjMzMzI0MjM0Mzk5IiwiaWF0IjoxNjM2NjA0NjgxLCJleHAiOjE2Mzg1MDU0ODF9.XLZxUCzluOO3MNKqE_Mk8OZ3nm3crm0U8bExKNkwzzo',
    role: Role.admin,
    firstName: 'Bob',
    lastName: 'Suave',
    rating: 1703,
    matchesPlayed: 0
  },
  {
    _id: '618c9cb2c8725e04b05894ef',
    phone: '+16666',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxNjY2NiIsImlhdCI6MTYzNjYwNTEwNiwiZXhwIjoxNjM4NTA1OTA2fQ.yl1W5F2yzpQ1B5dq182FsahtvJHIelIFnPFJMYd8ag0',
    role: Role.admin,
    firstName: 'Tim',
    lastName: 'Mccley',
    rating: 2200,
    matchesPlayed: 0
  },
  {
    _id: '618f4534f283c2a963366e85',
    phone: '+19999999',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxOTk5OTk5OSIsImlhdCI6MTYzNjc3OTMxNiwiZXhwIjoxNjM4NjgwMTE2fQ.x5ljH0LPtPmxEUMStssdLJbtIyJRq6tgqrUgoHC09vc',
    role: Role.admin,
    firstName: 'Alec',
    lastName: 'Carrier',
    rating: 803,
    matchesPlayed: 0
  },
  {
    _id: '6191a4a3acdef1ddd09a3c8c',
    phone: '+18023242070',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MjA3MCIsImlhdCI6MTYzNzUzMTk5MCwiZXhwIjoxNjM5NDMyNzkwfQ.-Pb9NxcMndqFpYRGro-gGf-LwIVpkpcymCMeU3qXt4I',
    role: Role.admin,
    rating: 1000,
    firstName: 'dfdfg',
    lastName: 'dfgdg',
    matchesPlayed: 0
  }
];
