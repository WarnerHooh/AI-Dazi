/**
 * 悬浮球图标处理：
 * - GIF：保留原始数据（不裁剪，动画不丢），显示时用 object-cover 做圆形可视裁切
 * - 其它图片：居中 cover 裁剪为 size×size 的 PNG（体积小、显示稳定）
 */
export const GIF_MAX_BYTES = 1.5 * 1024 * 1024; // GIF 上限 1.5MB（存储与页面传输成本）

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read-failed'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/** 把用户上传的图片裁剪为正方形图标（默认 128×128 PNG data URL） */
export function fileToIconDataUrl(file, size = 128) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('图片解析失败'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('画布不可用'));
            return;
          }
          const scale = Math.max(size / img.width, size / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** 上传入口：GIF 保留动画原图，其它格式裁剪为正方形 PNG */
export async function fileToBallIcon(file, size = 128) {
  if (file && file.type === 'image/gif') {
    if (file.size > GIF_MAX_BYTES) throw new Error('gif-too-large');
    return readAsDataUrl(file);
  }
  return fileToIconDataUrl(file, size);
}
