import { createGameView } from './ui/game-view.js';
import { connectGame } from './ui/game-controller.js';

const view = createGameView();
document.body.append(view.element);
connectGame(view);
