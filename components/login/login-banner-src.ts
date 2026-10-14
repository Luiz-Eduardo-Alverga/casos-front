const DAWN_START_MINUTES = 6 * 60;
const DAY_START_MINUTES = 8 * 60;
const NIGHT_START_MINUTES = 17 * 60 + 30;

const BANNER_DAWN = "/images/Gemini_Generated_Image.jpeg";
const BANNER_DAY = "/images/Gemini_Generated_Image%20(2).jpeg";
const BANNER_NIGHT = "/images/Gemini_Generated_Image%20(1).jpeg";

/** Foto do banner conforme a hora local: amanhecer, dia ou noite. */
export function resolveLoginBannerSrc(date: Date): string {
  const minutes = date.getHours() * 60 + date.getMinutes();

  if (minutes >= DAWN_START_MINUTES && minutes < DAY_START_MINUTES) {
    return BANNER_DAWN;
  }

  if (minutes >= DAY_START_MINUTES && minutes < NIGHT_START_MINUTES) {
    return BANNER_DAY;
  }

  return BANNER_NIGHT;
}
