import { useEffect, useRef } from "react";
import { startGame } from "./game/Game";

export default function App() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = startGame("game-container");
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div id="game-container" className="w-full h-full" />
    </div>
  );
}
