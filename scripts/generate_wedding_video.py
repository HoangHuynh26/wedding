import math
import os
import shutil
import subprocess
import sys
import time
import numpy as np
from PIL import Image
import imageio_ffmpeg


def smoothstep_cosine(t: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))


def render_ken_burns_frame(
    img: Image.Image,
    out_w: int,
    out_h: int,
    zoom: float,
    x_bias: float,
    y_bias: float,
) -> np.ndarray:
    """Render a sub-pixel smooth full-bleed 16:9 frame from a single landscape photo."""
    src_w, src_h = img.size
    target_aspect = out_w / float(out_h)
    src_aspect = src_w / float(src_h)

    if src_aspect >= target_aspect:
        base_h = float(src_h)
        base_w = base_h * target_aspect
    else:
        base_w = float(src_w)
        base_h = base_w / target_aspect

    win_w = base_w / zoom
    win_h = base_h / zoom

    avail_x = max(0.0, src_w - win_w)
    avail_y = max(0.0, src_h - win_h)

    x0 = avail_x * max(0.0, min(1.0, x_bias))
    y0 = avail_y * max(0.0, min(1.0, y_bias))
    x1 = x0 + win_w
    y1 = y0 + win_h

    framed = img.transform(
        (out_w, out_h),
        Image.Transform.EXTENT,
        (x0, y0, x1, y1),
        Image.Resampling.BICUBIC,
    )
    return np.asarray(framed, dtype=np.uint8)


def create_horizontal_wedding_video():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    base_dir = r"C:\Wedding"
    client_public = os.path.join(base_dir, "client", "public")
    client_dist = os.path.join(base_dir, "client", "dist")
    out_dir = os.path.join(client_public, "videos")
    os.makedirs(out_dir, exist_ok=True)
    out_video_path = os.path.join(out_dir, "memories_v2.mp4")
    tmp_video_path = os.path.join(out_dir, "_memories_render.mp4")

    # ONLY genuine full-screen single-frame horizontal (landscape) photos — NO stitched album collages
    scenes = [
        {
            "rel": "photos/tuan-0923.jpg",  # 1. Đại sảnh đường uy nghi (2048x1366)
            "zoom_start": 1.00,
            "zoom_end": 1.05,
            "x_start": 0.50,
            "x_end": 0.50,
            "y_start": 0.55,
            "y_end": 0.49,
        },
        {
            "rel": "photos/tuan-0992.jpg",  # 2. Tà khăn voan trắng bay bồng bềnh (2048x1366)
            "zoom_start": 1.05,
            "zoom_end": 1.00,
            "x_start": 0.55,
            "x_end": 0.47,
            "y_start": 0.52,
            "y_end": 0.55,
        },
        {
            "rel": "photos/tuan-1341.jpg",  # 3. Góc nhìn trên cao cầu thang hoàng gia (2048x1366)
            "zoom_start": 1.00,
            "zoom_end": 1.05,
            "x_start": 0.50,
            "x_end": 0.50,
            "y_start": 0.78,
            "y_end": 0.69,
        },
        {
            "rel": "photos/tuan-1514.jpg",  # 4. Bình yên bên ban công lãng mạn (1971x1315)
            "zoom_start": 1.05,
            "zoom_end": 1.00,
            "x_start": 0.46,
            "x_end": 0.52,
            "y_start": 0.42,
            "y_end": 0.46,
        },
    ]

    loaded_scenes = []
    for s in scenes:
        full_p = os.path.join(client_public, s["rel"].replace("/", os.sep))
        if not os.path.exists(full_p):
            raise FileNotFoundError(f"Missing horizontal photo: {full_p}")
        img = Image.open(full_p).convert("RGB")
        w, h = img.size
        if w <= h:
            raise ValueError(f"Expected landscape photo (w > h), got {w}x{h} for {full_p}")
        loaded_scenes.append((img, s))

    WIDTH = 1920
    HEIGHT = 1080
    FPS = 30
    SECONDS_PER_SCENE = 4.0
    SCENE_NET_FRAMES = int(FPS * SECONDS_PER_SCENE)  # 120 frames = exact 4.0s per photo
    FADE_FRAMES = 21  # 0.7s smooth crossfade dissolve
    SCENE_SPAN_FRAMES = SCENE_NET_FRAMES + FADE_FRAMES  # 141 frames

    def get_scene_frame(scene_idx: int, local_f: int) -> np.ndarray:
        img, cfg = loaded_scenes[scene_idx]
        u = local_f / float(max(1, SCENE_SPAN_FRAMES - 1))
        zoom = cfg["zoom_start"] + (cfg["zoom_end"] - cfg["zoom_start"]) * u
        xb = cfg["x_start"] + (cfg["x_end"] - cfg["x_start"]) * u
        yb = cfg["y_start"] + (cfg["y_end"] - cfg["y_start"]) * u
        return render_ken_burns_frame(img, WIDTH, HEIGHT, zoom, xb, yb)

    n_scenes = len(loaded_scenes)
    total_frames = n_scenes * SCENE_NET_FRAMES

    ffmpeg_cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-an",  # Strictly no audio track
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "21",
        "-g", "60",
        "-movflags", "+faststart",
        tmp_video_path,
    ]

    print(
        f"Rendering {total_frames} frames ({total_frames / FPS:.1f}s @ {FPS}fps, "
        f"{SECONDS_PER_SCENE:.1f}s/photo) from {n_scenes} full-screen horizontal photos..."
    )
    t0 = time.time()
    proc = subprocess.Popen(
        ffmpeg_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    body_frames = SCENE_NET_FRAMES - FADE_FRAMES

    for idx in range(n_scenes):
        next_idx = (idx + 1) % n_scenes

        for k in range(body_frames):
            frame = get_scene_frame(idx, FADE_FRAMES + k)
            proc.stdin.write(frame.tobytes())

        for f in range(FADE_FRAMES):
            alpha = smoothstep_cosine((f + 1) / float(FADE_FRAMES + 1))
            frame_a = get_scene_frame(idx, FADE_FRAMES + body_frames + f)
            frame_b = get_scene_frame(next_idx, f)
            blended = (
                frame_a.astype(np.float32) * (1.0 - alpha)
                + frame_b.astype(np.float32) * alpha
            ).astype(np.uint8)
            proc.stdin.write(blended.tobytes())

    proc.stdin.close()
    stdout, stderr = proc.communicate()

    for img, _ in loaded_scenes:
        img.close()

    if proc.returncode != 0:
        print("FFmpeg error:", stderr.decode("utf-8", errors="ignore"))
        sys.exit(1)

    shutil.copyfile(tmp_video_path, out_video_path)
    shutil.copyfile(tmp_video_path, os.path.join(out_dir, "memories.mp4"))
    os.remove(tmp_video_path)

    dist_videos = os.path.join(client_dist, "videos")
    if os.path.exists(dist_videos):
        shutil.copyfile(out_video_path, os.path.join(dist_videos, "memories_v2.mp4"))
        shutil.copyfile(out_video_path, os.path.join(dist_videos, "memories.mp4"))

    t1 = time.time()
    file_size_mb = os.path.getsize(out_video_path) / (1024 * 1024)
    print(f"SUCCESS! memories_v2.mp4 created in {t1 - t0:.1f}s ({file_size_mb:.2f} MB)")


if __name__ == "__main__":
    create_horizontal_wedding_video()
