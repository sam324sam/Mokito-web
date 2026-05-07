import { Canvas } from '../../../models/player/player-data.model';
/**
 * Ajusta las coordenadas del cursor segun las resoluciones de canvas local y remoto
 */
export function ajustLocationCanvas(
  location: { x: number; y: number },
  canvasLocal: Canvas,
  serverCanvas: Canvas,
): { localX: number; localY: number } {
  let localX = 0;
  let localY = 0;
  const scaleX = canvasLocal.width / serverCanvas.width;
  const scaleY = canvasLocal.height / serverCanvas.height;

  localX = location.x * scaleX;
  localY = location.y * scaleY;
  return { localX, localY };
}
