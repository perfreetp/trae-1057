import localforage from 'localforage'

const db = localforage.createInstance({
  name: 'ForestNurseryDB',
  version: 1.0,
  storeName: 'nursery_store',
  description: '国有林场苗圃管理系统数据库'
})

export const STORES = {
  SEED_BATCHES: 'seed_batches',
  SEEDLING_BEDS: 'seedling_beds',
  SOWING_RECORDS: 'sowing_records',
  TRANSPLANT_RECORDS: 'transplant_records',
  IRRIGATION_RECORDS: 'irrigation_records',
  FERTILIZATION_RECORDS: 'fertilization_records',
  DISEASE_RECORDS: 'disease_records',
  MATERIALS: 'materials',
  INVENTORY: 'inventory',
  INBOUND_RECORDS: 'inbound_records',
  OUTBOUND_REQUESTS: 'outbound_requests',
  ALLOCATION_ORDERS: 'allocation_orders',
  RECEIVE_RECORDS: 'receive_records',
  INVENTORY_CHECK: 'inventory_check',
  PLOTS: 'plots',
  REMINDERS: 'reminders',
  CERTIFICATES: 'certificates',
  ANNUAL_SUMMARY: 'annual_summary'
}

export async function getList(storeName) {
  const data = await db.getItem(storeName)
  return data || []
}

export async function saveList(storeName, list) {
  await db.setItem(storeName, list)
}

export async function addItem(storeName, item) {
  const list = await getList(storeName)
  list.push(item)
  await saveList(storeName, list)
  return item
}

export async function updateItem(storeName, id, updates) {
  const list = await getList(storeName)
  const index = list.findIndex(item => item.id === id)
  if (index !== -1) {
    list[index] = { ...list[index], ...updates }
    await saveList(storeName, list)
    return list[index]
  }
  return null
}

export async function deleteItem(storeName, id) {
  const list = await getList(storeName)
  const filtered = list.filter(item => item.id !== id)
  await saveList(storeName, filtered)
  return filtered
}

export async function getItemById(storeName, id) {
  const list = await getList(storeName)
  return list.find(item => item.id === id)
}

export default db
