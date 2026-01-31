export const newsList = [
  { id: 1, title: '有氧运动入门指南：从零开始的健康旅程', cover: 'https://picsum.photos/seed/hn1/700/420', category: 'aerobic', views: 3 },
  { id: 2, title: '室内有氧运动大全：下雨天也能保持活力', cover: 'https://picsum.photos/seed/hn2/700/420', category: 'aerobic', views: 3 },
  { id: 3, title: '早餐吃不对，全天易疲惫：营养搭配建议', cover: 'https://picsum.photos/seed/hn3/700/420', category: 'diet', views: 2 },
  { id: 4, title: '每周150分钟：科学运动建议如何落地', cover: 'https://picsum.photos/seed/hn4/700/420', category: 'aerobic', views: 2 },
  { id: 5, title: '均衡饮食金字塔：每日摄入比例指南', cover: 'https://picsum.photos/seed/hn5/700/420', category: 'diet', views: 0 },
  { id: 6, title: '提高睡眠质量的 7 个方法', cover: 'https://picsum.photos/seed/hn6/700/420', category: 'sleep', views: 0 },
  { id: 7, title: '如何建立跑步习惯：从 1 公里开始', cover: 'https://picsum.photos/seed/hn7/700/420', category: 'run', views: 0 },
  { id: 8, title: '心理健康基础：识别与接纳情绪', cover: 'https://picsum.photos/seed/hn8/700/420', category: 'mind', views: 0 },
  { id: 9, title: '工作日快手早餐 5 选', cover: 'https://picsum.photos/seed/hn9/700/420', category: 'diet', views: 0 },
]

export const recipeList = [
  { id: 1, title: '鸡胸牛油果碗', desc: '高蛋白 | 低脂', cover: 'https://picsum.photos/seed/recipe1/700/420', category: 'protein', tag: '高蛋白', difficulty: '中等' },
  { id: 2, title: '燕麦酸奶杯', desc: '清爽早餐 | 低糖', cover: 'https://picsum.photos/seed/recipe2/700/420', category: '', tag: '早餐', difficulty: '简单' },
  { id: 3, title: '豆腐时蔬煎', desc: '素食优选 | 丰富纤维', cover: 'https://picsum.photos/seed/recipe3/700/420', category: 'vegan', tag: '素食', difficulty: '简单' },
  { id: 4, title: '三文鱼沙拉', desc: 'Omega-3 | 低脂', cover: 'https://picsum.photos/seed/recipe4/700/420', category: 'lowfat', tag: '低脂', difficulty: '中等' },
  { id: 5, title: '清炒西兰花', desc: '清淡少油 | 快手', cover: 'https://picsum.photos/seed/recipe5/700/420', category: 'lowfat', tag: '低脂', difficulty: '简单' },
  { id: 6, title: '牛油果吐司', desc: '健康脂肪 | 饱腹', cover: 'https://picsum.photos/seed/recipe6/700/420', category: '', tag: '早餐', difficulty: '简单' },
]

export const loadExtras = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export const saveExtraItem = (key, item) => {
  const arr = loadExtras(key)
  arr.unshift(item)
  localStorage.setItem(key, JSON.stringify(arr))
}

