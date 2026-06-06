import { STORES, saveList, getList } from './db'
import { generateId, generateBatchNo } from './constants'

export async function initMockData() {
  const seedBatches = await getList(STORES.SEED_BATCHES)
  if (seedBatches.length > 0) return

  const seedBatchData = [
    {
      id: generateId(),
      batchNo: generateBatchNo('ZZ'),
      species: 'pine',
      seedSource: '东北林区种子园',
      collectDate: '2025-10-15',
      weight: 50,
      germinationRate: 85,
      purity: 96,
      moisture: 12,
      status: 'active',
      createTime: '2025-10-20 09:00:00',
      remark: '优质油松种子'
    },
    {
      id: generateId(),
      batchNo: generateBatchNo('ZZ'),
      species: 'fir',
      seedSource: '福建杉木种子基地',
      collectDate: '2025-11-01',
      weight: 30,
      germinationRate: 82,
      purity: 95,
      moisture: 11,
      status: 'active',
      createTime: '2025-11-05 14:30:00',
      remark: '杉木二代种子'
    },
    {
      id: generateId(),
      batchNo: generateBatchNo('ZZ'),
      species: 'oak',
      seedSource: '本地林区采集',
      collectDate: '2025-09-20',
      weight: 25,
      germinationRate: 78,
      purity: 92,
      moisture: 13,
      status: 'active',
      createTime: '2025-09-25 10:15:00',
      remark: '辽东栎种子'
    }
  ]
  await saveList(STORES.SEED_BATCHES, seedBatchData)

  const bedData = [
    {
      id: generateId(),
      bedNo: 'A01',
      area: 50,
      rowCount: 10,
      status: 'growing',
      species: 'pine',
      ageClass: '1y',
      seedlingCount: 5000,
      avgHeight: 15,
      avgDiameter: 0.3,
      batchId: seedBatchData[0].id,
      sowingDate: '2026-03-15',
      lastIrrigation: '2026-06-05',
      lastFertilization: '2026-05-20',
      remark: '油松育苗区A区'
    },
    {
      id: generateId(),
      bedNo: 'A02',
      area: 50,
      rowCount: 10,
      status: 'growing',
      species: 'fir',
      ageClass: '1y',
      seedlingCount: 6000,
      avgHeight: 12,
      avgDiameter: 0.25,
      batchId: seedBatchData[1].id,
      sowingDate: '2026-03-20',
      lastIrrigation: '2026-06-05',
      lastFertilization: '2026-05-25',
      remark: '杉木育苗区'
    },
    {
      id: generateId(),
      bedNo: 'B01',
      area: 45,
      rowCount: 9,
      status: 'ready',
      species: 'pine',
      ageClass: '2y',
      seedlingCount: 4500,
      avgHeight: 45,
      avgDiameter: 0.8,
      batchId: seedBatchData[0].id,
      sowingDate: '2025-04-10',
      lastIrrigation: '2026-06-04',
      lastFertilization: '2026-05-15',
      remark: '可出圃油松大苗'
    },
    {
      id: generateId(),
      bedNo: 'B02',
      area: 45,
      rowCount: 9,
      status: 'sowing',
      species: 'oak',
      ageClass: '1y',
      seedlingCount: 3000,
      avgHeight: 8,
      avgDiameter: 0.2,
      batchId: seedBatchData[2].id,
      sowingDate: '2026-04-01',
      lastIrrigation: '2026-06-05',
      lastFertilization: null,
      remark: '栎树播种区'
    },
    {
      id: generateId(),
      bedNo: 'C01',
      area: 60,
      rowCount: 12,
      status: 'empty',
      species: null,
      ageClass: null,
      seedlingCount: 0,
      avgHeight: 0,
      avgDiameter: 0,
      batchId: null,
      sowingDate: null,
      lastIrrigation: null,
      lastFertilization: null,
      remark: '待整地'
    },
    {
      id: generateId(),
      bedNo: 'C02',
      area: 60,
      rowCount: 12,
      status: 'maintenance',
      species: null,
      ageClass: null,
      seedlingCount: 0,
      avgHeight: 0,
      avgDiameter: 0,
      batchId: null,
      sowingDate: null,
      lastIrrigation: null,
      lastFertilization: null,
      remark: '土壤消毒中'
    }
  ]
  await saveList(STORES.SEEDLING_BEDS, bedData)

  const materialData = [
    {
      id: generateId(),
      materialNo: 'FL001',
      name: '复合肥',
      type: 'fertilizer',
      specification: '50kg/袋',
      unit: '袋',
      stock: 45,
      warningStock: 10,
      supplier: '农业生产资料公司',
      remark: 'NPK 15-15-15'
    },
    {
      id: generateId(),
      materialNo: 'FL002',
      name: '尿素',
      type: 'fertilizer',
      specification: '40kg/袋',
      unit: '袋',
      stock: 8,
      warningStock: 5,
      supplier: '农业生产资料公司',
      remark: '氮含量46%'
    },
    {
      id: generateId(),
      materialNo: 'NY001',
      name: '多菌灵',
      type: 'pesticide',
      specification: '500g/瓶',
      unit: '瓶',
      stock: 30,
      warningStock: 10,
      supplier: '农资批发部',
      remark: '广谱杀菌剂'
    },
    {
      id: generateId(),
      materialNo: 'NY002',
      name: '氧化乐果',
      type: 'pesticide',
      specification: '300ml/瓶',
      unit: '瓶',
      stock: 3,
      warningStock: 5,
      supplier: '农资批发部',
      remark: '杀虫剂'
    },
    {
      id: generateId(),
      materialNo: 'GJ001',
      name: '锄头',
      type: 'tool',
      specification: '标准型',
      unit: '把',
      stock: 15,
      warningStock: 5,
      supplier: '五金工具店',
      remark: ''
    },
    {
      id: generateId(),
      materialNo: 'GJ002',
      name: '喷壶',
      type: 'tool',
      specification: '16L',
      unit: '个',
      stock: 8,
      warningStock: 3,
      supplier: '五金工具店',
      remark: '背负式'
    }
  ]
  await saveList(STORES.MATERIALS, materialData)

  const sowingData = [
    {
      id: generateId(),
      sowingNo: generateBatchNo('BZ'),
      bedId: bedData[0].id,
      bedNo: 'A01',
      seedBatchId: seedBatchData[0].id,
      seedBatchNo: seedBatchData[0].batchNo,
      species: 'pine',
      sowingDate: '2026-03-15',
      sowingAmount: 5,
      sowingMethod: '条播',
      operator: '张三',
      rowSpacing: 20,
      coveringSoil: 2,
      status: 'completed',
      createTime: '2026-03-15 10:00:00',
      remark: '春播'
    },
    {
      id: generateId(),
      sowingNo: generateBatchNo('BZ'),
      bedId: bedData[1].id,
      bedNo: 'A02',
      seedBatchId: seedBatchData[1].id,
      seedBatchNo: seedBatchData[1].batchNo,
      species: 'fir',
      sowingDate: '2026-03-20',
      sowingAmount: 4,
      sowingMethod: '撒播',
      operator: '李四',
      rowSpacing: 0,
      coveringSoil: 1.5,
      status: 'completed',
      createTime: '2026-03-20 14:00:00',
      remark: '杉木春播'
    }
  ]
  await saveList(STORES.SOWING_RECORDS, sowingData)

  const irrigationData = [
    {
      id: generateId(),
      recordNo: generateBatchNo('GG'),
      bedIds: [bedData[0].id, bedData[1].id],
      bedNos: ['A01', 'A02'],
      irrigationDate: '2026-06-05',
      irrigationMethod: '喷灌',
      duration: 120,
      waterVolume: 15,
      operator: '王五',
      createTime: '2026-06-05 16:00:00',
      remark: '夏季高温补水'
    },
    {
      id: generateId(),
      recordNo: generateBatchNo('GG'),
      bedIds: [bedData[2].id, bedData[3].id],
      bedNos: ['B01', 'B02'],
      irrigationDate: '2026-06-04',
      irrigationMethod: '漫灌',
      duration: 180,
      waterVolume: 25,
      operator: '赵六',
      createTime: '2026-06-04 15:30:00',
      remark: ''
    }
  ]
  await saveList(STORES.IRRIGATION_RECORDS, irrigationData)

  const fertilizationData = [
    {
      id: generateId(),
      recordNo: generateBatchNo('SF'),
      bedIds: [bedData[0].id],
      bedNos: ['A01'],
      fertilizationDate: '2026-05-20',
      fertilizerType: '复合肥',
      fertilizerAmount: 10,
      fertilizationMethod: '沟施',
      operator: '张三',
      createTime: '2026-05-20 09:00:00',
      remark: '第一次追肥'
    }
  ]
  await saveList(STORES.FERTILIZATION_RECORDS, fertilizationData)

  const diseaseData = [
    {
      id: generateId(),
      diseaseNo: generateBatchNo('BH'),
      bedId: bedData[1].id,
      bedNo: 'A02',
      species: 'fir',
      diseaseName: '猝倒病',
      detectDate: '2026-04-15',
      severity: '中等',
      affectedArea: 10,
      affectedCount: 500,
      symptoms: '幼苗茎基部水渍状，后变褐缢缩，幼苗倒伏',
      treatment: '喷施多菌灵800倍液，加强通风',
      treatmentDate: '2026-04-16',
      status: 'recovered',
      lossCount: 200,
      operator: '李四',
      createTime: '2026-04-15 11:00:00',
      remark: '已恢复正常'
    }
  ]
  await saveList(STORES.DISEASE_RECORDS, diseaseData)

  const outboundRequests = [
    {
      id: generateId(),
      requestNo: generateBatchNo('CK'),
      applicant: '造林队王队长',
      applyDate: '2026-06-01',
      expectedDate: '2026-06-10',
      species: 'pine',
      ageClass: '2y',
      quantity: 2000,
      purpose: '荒山造林',
      plotNo: '东区3号地块',
      status: 'approved',
      auditor: '张主任',
      auditDate: '2026-06-02',
      auditRemark: '同意出圃',
      createTime: '2026-06-01 09:30:00',
      remark: '用于东区荒山绿化'
    }
  ]
  await saveList(STORES.OUTBOUND_REQUESTS, outboundRequests)

  const reminderData = [
    {
      id: generateId(),
      title: 'A01苗床需要灌溉',
      type: 'irrigation',
      content: 'A01油松苗床距上次灌溉已超过3天，建议灌溉',
      relatedId: bedData[0].id,
      remindTime: '2026-06-08 09:00:00',
      status: 'pending',
      priority: 'high'
    },
    {
      id: generateId(),
      title: '氧化乐果库存不足',
      type: 'inventory',
      content: '氧化乐果库存仅剩3瓶，低于预警值5瓶',
      relatedId: materialData[3].id,
      remindTime: '2026-06-06 10:00:00',
      status: 'pending',
      priority: 'medium'
    }
  ]
  await saveList(STORES.REMINDERS, reminderData)

  const plotData = [
    {
      id: generateId(),
      plotNo: '东区1号',
      area: 500,
      location: '东沟',
      altitude: 800,
      slope: '缓坡',
      soilType: '棕壤',
      status: 'planted',
      treeSpecies: 'pine',
      plantingYear: 2024,
      plantCount: 5000,
      survivalRate: 92,
      manager: '张三',
      remark: ''
    },
    {
      id: generateId(),
      plotNo: '东区2号',
      area: 400,
      location: '东沟',
      altitude: 850,
      slope: '斜坡',
      soilType: '棕壤',
      status: 'planted',
      treeSpecies: 'fir',
      plantingYear: 2024,
      plantCount: 4000,
      survivalRate: 88,
      manager: '李四',
      remark: ''
    },
    {
      id: generateId(),
      plotNo: '东区3号',
      area: 300,
      location: '东沟',
      altitude: 900,
      slope: '陡坡',
      soilType: '褐土',
      status: 'preparing',
      treeSpecies: null,
      plantingYear: null,
      plantCount: 0,
      survivalRate: 0,
      manager: '王五',
      remark: '待种植'
    }
  ]
  await saveList(STORES.PLOTS, plotData)
}
