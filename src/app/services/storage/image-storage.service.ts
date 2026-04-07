import { Injectable } from '@angular/core';
import { AnimationSprite, AnimationType } from '../../models/sprites/animation-sprite.model';
import { AnimationSaveDb } from '../../models/sprites/animatio-save-db.model';

@Injectable({ providedIn: 'root' })
export class ImageStorageService {
  private readonly dbName = 'gameDB';
  private readonly dbVersion = 1;
  private readonly storeName = 'images';
  private db!: IDBDatabase;
  compatibleBrowser = typeof indexedDB !== 'undefined';

  /**
   * Abre o crea la base de datos "gameDB" y el objectStore "images".
   * Debe llamarse una vez al iniciar la app antes de usar cualquier otro método.
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        reject(new Error('IndexedDB not available or blocked'));
        // Esto lo usare para mostrarlo en un mensaje de error pero aun no creo que sea nesesario
        this.compatibleBrowser = false;
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.db = db;
        console.log(db);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      };
    });
  }

  /**
   * Guardo la animacion Sprite (si solo guardo imagen no se guardara el numero de frame y el animation service asi caput)
   * @param key 
   * @param animation 
   * @returns 
   * 
   */
  saveImage(key: string, animation: AnimationSprite): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('No esta inciada la db. Pruebe a reiniciar.'));
        return;
      }
      const imgToBlob = animation.image;

      const canvas = document.createElement('canvas');
      canvas.width = imgToBlob.naturalWidth;
      canvas.height = imgToBlob.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));

      ctx.drawImage(imgToBlob, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Error en la imagen, no se pudo subir a Blob'));

        const tx = this.db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);

        let saveAnimation: AnimationSaveDb = {
          blob,
          frameWidth: animation.frameWidth,
          frameHeight: animation.frameHeight,
          frameCount: animation.frameCount,
        };
        const request = store.put(saveAnimation, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(request.error?.message || 'IndexedDB error'));
      }, 'image/png');
    });
  }

  /**
   * 
   * Recupera una imagen por su clave desde IndexedDB regresa el objeto entero para guardar tambien los frmaes
   * Si no existe, devuelve null.
   */
  async getAnimationSave(key: string): Promise<AnimationSprite | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          resolve(null);
          return;
        }

        if (result && 'blob' in result && result.blob instanceof Blob) {
          const blob = result.blob;
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.src = url;
          // Cargar la imagen y resolver cuando este lista
          img.onload = () => {
            const animation: AnimationSprite = {
              image: img,
              frameWidth: result.frameWidth,
              frameHeight: result.frameHeight,
              frameCount: result.frameCount,
              active: result.active,
              description: result.description,
              animationType: AnimationType.loop,
            };
            resolve(animation);

          };
          img.onerror = () => resolve(null);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error(request.error?.message || 'IndexedDB error'));
    });
  }

  /**
   * Borra todas las imagenes almacenadas en caso de bug
   * Aun no va se debe realizar desde las propiedades de la pagina ver
   */
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(request.error?.message || 'IndexedDB error'));
    });
  }
}
