import { MatchResult } from '../../match/MatchTypes';

const getKFactor = (matchCount: number) => {
  return 20 + 600 / Math.max(matchCount, 1);
};

const getResultPoints = (matchResult: MatchResult, isWhite: boolean) => {
  switch (matchResult) {
    case MatchResult.WhiteWon:
      return isWhite ? 1 : 0;
    case MatchResult.Draw:
      return 0.5;
    case MatchResult.BlackWon:
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
): number => {
  const kFactor = getKFactor(matchesPlayed);
  const resultPoints = getResultPoints(matchResult, isWhite);

  const myChanceToWin = 1 / (1 + Math.pow(10, (opponentRating - rating) / 400));

  return rating + Math.round(kFactor * (resultPoints - myChanceToWin));
};
