export default function createGame(canvas: HTMLCanvasElement, update: Update) : Game {
  const context = canvas.getContext('2d');
  if (!context) {
    throw Error('Wrong element, "canvas" expected');
  }

  let animationRequestId: number;
  let screen: Screen;
  let lastTime = Date.now();

  function init() {
    screen = new Screen(context!.createImageData(canvas.width, canvas.height));
  }

  function tick(): void {
    const currTime = Date.now();
    update({
      delta: currTime - lastTime,
      pixels: screen
    });
    context!.putImageData(screen.imageData, 0, 0);
    lastTime = currTime;
    animationRequestId = requestAnimationFrame(tick);
  }

  return {
    stop: function () {
      cancelAnimationFrame(animationRequestId);
    },
    start: function () {
      init();
      tick();
    },
    reinit: function () {
      init();
    }
  }
}

export type Update = (params: UpdateParams) => void;

export interface Game {
  stop: () => void
  start: () => void
  reinit: () => void
}

export class Screen implements Pixels {
  imageData: ImageData;
  constructor (imageData: ImageData) {
    this.imageData = imageData;
  }
  setPixel (x: number, y: number, color: OrgbValue) {
    const c = new OrgbColor(color);
    const index = this.getIndexFromPoint(x, y);
    this.imageData.data[index] = c.r;
    this.imageData.data[index + 1] = c.g;
    this.imageData.data[index + 2] = c.b;
    this.imageData.data[index + 3] = c.a ;
  }
  getPixel (x: number, y: number) {
    const index = this.getIndexFromPoint(x, y);
    return OrgbColor.fromRgba(
      this.imageData.data[index],
      this.imageData.data[index + 1],
      this.imageData.data[index + 2],
      this.imageData.data[index + 3]
    ).value;
  }
  getIndexFromPoint (x: number, y: number) {
    if (!Number.isInteger(x) || x < 0 || !Number.isInteger(y) || y < 0) {
      throw new Error('Wrong parameter');
    }
    return (y * this.imageData.width + x) * 4;
  }
}

export interface UpdateParams {
  delta: DeltaTime;
  pixels: Pixels;
}

export type OrgbValue = number;

export type DeltaTime = number;

export interface Pixels {
  setPixel: SetPixel;
  getPixel: GetPixel;
}

export type SetPixel = (x: number, y: number, color: OrgbValue) => void;
export type GetPixel = (x: number, y: number) => OrgbValue | void;

export class OrgbColor {
  readonly value: OrgbValue;
  constructor(value: OrgbValue) {
    if (!Number.isInteger(value) || value < 0) {
      throw Error('Wrong parameter');
    }
    this.value = value;
  }

  static fromRgba(r: number, g: number, b: number, a: number) {
    let color: OrgbValue = 0;
    color += b;
    color += g * 256;
    color += r * (256 ** 2);
    color += (255 - a) * (256 ** 3);
    return new OrgbColor(color);
  }

  get o () {
    let o = (this.value & 0xff000000) >> 24;
    return o < 0 ? o + 256 : o;
  };
  get r () { return (this.value & 0x00ff0000) >> 16;}
  get g () { return (this.value & 0x0000ff00) >> 8;}
  get b () { return this.value & 0x000000ff;}
  get a () { return 255 - this.o;}

  compose = (top: OrgbColor) => {
    const a = top.a / 255;
    return new OrgbColor((this.value & 0xffffff) * (1 - a) + (top.value & 0xffffff) * a);
  }
}

export enum LogLevel {
  info,
  warning,
  error
}

interface Log {
  minLevel: LogLevel,
  appliedAreas?: any[],
  (message: string, level?: LogLevel, area?: any): void;
}

export const log: Log = (message: string, level: LogLevel = LogLevel.info, area?: any) => {
  if (log.minLevel < level) {
    return;
  }
  if (log.appliedAreas && log.appliedAreas.indexOf(area) == -1) {
    return;
  }
  console.log(message);
};
log.minLevel = LogLevel.info;