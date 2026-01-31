// 判断是否为空图片（无需显示）
export function isPlaceholder(src) {
  return !src || src.includes('data:image/svg+xml')
}

export function resolveImageUrl(src) {
  const val = src || ''
  const lower = val.toLowerCase()
  // 空图片返回空字符串
  if (!val) return ''
  // 已经是完整URL或base64，直接返回
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) return val
  // 相对路径拼接后端地址
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
  if (val.startsWith('/')) return base + val
  return base + '/' + val
}
