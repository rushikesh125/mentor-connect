// src/utils/generateZoomLink.js
export const generateZoomLink = (sessionId) => {
  const fakeId = Math.floor(100000000 + Math.random() * 900000000);
  return `https://zoom.us/j/${fakeId}?pwd=mentorconnect2025&session=${sessionId}`;
};