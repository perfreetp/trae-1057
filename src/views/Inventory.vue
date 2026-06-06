<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">出入库管理</h2>
      <div>
        <el-button type="primary" @click="activeTab = 'material'; showMaterialForm = true">
          <el-icon><Plus /></el-icon>
          新增物资
        </el-button>
        <el-button type="success" @click="showInboundForm = true">
          <el-icon><Download /></el-icon>
          物资入库
        </el-button>
        <el-button type="warning" @click="showOutboundForm = true">
          <el-icon><Upload /></el-icon>
          出圃申请
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #409eff;">
          <div class="label">物资种类</div>
          <div class="value" style="color: #409eff;">{{ materialStats.totalTypes }}</div>
          <div class="unit">种</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">库存预警</div>
          <div class="value" style="color: #e6a23c;">{{ materialStats.warningCount }}</div>
          <div class="unit">项</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">待审核出圃</div>
          <div class="value" style="color: #67c23a;">{{ materialStats.pendingOutbound }}</div>
          <div class="unit">单</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mb-20">
      <el-tab-pane label="物资库存" name="material">
        <div class="card-section">
          <el-form :inline="true" :model="queryForm" class="query-form">
            <el-form-item label="类型">
              <el-select v-model="queryForm.type" placeholder="全部" clearable style="width: 150px">
                <el-option v-for="item in MATERIAL_TYPES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="名称">
              <el-input v-model="queryForm.keyword" placeholder="搜索物资名称" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadMaterials">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="card-section">
          <el-table :data="filteredMaterials" stripe border style="width: 100%">
            <el-table-column prop="materialNo" label="物资编号" width="120" />
            <el-table-column prop="name" label="物资名称" min-width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">{{ getMaterialTypeLabel(row.type) }}</template>
            </el-table-column>
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="stock" label="库存" width="100">
              <template #default="{ row }">
                <span :class="{ 'stock-warning': row.stock <= row.warningStock }">
                  {{ row.stock }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="warningStock" label="预警值" width="100" />
            <el-table-column prop="supplier" label="供应商" min-width="150" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.stock <= row.warningStock" type="danger">库存不足</el-tag>
                <el-tag v-else type="success">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button type="primary" link size="small">编辑</el-button>
                <el-button type="success" link size="small" @click="quickInbound(row)">入库</el-button>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="入库记录" name="inbound">
        <div class="card-section">
          <el-table :data="inboundRecords" stripe border style="width: 100%">
            <el-table-column prop="inboundNo" label="入库单号" width="180" />
            <el-table-column prop="materialName" label="物资名称" width="150" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="unitPrice" label="单价(元)" width="100" />
            <el-table-column prop="totalPrice" label="总价(元)" width="100" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column prop="inboundDate" label="入库日期" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="出圃申请" name="outbound">
        <div class="card-section">
          <el-table :data="outboundRequests" stripe border style="width: 100%">
            <el-table-column prop="requestNo" label="申请单号" width="180" />
            <el-table-column prop="applicant" label="申请人" width="120" />
            <el-table-column prop="applyDate" label="申请日期" width="120" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="100">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量(株)" width="120" />
            <el-table-column prop="purpose" label="用途" width="120" />
            <el-table-column prop="plotNo" label="造林地块" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status, REQUEST_STATUSES).type">
                  {{ getStatusTag(row.status, REQUEST_STATUSES).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" link size="small">详情</el-button>
                <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="auditRequest(row, 'approved')">通过</el-button>
                <el-button v-if="row.status === 'pending'" type="danger" link size="small" @click="auditRequest(row, 'rejected')">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showMaterialForm" title="新增物资" width="500px">
      <el-form :model="materialForm" label-width="100px">
        <el-form-item label="物资编号">
          <el-input v-model="materialForm.materialNo" disabled />
        </el-form-item>
        <el-form-item label="物资名称">
          <el-input v-model="materialForm.name" placeholder="请输入物资名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="materialForm.type" style="width: 100%">
            <el-option v-for="item in MATERIAL_TYPES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格">
              <el-input v-model="materialForm.specification" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="materialForm.unit" placeholder="如：袋、瓶、把" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存">
              <el-input-number v-model="materialForm.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预警值">
              <el-input-number v-model="materialForm.warningStock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="供应商">
          <el-input v-model="materialForm.supplier" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="materialForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMaterialForm = false">取消</el-button>
        <el-button type="primary" @click="saveMaterial">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showInboundForm" title="物资入库" width="500px">
      <el-form :model="inboundForm" label-width="100px">
        <el-form-item label="入库单号">
          <el-input v-model="inboundForm.inboundNo" disabled />
        </el-form-item>
        <el-form-item label="选择物资">
          <el-select v-model="inboundForm.materialId" placeholder="选择物资" style="width: 100%" @change="onMaterialChange">
            <el-option
              v-for="item in materials"
              :key="item.id"
              :label="`${item.name} (${item.specification})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库数量">
              <el-input-number v-model="inboundForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)">
              <el-input-number v-model="inboundForm.unitPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="入库日期">
          <el-date-picker v-model="inboundForm.inboundDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="inboundForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inboundForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInboundForm = false">取消</el-button>
        <el-button type="primary" @click="saveInbound">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showOutboundForm" title="出圃申请" width="600px">
      <el-form :model="outboundForm" label-width="100px">
        <el-form-item label="申请单号">
          <el-input v-model="outboundForm.requestNo" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请人">
              <el-input v-model="outboundForm.applicant" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请日期">
              <el-date-picker v-model="outboundForm.applyDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="树种">
              <el-select v-model="outboundForm.species" style="width: 100%">
                <el-option v-for="item in TREE_SPECIES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="龄级">
              <el-select v-model="outboundForm.ageClass" style="width: 100%">
                <el-option v-for="item in AGE_CLASSES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请数量(株)">
              <el-input-number v-model="outboundForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计出圃">
              <el-date-picker v-model="outboundForm.expectedDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用途">
          <el-select v-model="outboundForm.purpose" style="width: 100%">
            <el-option label="荒山造林" value="荒山造林" />
            <el-option label="迹地更新" value="迹地更新" />
            <el-option label="城市绿化" value="城市绿化" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="造林地块">
          <el-select v-model="outboundForm.plotNo" placeholder="选择造林地块" style="width: 100%">
            <el-option
              v-for="plot in plots"
              :key="plot.id"
              :label="`${plot.plotNo} (${plot.location})`"
              :value="plot.plotNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="outboundForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOutboundForm = false">取消</el-button>
        <el-button type="primary" @click="submitOutbound">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORES, getList, addItem, updateItem } from '@/utils/db'
import {
  TREE_SPECIES, AGE_CLASSES, MATERIAL_TYPES, REQUEST_STATUSES,
  getSpeciesLabel, getAgeClassLabel, getMaterialTypeLabel, getStatusTag,
  generateBatchNo, generateId
} from '@/utils/constants'
import dayjs from 'dayjs'

const activeTab = ref('material')
const materials = ref([])
const inboundRecords = ref([])
const outboundRequests = ref([])
const plots = ref([])

const showMaterialForm = ref(false)
const showInboundForm = ref(false)
const showOutboundForm = ref(false)

const queryForm = ref({
  type: '',
  keyword: ''
})

const filteredMaterials = computed(() => {
  return materials.value.filter(m => {
    const matchType = !queryForm.value.type || m.type === queryForm.value.type
    const matchKeyword = !queryForm.value.keyword || m.name.includes(queryForm.value.keyword)
    return matchType && matchKeyword
  })
})

const materialStats = computed(() => {
  return {
    totalTypes: materials.value.length,
    warningCount: materials.value.filter(m => m.stock <= m.warningStock).length,
    pendingOutbound: outboundRequests.value.filter(r => r.status === 'pending').length
  }
})

const materialForm = ref({
  materialNo: '',
  name: '',
  type: 'fertilizer',
  specification: '',
  unit: '',
  stock: 0,
  warningStock: 0,
  supplier: '',
  remark: ''
})

const inboundForm = ref({
  inboundNo: '',
  materialId: '',
  materialName: '',
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  supplier: '',
  inboundDate: '',
  operator: '',
  remark: ''
})

const outboundForm = ref({
  requestNo: '',
  applicant: '',
  applyDate: '',
  expectedDate: '',
  species: '',
  ageClass: '',
  quantity: 0,
  purpose: '',
  plotNo: '',
  status: 'pending',
  remark: ''
})

const loadData = async () => {
  materials.value = await getList(STORES.MATERIALS)
  inboundRecords.value = await getList(STORES.INBOUND_RECORDS)
  outboundRequests.value = await getList(STORES.OUTBOUND_REQUESTS)
  plots.value = await getList(STORES.PLOTS)
}

const loadMaterials = () => {
  loadData()
}

const resetQuery = () => {
  queryForm.value = { type: '', keyword: '' }
  loadData()
}

const onMaterialChange = (materialId) => {
  const material = materials.value.find(m => m.id === materialId)
  if (material) {
    inboundForm.value.materialName = material.name
    inboundForm.value.supplier = material.supplier
  }
}

const saveMaterial = async () => {
  const newMaterial = {
    ...materialForm.value,
    id: generateId()
  }
  await addItem(STORES.MATERIALS, newMaterial)
  ElMessage.success('物资添加成功')
  showMaterialForm.value = false
  loadData()
}

const saveInbound = async () => {
  const newRecord = {
    ...inboundForm.value,
    id: generateId(),
    totalPrice: inboundForm.value.quantity * inboundForm.value.unitPrice,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.INBOUND_RECORDS, newRecord)
  const material = materials.value.find(m => m.id === inboundForm.value.materialId)
  if (material) {
    await updateItem(STORES.MATERIALS, material.id, { stock: material.stock + inboundForm.value.quantity })
  }
  ElMessage.success('入库成功')
  showInboundForm.value = false
  loadData()
}

const submitOutbound = async () => {
  const newRequest = {
    ...outboundForm.value,
    id: generateId(),
    status: 'pending',
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.OUTBOUND_REQUESTS, newRequest)
  ElMessage.success('申请提交成功')
  showOutboundForm.value = false
  loadData()
}

const auditRequest = async (row, status) => {
  const action = status === 'approved' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(`确定${action}该申请吗？`, '审核确认', { type: 'warning' })
    await updateItem(STORES.OUTBOUND_REQUESTS, row.id, {
      status,
      auditor: '管理员',
      auditDate: dayjs().format('YYYY-MM-DD')
    })
    ElMessage.success(`审核${action}成功`)
    loadData()
  } catch (e) {}
}

const quickInbound = (row) => {
  showInboundForm.value = true
  inboundForm.value.materialId = row.id
  inboundForm.value.materialName = row.name
  inboundForm.value.supplier = row.supplier
}

onMounted(() => {
  loadData()
  materialForm.value.materialNo = generateBatchNo('WZ')
  inboundForm.value.inboundNo = generateBatchNo('RK')
  outboundForm.value.requestNo = generateBatchNo('CK')
  inboundForm.value.inboundDate = dayjs().format('YYYY-MM-DD')
  outboundForm.value.applyDate = dayjs().format('YYYY-MM-DD')
})
</script>

<style scoped>
.query-form {
  margin-bottom: 0;
}
.unit {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}
.stock-warning {
  color: #f56c6c;
  font-weight: 600;
}
</style>
