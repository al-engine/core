export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Space {
  position: Position;
  size: Size;
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
    color += r * 256 ** 2;
    color += (255 - a) * 256 ** 3;
    return new OrgbColor(color);
  }

  get o() {
    let o = (this.value & 0xff000000) >> 24;
    return o < 0 ? o + 256 : o;
  }
  get r() {
    return (this.value & 0x00ff0000) >> 16;
  }
  get g() {
    return (this.value & 0x0000ff00) >> 8;
  }
  get b() {
    return this.value & 0x000000ff;
  }
  get a() {
    return 255 - this.o;
  }

  compose = (top: OrgbColor) => {
    const a = top.a / 255;
    return new OrgbColor(
      (this.value & 0xffffff) * (1 - a) + (top.value & 0xffffff) * a
    );
  };
}

export interface CameraResult {
  moveCamera: MoveCamera;
  pixels: Pixels;
  draw: (setPixel: SetPixel) => void;
  reset: () => void;
  inBound: (
    position: { x: number; y: number },
    size: { height: number; width: number }
  ) => boolean;
}
export type MoveCamera = (_x: number, _y: number) => void;

export interface Sprite {
  width: number;
  height: number;
  pixels: Array<number>;
}
export interface SpriteMap {
  sprites: Array<Sprite>;
}

export abstract class Asset<T> {
  isLoading(): boolean {
    return false;
  }
  data?: T;
  abstract load: () => void;
}

export enum LogLevel {
  info,
  warning,
  error,
}

interface Log {
  minLevel: LogLevel;
  appliedAreas?: any[];
  (message: string, level?: LogLevel, area?: any): void;
}

export const log: Log = (
  message: string,
  level: LogLevel = LogLevel.info,
  area?: any
) => {
  if (log.minLevel < level) {
    return;
  }
  if (log.appliedAreas && log.appliedAreas.indexOf(area) === -1) {
    return;
  }
  console.log(message);
};
log.minLevel = LogLevel.info;
