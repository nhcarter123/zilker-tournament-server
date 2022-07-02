# Zilker Apollo Server

The server used by https://zilkerchess.com. This is a graphql server that leverages
a MongoDB database for data storage, and a Redis instance for live data updates (subscriptions).

## Pairing System
For our tournament pairings we use something close to an Accelerated Swiss system - but with my own unique twist.
It implements a new variable I'm calling "maximum punch-down". It maintains the traditional swiss player experience
while limiting massive pairing mismatches that lead to un-fun games. 
Here is an example picture that gives you an idea of how the pairings work: https://imgur.com/e5katw1

## Rating Calculation
For our own in-house rating, we use a slightly modified version of the Glicko-2 algorithm.
Here it is in luxurious Typescript for your viewing pleasure.
```typescript
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
```

## Getting Started

Download [NodeJS](https://nodejs.org/en/download/), if you don't have it. (I'm using v16.5.0)

if you don't have yarn, install it
```
npm i yarn -g
```

Install dependencies
```
yarn
```

Start the app
```
npm run start:dev
```