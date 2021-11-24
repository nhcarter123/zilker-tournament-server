import { MatchResult } from '../../match/MatchTypes';

const getKFactor = (matchCount: number) => {
  return 800 / (matchCount > 0 ? matchCount : 1);
};

const getResultPoints = (matchResult: MatchResult, isWhite: boolean) => {
  switch (matchResult) {
    case MatchResult.whiteWon:
      return isWhite ? 1 : 0;
    case MatchResult.draw:
      return 0.5;
    case MatchResult.blackWon:
    default:
      return isWhite ? 0 : 1;
  }
};

export const getRating = (
  rating: number,
  opponentRating: number,
  matchResult: MatchResult,
  matchesPlayed: number,
  isWhite: boolean
) => {
  const kFactor = getKFactor(matchesPlayed);
  const resultPoints = getResultPoints(matchResult, isWhite);

  const myChanceToWin = 1 / (1 + Math.pow(10, (opponentRating - rating) / 400));

  return rating + Math.round(kFactor * (resultPoints - myChanceToWin));
};
