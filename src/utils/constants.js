import { v4 as uuidv4 } from 'uuid'
import { STORES, addItem, getList } from './db'

export function generateId() {
  return uuidv4().replace(/-/g, '').substring(0, 16)
}

export function generateBatchNo(prefix = 'PC') {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${year}${month}${day}${random}`
}

export const TREE_SPECIES = [
  { value: 'pine', label: '松树' },
  { value: 'fir', label: '杉木' },
  { value: 'cypress', label: '柏树' },
  { value: 'oak', label: '栎树' },
  { value: 'maple', label: '枫树' },
  { value: 'poplar', label: '杨树' },
  { value: 'birch', label: '白桦' },
  { value: 'camphor', label: '香樟' },
  { value: 'nanmu', label: '楠木' },
  { value: 'other', label: '其他' }
]

export const AGE_CLASSES = [
  { value: '1y', label: '1年生' },
  { value: '2y', label: '2年生' },
  { value: '3y', label: '3年生' },
  { value: '4y', label: '4年生' },
  { value: '5y', label: '5年生以上' }
]

export const BED_STATUSES = [
  { value: 'empty', label: '空置', type: 'info' },
  { value: 'sowing', label: '播种期', type: 'primary' },
  { value: 'growing', label: '生长期', type: 'success' },
  { value: 'ready', label: '可出圃', type: 'warning' },
  { value: 'maintenance', label: '养护中', type: 'danger' }
]

export const MATERIAL_TYPES = [
  { value: 'fertilizer', label: '肥料' },
  { value: 'pesticide', label: '农药' },
  { value: 'tool', label: '工具' },
  { value: 'other', label: '其他' }
]

export const REQUEST_STATUSES = [
  { value: 'pending', label: '待审核', type: 'warning' },
  { value: 'approved', label: '已通过', type: 'success' },
  { value: 'rejected', label: '已驳回', type: 'danger' },
  { value: 'completed', label: '已完成', type: 'info' }
]

export const DISEASE_STATUSES = [
  { value: 'detected', label: '已发现', type: 'warning' },
  { value: 'treating', label: '治疗中', type: 'primary' },
  { value: 'recovered', label: '已恢复', type: 'success' },
  { value: 'lost', label: '已损失', type: 'danger' }
]

export const getStatusTag = (status, statusList) => {
  const item = statusList.find(s => s.value === status)
  return item || { label: status, type: 'info' }
}

export const getSpeciesLabel = (value) => {
  const item = TREE_SPECIES.find(s => s.value === value)
  return item ? item.label : value
}

export const getAgeClassLabel = (value) => {
  const item = AGE_CLASSES.find(a => a.value === value)
  return item ? item.label : value
}

export const getMaterialTypeLabel = (value) => {
  const item = MATERIAL_TYPES.find(t => t.value === value)
  return item ? item.label : value
}
