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

    this.drawClawDebug(model);
    this.drawVatDebug(model);

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

  private drawClawDebug(model: GameViewModel): void {
    if (this.playfield === undefined) {
      return;
    }

    const graphics = this.playfield;
    const { claw } = model.pachinko;
    const area = claw.grabArea;
    const selectedPosition = claw.positions.find(
      (position) => position.selected,
    );

    graphics
      .rect(
        area.x - area.width / 2,
        area.y - area.height / 2,
        area.width,
        area.height,
      )
      .fill({ color: 0x8fb7c8, alpha: claw.canGrab ? 0.18 : 0.08 })
      .stroke({
        color: claw.canGrab ? 0x8fb7c8 : 0x5f7280,
        width: 2,
        alpha: 0.85,
      });

    for (const position of claw.positions) {
      const topY = area.y - area.height / 2 - 34;

      graphics
        .circle(position.x, topY, position.selected ? 7 : 5)
        .fill(position.selected ? 0xf4dcc0 : 0x6d5143)
        .stroke({
          color: position.selected ? 0x8fb7c8 : 0xa47648,
          width: position.selected ? 3 : 1,
        });
      this.addCenteredText(
        position.label,
        position.x,
        topY - 20,
        11,
        position.selected ? 0xf4dcc0 : 0xc7b7a5,
      );
    }

    if (selectedPosition === undefined) {
      return;
    }

    const clawTopY = area.y - area.height / 2 - 28;
    const clawBottomY = area.y - area.height / 2 + 8;

    graphics
      .moveTo(selectedPosition.x, clawTopY)
      .lineTo(selectedPosition.x, clawBottomY)
      .stroke({ color: 0xf4dcc0, width: 3 });
    graphics
      .moveTo(selectedPosition.x - 26, clawBottomY)
      .lineTo(selectedPosition.x + 26, clawBottomY)
      .stroke({ color: 0xf4dcc0, width: 3 });
    graphics
      .moveTo(selectedPosition.x - 18, clawBottomY)
      .lineTo(selectedPosition.x - 32, clawBottomY + 24)
      .stroke({ color: 0xf4dcc0, width: 3 });
    graphics
      .moveTo(selectedPosition.x + 18, clawBottomY)
      .lineTo(selectedPosition.x + 32, clawBottomY + 24)
      .stroke({ color: 0xf4dcc0, width: 3 });
    this.addCenteredText(
      claw.grabUsed ? 'Grab used' : 'Grab area',
      area.x,
      area.y - area.height / 2 + 18,
      12,
      0xbde6cf,
    );
  }

  private drawVatDebug(model: GameViewModel): void {
    if (this.playfield === undefined) {
      return;
    }

    const graphics = this.playfield;

    for (const vat of model.pachinko.vat.vats) {
      graphics
        .roundRect(
          vat.x - vat.width / 2,
          vat.y - vat.height / 2,
          vat.width,
          vat.height,
          6,
        )
        .fill({ color: vat.color, alpha: vat.selected ? 0.4 : 0.18 })
        .stroke({
          color: vat.selected ? 0xf4dcc0 : vat.color,
          width: vat.selected ? 3 : 1,
          alpha: 0.95,
        });
      this.addCenteredText(
        vat.label,
        vat.x,
        vat.y - 5,
        11,
        vat.selected ? 0xf7efe3 : 0xd9b88f,
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
