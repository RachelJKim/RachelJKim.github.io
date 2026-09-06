Unused — teasers live in frontend/public/images/publications/ and are
referenced from js/publications.js by absolute path:

  teaser: "/images/publications/name.mp4"

Export them as MP4 (H.264, yuv420p, +faststart, no audio) rather than GIF,
with a same-named .jpg first frame beside it as the poster; see the
teaser-format note in the header of js/publications.js for the ffmpeg lines.

Roughly 1.6:1 (the frame is 146.6 x 91.2 design units) crops best,
but any aspect works — object-fit: cover handles it.
