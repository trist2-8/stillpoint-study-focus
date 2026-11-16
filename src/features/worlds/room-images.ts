import { create } from "zustand";
import type { StudyWorldId } from "../../types";
import { isWorldId } from "../focus/worlds";
interface RoomImage {
  id: StudyWorldId;
  blob: Blob;
  name: string;
}
interface Images {
  urls: Partial<Record<StudyWorldId, string>>;
  preview: Partial<Record<StudyWorldId, string>>;
  setPreview: (images: Partial<Record<StudyWorldId, string>>) => void;
}
export const useRoomImages = create<Images>((set) => ({
  urls: {},
  preview: {},
  setPreview: (preview) => set({ preview }),
}));
export const defaultRoomPhotos: Partial<Record<StudyWorldId, string>> = {
  academia: "/rooms/library.jpg",
  forest: "/rooms/forest.jpg",
  "rainy-cafe": "/rooms/cafe.jpg",
};
function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("focus-flow-room-images", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("images"))
        request.result.createObjectStore("images", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
let loading: Promise<void> | undefined;
export function loadRoomImages() {
  if (loading) return loading;
  loading = (async () => {
    const storage = await database();
    try {
      const images = await new Promise<RoomImage[]>((resolve, reject) => {
        const request = storage
          .transaction("images", "readonly")
          .objectStore("images")
          .getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const urls: Partial<Record<StudyWorldId, string>> = {};
      for (const image of images)
        if (isWorldId(image.id) && image.blob instanceof Blob)
          urls[image.id] = URL.createObjectURL(image.blob);
      useRoomImages.setState({ urls });
    } finally {
      storage.close();
    }
  })().catch(() => {});
  return loading;
}
export async function validateRoomImage(file: File) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("type");
  if (file.size > 10 * 1024 * 1024) throw new Error("size");
  const bitmap = await createImageBitmap(file);
  const valid = bitmap.width >= 600 && bitmap.height >= 360;
  bitmap.close();
  if (!valid) throw new Error("dimensions");
}
export async function saveRoomImages(images: RoomImage[]) {
  if (!images.length) return;
  const storage = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = storage.transaction("images", "readwrite");
      for (const image of images) transaction.objectStore("images").put(image);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    const urls = { ...useRoomImages.getState().urls };
    for (const image of images) {
      if (urls[image.id]) URL.revokeObjectURL(urls[image.id]!);
      urls[image.id] = URL.createObjectURL(image.blob);
    }
    useRoomImages.setState({ urls });
  } finally {
    storage.close();
  }
}
