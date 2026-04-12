import { supabase } from '../lib/supabase';

// ── Image Compression ────────────────────────────────────────────
async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// ── Features BG Upload ───────────────────────────────────────────
export async function uploadFeaturesBg(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file (JPEG, PNG, or WebP).');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('Image must be smaller than 20MB.');
  }

  const compressed = await compressImage(file, 1920, 0.85);
  const filePath = `features-bg/hero.webp`;

  const { error: uploadErr } = await supabase.storage
    .from('features-bg')
    .upload(filePath, compressed, { contentType: 'image/webp', upsert: true });

  if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

  const { data } = supabase.storage.from('features-bg').getPublicUrl(filePath);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  // Save URL to app_settings table
  const { error: settingsErr } = await supabase
    .from('app_settings')
    .upsert({ key: 'features_bg_image_url', value: publicUrl, updated_at: new Date().toISOString() });

  if (settingsErr) throw new Error(`Failed to save setting: ${settingsErr.message}`);

  return publicUrl;
}

// ── Update App Setting ───────────────────────────────────────────
export async function updateAppSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
}

// ── Fetch App Settings ───────────────────────────────────────────
export interface AppSettings {
  features_bg_image_url: string | null;
  features_bg_overlay_opacity: number;
}

export async function fetchAppSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value');

  if (error) throw new Error(error.message);

  const map: Record<string, string | null> = {};
  (data ?? []).forEach((row: { key: string; value: string | null }) => {
    map[row.key] = row.value;
  });

  return {
    features_bg_image_url: map.features_bg_image_url ?? null,
    features_bg_overlay_opacity: parseFloat(map.features_bg_overlay_opacity ?? '0.55'),
  };
}
