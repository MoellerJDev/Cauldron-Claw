import { Application, Container, Graphics, Text } from 'pixi.js';
import type { GameViewModel } from '../GameViewModel';
import { formatGameDebugSummary } from '../debugSummary';
import type { GameView } from '../GameView';

export class PixiGameView implements GameView {
  private app: Application | undefined;
  private playfield: Graphics | undefined;
  private labelLayer: Container | undefined;
  private summaryText: Text | undefined;

  async mount(container: HTMLElement): Promise<void> {
    const app = new Application();

    await app.init({
      width: 960,
      height: 540,
      backgroundColor: 0x17120f,
      antialias: true,
      resizeTo: container,
    });

    container.appendChild(app.canvas);
    this.app = app;
    this.createScene();
  }

  render(model: GameViewModel): void {
    if (
      this.playfield === undefined ||
      this.labelLayer === undefined ||
      this.summaryText === undefined
    ) {
      return;
    }

    this.playfield.clear();
    this.labelLayer.removeChildren().forEach((child) => {
      child.destroy({ children: true });
    });

    this.drawPachinkoSpike(model);
    this.summaryText.text = formatGameDebugSummary(model);
  }

  destroy(): void {
    this.app?.destroy(true);
    this.app = undefined;
    this.playfield = undefined;
    this.labelLayer = undefined;
    this.summaryText = undefined;
  }

  private createScene(): void {
    if (this.app === undefined) {
      throw new Error('PixiGameView must be mounted before creating a scene.');
    }

    const playfield = new Graphics();
    const labelLayer = new Container();
    const title = new Text({
      text: 'Cauldron Claw',
      style: {
        fill: 0xf5e2c4,
        fontFamily: 'Inter, sans-serif',
        fontSize: 34,
        fontWeight: '700',
      },
    });
    const subtitle = new Text({
      text: 'Pachinko spike: lane choice, pegs, and Fire Peg reactions',
      style: {
        fill: 0xd2b99b,
        fontFamily: 'Inter, sans-serif',
        fontSize: 18,
      },
    });
    const summaryText = new Text({
      text: '',
      style: {
        fill: 0xf4dcc0,
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        fontSize: 16,
        lineHeight: 24,
      },
    });

    title.position.set(620, 64);
    subtitle.position.set(620, 112);
    summaryText.position.set(620, 168);

    this.app.stage.addChild(
      playfield,
      labelLayer,
      title,
      subtitle,
      summaryText,
    );
    this.playfield = playfield;
    this.labelLayer = labelLayer;
    this.summaryText = summaryText;
  }

  private drawPachinkoSpike(model: GameViewModel): void {
    if (this.playfield === undefined || this.labelLayer === undefined) {
      return;
    }

    const graphics = this.playfield;
    const { board, cauldronBoundaries, dropLanes, ingredients, pegs } =
      model.pachinko;

    graphics
      .roundRect(board.x, board.y, board.width, board.height, 8)
      .fill(0x2a201b)
      .stroke({ color: 0x6d5143, width: 2 });
    this.addText(board.label, board.x + 16, board.y + 12, 16, 0xd9b88f);

    for (const lane of dropLanes) {
      graphics
        .moveTo(lane.x, lane.topY)
        .lineTo(lane.x, lane.bottomY)
        .stroke({
          color: lane.selected ? 0xf4dcc0 : 0x8fb7c8,
          width: lane.selected ? 3 : 2,
          alpha: lane.selected ? 0.9 : 0.45,
        });
      this.addText(
        lane.label,
        lane.x - 24,
        lane.topY - 24,
        14,
        lane.selected ? 0xf4dcc0 : 0xc7b7a5,
      );
    }

    for (const zone of model.pachinko.reactionZones) {
      graphics
        .rect(
          zone.x - zone.width / 2,
          zone.y - zone.height / 2,
          zone.width,
          zone.height,
        )
        .fill({ color: zone.color, alpha: 0.35 })
        .stroke({ color: zone.color, width: 2 });
      this.addCenteredText(zone.label, zone.x, zone.y - 4, 13, 0xffd0b0);
    }

    for (const sensor of model.pachinko.cauldronSensors) {
      graphics
        .rect(
          sensor.x - sensor.width / 2,
          sensor.y - sensor.height / 2,
          sensor.width,
          sensor.height,
        )
        .fill({ color: 0x64b78f, alpha: 0.18 })
        .stroke({ color: 0x64b78f, width: 2, alpha: 0.8 });
      this.addCenteredText(sensor.label, sensor.x, sensor.y - 4, 12, 0xbde6cf);
    }

    for (const peg of pegs) {
      graphics
        .circle(peg.x, peg.y, peg.radius)
        .fill(peg.color)
        .stroke({
          color: peg.strokeColor,
          width: peg.pegKind === 'fire' ? 3 : 2,
        });
      if (peg.pegKind === 'fire') {
        this.addCenteredText(peg.label, peg.x, peg.y - 3, 11, 0x1b1512);
      }
    }

    graphics
      .roundRect(68, 360, 484, 138, 8)
      .stroke({ color: 0xa47648, width: 3, alpha: 0.9 });
    this.addText('Cauldron Catch', 86, 374, 15, 0xd9b88f);

    for (const boundary of cauldronBoundaries) {
      graphics
        .rect(
          boundary.x - boundary.width / 2,
          boundary.y - boundary.height / 2,
          boundary.width,
          boundary.height,
        )
        .fill({ color: 0x3f2d25, alpha: 0.75 })
        .stroke({ color: 0xa47648, width: 1, alpha: 0.7 });
    }

    for (const ingredient of ingredients) {
      graphics
        .circle(ingredient.x, ingredient.y, ingredient.radius)
        .fill(ingredient.color)
        .stroke({ color: 0xf7efe3, width: 2 });
      this.addCenteredText(
        ingredient.label,
        ingredient.x,
        ingredient.y - 6,
        12,
        0x1b1512,
      );
    }
  }

  private addText(
    text: string,
    x: number,
    y: number,
    fontSize = 14,
    fill = 0xf5e2c4,
  ): void {
    if (this.labelLayer === undefined) {
      return;
    }

    const label = new Text({
      text,
      style: {
        fill,
        fontFamily: 'Inter, sans-serif',
        fontSize,
      },
    });
    label.position.set(x, y);
    this.labelLayer.addChild(label);
  }

  private addCenteredText(
    text: string,
    x: number,
    y: number,
    fontSize = 14,
    fill = 0xf5e2c4,
  ): void {
    if (this.labelLayer === undefined) {
      return;
    }

    const label = new Text({
      text,
      style: {
        align: 'center',
        fill,
        fontFamily: 'Inter, sans-serif',
        fontSize,
        fontWeight: '700',
      },
    });
    label.anchor.set(0.5);
    label.position.set(x, y);
    this.labelLayer.addChild(label);
  }
}
