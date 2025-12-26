export class ASCIIConverter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private asciiChars = {
    default: " .:-=+*#%@",
    dense: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    simple: " .:oO0@",
    blocks: " ░▒▓█",
  };

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
  }

  /**
   * Конвертирует видео кадр в ASCII-арт
   */
  frameToASCII(
    video: HTMLVideoElement,
    width: number,
    height: number,
    style: keyof typeof this.asciiChars = "default",
    invert: boolean = false
  ): string {
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.drawImage(video, 0, 0, width, height);

    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const chars = this.asciiChars[style];
    let ascii = "";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

        let charIndex = Math.floor(brightness * (chars.length - 1));
        if (invert) {
          charIndex = chars.length - 1 - charIndex;
        }

        ascii += chars[charIndex];
      }
      ascii += "\n";
    }

    return ascii;
  }
}
