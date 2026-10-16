"use client";

/**
 * Proctoring engine helpers — loads TF.js, COCO-SSD, MediaPipe via CDN.
 * All loading is best-effort: if CDN is unreachable, callers degrade gracefully.
 */

declare global {
  interface Window {
    tf?: any;
    cocoSsd?: any;
  }
}

let tfPromise: Promise<any> | null = null;
let cocoPromise: Promise<any> | null = null;
let faceDetectorPromise: Promise<any> | null = null;

const TF_SRC = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
const COCO_SRC = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function loadTensorFlow(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (window.tf) return window.tf;
  if (tfPromise) return tfPromise;
  tfPromise = loadScript(TF_SRC)
    .then(() => {
      if (!window.tf) throw new Error("tf not on window");
      return window.tf;
    })
    .catch((e) => {
      tfPromise = null;
      throw e;
    });
  return tfPromise;
}

export async function loadCocoSsd(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (window.cocoSsd) return window.cocoSsd;
  if (cocoPromise) return cocoPromise;
  cocoPromise = loadCocoSsdInternal();
  return cocoPromise;
}

async function loadCocoSsdInternal(): Promise<any> {
  await loadTensorFlow();
  await loadScript(COCO_SRC);
  if (!window.cocoSsd) throw new Error("cocoSsd not on window");
  const model = await window.cocoSsd.load({ base: "lite_mobilenet_v2" });
  return model;
}

/** MediaPipe Tasks Vision FaceDetector (ESM dynamic import) */
export async function loadFaceDetector(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (faceDetectorPromise) return faceDetectorPromise;
  faceDetectorPromise = (async () => {
    const vision = await import(
      /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
    );
    const fileset = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    const detector = await vision.FaceDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
    });
    return detector;
  })().catch((e) => {
    faceDetectorPromise = null;
    throw e;
  });
  return faceDetectorPromise;
}

export type ObjectDetection = {
  bbox: [number, number, number, number]; // x,y,w,h
  class: string;
  score: number;
};

export async function detectObjects(model: any, video: HTMLVideoElement): Promise<ObjectDetection[]> {
  if (!model || !video) return [];
  const preds = await model.detect(video);
  return preds as ObjectDetection[];
}

export type FaceResult = { count: number; faces: { bbox: [number, number, number, number] }[] };

export async function detectFaces(detector: any, video: HTMLVideoElement, timestampMs: number): Promise<FaceResult> {
  if (!detector || !video) return { count: 0, faces: [] };
  try {
    const res = await detector.detectForVideo(video, timestampMs);
    const faces = (res.detections || []).map((d: any) => ({ bbox: d.boundingBox }));
    return { count: faces.length, faces };
  } catch {
    return { count: 0, faces: [] };
  }
}

/** Draw bounding boxes on a canvas overlaying the video */
export function drawBoxes(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  objects: ObjectDetection[],
  faces: FaceResult,
  badObjects: string[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  ctx.clearRect(0, 0, w, h);

  // objects
  for (const o of objects) {
    const [x, y, bw, bh] = o.bbox;
    const bad = badObjects.includes(o.class) || o.class === "person";
    ctx.lineWidth = 3;
    ctx.strokeStyle = bad ? "#ef4444" : "#10b981";
    ctx.strokeRect(x, y, bw, bh);
    ctx.fillStyle = bad ? "rgba(239,68,68,0.85)" : "rgba(16,185,129,0.85)";
    ctx.font = "bold 13px sans-serif";
    const label = `${o.class} ${Math.round(o.score * 100)}%`;
    const tw = ctx.measureText(label).width + 8;
    ctx.fillRect(x, Math.max(0, y - 18), tw, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x + 4, Math.max(12, y - 5));
  }
  // faces (blue)
  for (const f of faces.faces) {
    const [x, y, bw, bh] = f.bbox;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#9fe0ff";
    ctx.strokeRect(x, y, bw, bh);
  }
}

/** Capture a compressed JPEG snapshot from a video */
export function captureSnapshot(video: HTMLVideoElement, quality = 0.5): string {
  try {
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 320;
    c.height = video.videoHeight || 240;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } catch {
    return "";
  }
}
