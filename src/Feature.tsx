import { useMemo } from "react";
import {
  useRoster,
  useSharedCollection,
  type MeshConfig,
  type YRoom,
} from "@baditaflorin/mesh-common";
type Props = { room: YRoom | null; config: MeshConfig };
type Game = { id: "game"; turn: number; score: number; updatedAt: number };
const CLUES = [
  "volcano",
  "bicycle",
  "rainbow",
  "pancake",
  "astronaut",
  "library",
  "octopus",
  "campfire",
];
export function isValidGame(value: unknown): value is Game {
  const game = value as Partial<Game>;
  return Boolean(
    game &&
    game.id === "game" &&
    Number.isInteger(game.turn) &&
    (game.turn ?? -1) >= 0 &&
    Number.isInteger(game.score) &&
    (game.score ?? -1) >= 0 &&
    Number.isFinite(game.updatedAt),
  );
}
export function Feature({ room, config }: Props) {
  const roster = useRoster(room);
  const gameStore = useSharedCollection<Game>(room, "mesh-heads-up:game", {
    validate: isValidGame,
  });
  const game = gameStore.byId("game");
  const players = useMemo(
    () => [...new Set(roster.present.length ? roster.present : room ? [room.peerId] : [])].sort(),
    [roster.present, room],
  );
  const holder = game && players.length ? players[game.turn % players.length] : undefined;
  const myTurn = holder === room?.peerId;
  const clue = game ? CLUES[game.turn % CLUES.length] : "Start a round to draw a clue.";
  const start = () =>
    room && !game && gameStore.add({ id: "game", turn: 0, score: 0, updatedAt: Date.now() });
  const advance = (scored: boolean) => {
    if (!game || !myTurn) return;
    gameStore.update("game", {
      turn: game.turn + 1,
      score: game.score + (scored ? 1 : 0),
      updatedAt: Date.now(),
    });
  };
  if (!room)
    return (
      <main className="heads">
        <h1>{config.appName}</h1>
        <p role="status">Joining room…</p>
      </main>
    );
  return (
    <main className="heads">
      <p className="eyebrow">Clue relay</p>
      <h1>Hold it high. Guess it fast.</h1>
      <p role="status" aria-live="polite">
        {game
          ? `Turn ${game.turn + 1}. ${myTurn ? "Your device has the clue." : "Another peer has the clue."}`
          : "Ready to start."}
      </p>
      <section>
        <p className="eyebrow">Secret-ish clue</p>
        <h2>{clue}</h2>
        <p>Score: {game?.score ?? 0} · stable player order makes the holder deterministic.</p>
        {!game ? (
          <button onClick={start}>Start clue relay</button>
        ) : (
          <div>
            <button disabled={!myTurn} onClick={() => advance(true)}>
              Got it — pass on
            </button>
            <button disabled={!myTurn} onClick={() => advance(false)}>
              Skip clue
            </button>
          </div>
        )}
      </section>
      <p className="hint">
        The holder should keep this screen facing themselves while other peers give clues.
      </p>
    </main>
  );
}
