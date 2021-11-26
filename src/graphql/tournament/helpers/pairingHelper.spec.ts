import { expect } from 'chai';
import {
  createNewRound,
  getPlayerStats
} from 'graphql/tournament/helpers/pairingHelper';
import { User } from '../../user/UserModel';
import { Round } from '../TournamentTypes';

it('Should pair players', () => {
  const a = true;

  const tournamentId = '123';
  const stats = getPlayerStats(rounds, players);

  const round = createNewRound(
    tournamentId,
    stats,
    players.map(player => player._id),
    2
  );

  // todo finish this

  expect(a).to.be.equal(true);
});

const rounds: Round[] = [
  {
    completed: true,
    matches: [
      {
        _id: '619fe1b49e9ed534c7897a24',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c9851c8725e04b05894a0',
        black: '618c913ac8725e04b058945c',
        whiteRating: 2300,
        blackRating: 2300,
        whiteMatchesPlayed: 1,
        blackMatchesPlayed: 1,
        boardNumber: 0,
        result: 'whiteWon',
        completed: true,
        newBlackRating: 1900,
        newWhiteRating: 2700
      },
      {
        _id: '619fe1b49e9ed534c7897a25',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c9cb2c8725e04b05894ef',
        black: '618c971dc8725e04b058948d',
        whiteRating: 2300,
        blackRating: 2300,
        whiteMatchesPlayed: 1,
        blackMatchesPlayed: 1,
        boardNumber: 1,
        result: 'blackWon',
        completed: true
      },
      {
        _id: '619fe1b49e9ed534c7897a26',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c99b4c8725e04b05894af',
        black: '618c9296c8725e04b0589468',
        whiteRating: 1403,
        blackRating: 1403,
        whiteMatchesPlayed: 1,
        blackMatchesPlayed: 1,
        boardNumber: 2,
        result: 'draw',
        completed: true
      },
      {
        _id: '619fe1b49e9ed534c7897a27',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c9b09c8725e04b05894c9',
        black: '618c9764c8725e04b0589495',
        whiteRating: 1403,
        blackRating: 1403,
        whiteMatchesPlayed: 0,
        blackMatchesPlayed: 1,
        boardNumber: 3,
        result: 'blackWon',
        completed: true
      },
      {
        _id: '619fe1b49e9ed534c7897a28',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618f4534f283c2a963366e85',
        black: 'bye',
        whiteRating: 1403,
        blackRating: 0,
        whiteMatchesPlayed: 0,
        blackMatchesPlayed: 0,
        boardNumber: 5,
        result: 'didNotStart',
        completed: true
      }
    ],
    _id: '619fe1b49e9ed534c7897a29'
  },
  {
    completed: true,
    matches: [
      {
        _id: '619fe1b49e9ed534c7897a24',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c9851c8725e04b05894a0',
        black: '618c913ac8725e04b058945c',
        whiteRating: 2300,
        blackRating: 2300,
        whiteMatchesPlayed: 1,
        blackMatchesPlayed: 1,
        boardNumber: 0,
        result: 'whiteWon',
        completed: true,
        newBlackRating: 1900,
        newWhiteRating: 2700
      },
      {
        _id: '619fe1b49e9ed534c7897a25',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c9cb2c8725e04b05894ef',
        black: '618c971dc8725e04b058948d',
        whiteRating: 2300,
        blackRating: 2300,
        whiteMatchesPlayed: 1,
        blackMatchesPlayed: 1,
        boardNumber: 1,
        result: 'blackWon',
        completed: true
      },
      {
        _id: '619fe1b49e9ed534c7897a26',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c99b4c8725e04b05894af',
        black: '618c9296c8725e04b0589468',
        whiteRating: 1403,
        blackRating: 1403,
        whiteMatchesPlayed: 1,
        blackMatchesPlayed: 1,
        boardNumber: 2,
        result: 'whiteWon',
        completed: true
      },
      {
        _id: '619fe1b49e9ed534c7897a27',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618c9b09c8725e04b05894c9',
        black: '618c9764c8725e04b0589495',
        whiteRating: 1403,
        blackRating: 1403,
        whiteMatchesPlayed: 0,
        blackMatchesPlayed: 1,
        boardNumber: 3,
        result: 'blackWon',
        completed: true
      },
      {
        _id: '619fe1b49e9ed534c7897a28',
        tournamentId: '618ddcf55f41c850d80138fc',
        white: '618f4534f283c2a963366e85',
        black: 'bye',
        whiteRating: 1403,
        blackRating: 0,
        whiteMatchesPlayed: 0,
        blackMatchesPlayed: 0,
        boardNumber: 5,
        result: 'didNotStart',
        completed: true
      }
    ],
    _id: '619fe1b49e9ed534c7897a29'
  }
] as Round[];

const players: User[] = [
  {
    _id: '618c913ac8725e04b058945c',
    phone: '+180232420',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MjAiLCJpYXQiOjE2MzY2MDIxNzAsImV4cCI6MTYzODUwMjk3MH0.sMus1dQJen0KN6TRerAatOGGZfKc9INbSHG9pfaRb-0',
    role: 'player',
    firstName: 'Marc',
    lastName: 'Jiang',
    rating: 2300,
    matchesPlayed: 0
  },
  {
    _id: '618c9296c8725e04b0589468',
    phone: '+18023242',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MiIsImlhdCI6MTYzNjYwMjUxOCwiZXhwIjoxNjM4NTAzMzE4fQ.Itl37NLx37JA8xV9gVFiYocb9o04y8_MoIByhD86mm4',
    role: 'player',
    firstName: 'Vaugn',
    lastName: 'Stone',
    rating: 2300,
    matchesPlayed: 1
  },
  {
    _id: '618c971dc8725e04b058948d',
    phone: '+180',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAiLCJpYXQiOjE2MzY2MDM2NzcsImV4cCI6MTYzODUwNDQ3N30.QUTlOtuSyrQIyU7BDMkVR8Rh0QSN23udtGGMgZ4Hh8w',
    role: 'player',
    firstName: 'Micahel',
    lastName: 'Williams',
    rating: 2300,
    matchesPlayed: 1
  },
  {
    _id: '618c9764c8725e04b0589495',
    phone: '+182323',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODIzMjMiLCJpYXQiOjE2MzY3ODExOTEsImV4cCI6MTYzODY4MTk5MX0.810cFdQiMSQNED4cCqBCFBT8-UwrO6HeNMoqpKKxUg8',
    role: 'player',
    rating: 1403,
    firstName: 'Nate',
    lastName: 'Carter',
    matchesPlayed: 1
  },
  {
    _id: '618c9851c8725e04b05894a0',
    phone: '+1802234231',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMjM0MjMxIiwiaWF0IjoxNjM2ODE4MjE2LCJleHAiOjE2Mzg3MTkwMTZ9.YaR_o8BITzLsGnhHdMDSVTmMzERvsJBZTAGcEJ2rBxQ',
    role: 'player',
    firstName: 'Eric',
    lastName: 'Kurtz',
    rating: 2700,
    matchesPlayed: 1
  },
  {
    _id: '618c99b4c8725e04b05894af',
    phone: '+180232420333',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MjAzMzMiLCJpYXQiOjE2MzY2MDQzNDAsImV4cCI6MTYzODUwNTE0MH0.NxLsRIS6Kr6PZaPpyOWfWmiMI6UzOkv0DXTUarUrJuY',
    role: 'player',
    firstName: 'Jeremy',
    lastName: 'Seagull',
    rating: 1403,
    matchesPlayed: 1
  },
  {
    _id: '618c9ab9c8725e04b05894bf',
    phone: '+180223423412123',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMjM0MjM0MTIxMjMiLCJpYXQiOjE2MzY2MDQ2MDEsImV4cCI6MTYzODUwNTQwMX0.v4BPQubZ9pPcWwx07LHEn2oYbHnjw3fh_QuPVTKwVJE',
    role: 'player',
    firstName: 'Amy',
    lastName: 'Smith',
    rating: 600,
    matchesPlayed: 0.0
  },
  {
    _id: '618c9b09c8725e04b05894c9',
    phone: '+1233324234399',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxMjMzMzI0MjM0Mzk5IiwiaWF0IjoxNjM2NjA0NjgxLCJleHAiOjE2Mzg1MDU0ODF9.XLZxUCzluOO3MNKqE_Mk8OZ3nm3crm0U8bExKNkwzzo',
    role: 'player',
    firstName: 'Bob',
    lastName: 'Suave',
    rating: 1403,
    matchesPlayed: 0
  },
  {
    _id: '618c9cb2c8725e04b05894ef',
    phone: '+16666',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxNjY2NiIsImlhdCI6MTYzNjYwNTEwNiwiZXhwIjoxNjM4NTA1OTA2fQ.yl1W5F2yzpQ1B5dq182FsahtvJHIelIFnPFJMYd8ag0',
    role: 'player',
    firstName: 'Tim',
    lastName: 'Mccley',
    rating: 2700,
    matchesPlayed: 1
  },
  {
    _id: '618f4534f283c2a963366e85',
    phone: '+19999999',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxOTk5OTk5OSIsImlhdCI6MTYzNjc3OTMxNiwiZXhwIjoxNjM4NjgwMTE2fQ.x5ljH0LPtPmxEUMStssdLJbtIyJRq6tgqrUgoHC09vc',
    role: 'admin',
    firstName: 'Alec',
    lastName: 'Carrier',
    rating: 1403,
    matchesPlayed: 0
  },
  {
    _id: '6191a4a3acdef1ddd09a3c8c',
    phone: '+18023242070',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IisxODAyMzI0MjA3MCIsImlhdCI6MTYzNzUzMTk5MCwiZXhwIjoxNjM5NDMyNzkwfQ.-Pb9NxcMndqFpYRGro-gGf-LwIVpkpcymCMeU3qXt4I',
    role: 'admin',
    rating: 1000,
    firstName: 'dfdfg',
    lastName: 'dfgdg',
    matchesPlayed: 0.0
  }
] as User[];