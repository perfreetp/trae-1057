<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">调拨领用</h2>
      <div>
        <el-button type="primary" @click="showAllocationForm = true">
          <el-icon><Plus /></el-icon>
          新建调拨单
        </el-button>
        <el-button type="success" @click="showReceiveForm = true">
          <el-icon><Tickets /></el-icon>
          领用登记
        </el-button>
        <el-button type="warning" @click="printTransportList">
          <el-icon><Printer /></el-icon>
          运输清单
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #409eff;">
          <div class="label">本月调拨单</div>
          <div class="value" style="color: #409eff;">{{ stats.allocationCount }}</div>
          <div class="unit">单</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">调拨苗木总数</div>
          <div class="value" style="color: #67c23a;">{{ stats.totalSeedlings }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">本月领用物资</div>
          <div class="value" style="color: #e6a23c;">{{ stats.receiveCount }}</div>
          <div class="unit">次</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mb-20">
      <el-tab-pane label="调拨管理" name="allocation">
        <div class="card-section">
          <el-table :data="allocationOrders" stripe border style="width: 100%">
            <el-table-column prop="allocationNo" label="调拨单号" width="180" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="100">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量(株)" width="120" />
            <el-table-column prop="fromLocation" label="调出地点" width="150" />
            <el-table-column prop="toPlot" label="调入地块" width="150" />
            <el-table-column prop="allocationDate" label="调拨日期" width="120" />
            <el-table-column prop="transporter" label="运输负责人" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'pending'" type="warning">待运输</el-tag>
                <el-tag v-else-if="row.status === 'transporting'" type="primary">运输中</el-tag>
                <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
                <el-tag v-else type="danger">异常</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lossCount" label="损耗(株)" width="100" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewAllocationDetail(row)">详情</el-button>
                <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="startTransport(row)">发运</el-button>
                <el-button v-if="row.status === 'transporting'" type="warning" link size="small" @click="completeAllocation(row)">完成</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="领用记录" name="receive">
        <div class="card-section">
          <el-table :data="receiveRecords" stripe border style="width: 100%">
            <el-table-column prop="receiveNo" label="领用单号" width="180" />
            <el-table-column prop="receiver" label="领用人" width="120" />
            <el-table-column prop="materialName" label="物资名称" width="150" />
            <el-table-column prop="materialType" label="类型" width="100">
              <template #default="{ row }">{{ getMaterialTypeLabel(row.materialType) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="purpose" label="用途" width="150" />
            <el-table-column prop="receiveDate" label="领用日期" width="120" />
            <el-table-column prop="operator" label="发放人" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link size="small">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="造林地块" name="plots">
        <div class="card-section">
          <div class="flex-between mb-20">
            <div class="section-title" style="margin-bottom: 0;">造林地块管理</div>
            <el-button type="primary" size="small" @click="showPlotForm = true">
              <el-icon><Plus /></el-icon>
              新增地块
            </el-button>
          </div>
          <el-table :data="plots" stripe border style="width: 100%">
            <el-table-column prop="plotNo" label="地块编号" width="120" />
            <el-table-column prop="location" label="位置" width="150" />
            <el-table-column prop="area" label="面积(亩)" width="100" />
            <el-table-column prop="altitude" label="海拔(m)" width="100" />
            <el-table-column prop="slope" label="坡度" width="100" />
            <el-table-column prop="soilType" label="土壤类型" width="100" />
            <el-table-column prop="treeSpecies" label="造林树种" width="100">
              <template #default="{ row }">
                {{ row.treeSpecies ? getSpeciesLabel(row.treeSpecies) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="plantingYear" label="造林年份" width="100" />
            <el-table-column prop="plantCount" label="造林株数" width="100" />
            <el-table-column prop="survivalRate" label="成活率(%)" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'planted'" type="success">已造林</el-tag>
                <el-tag v-else-if="row.status === 'preparing'" type="warning">待造林</el-tag>
                <el-tag v-else type="info">其他</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="manager" label="负责人" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link size="small">编辑</el-button>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="损耗追踪" name="loss">
        <div class="card-section">
          <el-table :data="lossRecords" stripe border style="width: 100%">
            <el-table-column prop="lossNo" label="记录编号" width="180" />
            <el-table-column prop="allocationNo" label="关联调拨单" width="180" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="lossCount" label="损耗数量" width="120" />
            <el-table-column prop="lossReason" label="损耗原因" min-width="200" />
            <el-table-column prop="recordDate" label="记录日期" width="120" />
            <el-table-column prop="handler" label="处理人" width="100" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showAllocationForm" title="新建调拨单" width="600px">
      <el-form :model="allocationForm" label-width="100px">
        <el-form-item label="调拨单号">
          <el-input v-model="allocationForm.allocationNo" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="树种">
              <el-select v-model="allocationForm.species" style="width: 100%">
                <el-option v-for="item in TREE_SPECIES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="龄级">
              <el-select v-model="allocationForm.ageClass" style="width: 100%">
                <el-option v-for="item in AGE_CLASSES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="调拨数量(株)">
          <el-input-number v-model="allocationForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="调出地点">
              <el-input v-model="allocationForm.fromLocation" placeholder="如：中心苗圃" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调入地块">
              <el-select v-model="allocationForm.toPlot" style="width: 100%">
                <el-option
                  v-for="plot in plots"
                  :key="plot.id"
                  :label="`${plot.plotNo} (${plot.location})`"
                  :value="plot.plotNo"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="调拨日期">
              <el-date-picker v-model="allocationForm.allocationDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输负责人">
              <el-input v-model="allocationForm.transporter" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="allocationForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAllocationForm = false">取消</el-button>
        <el-button type="primary" @click="saveAllocation">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showReceiveForm" title="领用登记" width="500px">
      <el-form :model="receiveForm" label-width="100px">
        <el-form-item label="领用单号">
          <el-input v-model="receiveForm.receiveNo" disabled />
        </el-form-item>
        <el-form-item label="领用人">
          <el-input v-model="receiveForm.receiver" />
        </el-form-item>
        <el-form-item label="选择物资">
          <el-select v-model="receiveForm.materialId" style="width: 100%" @change="onReceiveMaterialChange">
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
            <el-form-item label="数量">
              <el-input-number v-model="receiveForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="领用日期">
              <el-date-picker v-model="receiveForm.receiveDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用途">
          <el-input v-model="receiveForm.purpose" placeholder="如：苗木施肥、病虫害防治等" />
        </el-form-item>
        <el-form-item label="发放人">
          <el-input v-model="receiveForm.operator" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReceiveForm = false">取消</el-button>
        <el-button type="primary" @click="saveReceive">登记</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPlotForm" title="新增造林地块" width="600px">
      <el-form :model="plotForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地块编号">
              <el-input v-model="plotForm.plotNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置">
              <el-input v-model="plotForm.location" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="面积(亩)">
              <el-input-number v-model="plotForm.area" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="海拔(m)">
              <el-input-number v-model="plotForm.altitude" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="坡度">
              <el-select v-model="plotForm.slope" style="width: 100%">
                <el-option label="平地" value="平地" />
                <el-option label="缓坡" value="缓坡" />
                <el-option label="斜坡" value="斜坡" />
                <el-option label="陡坡" value="陡坡" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="土壤类型">
          <el-input v-model="plotForm.soilType" placeholder="如：棕壤、褐土、黄壤等" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="plotForm.manager" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="plotForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPlotForm = false">取消</el-button>
        <el-button type="primary" @click="savePlot">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="completeVisible" title="完成调拨" width="500px">
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="实际到达数量">
          <el-input-number v-model="completeForm.arrivedCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="损耗数量">
          <el-input-number v-model="completeForm.lossCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="损耗原因">
          <el-select v-model="completeForm.lossReason" style="width: 100%">
            <el-option label="机械损伤" value="机械损伤" />
            <el-option label="高温脱水" value="高温脱水" />
            <el-option label="病虫害" value="病虫害" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="completeForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmComplete">确认完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { STORES, getList, addItem, updateItem } from '@/utils/db'
import {
  TREE_SPECIES, AGE_CLASSES, MATERIAL_TYPES,
  getSpeciesLabel, getAgeClassLabel, getMaterialTypeLabel,
  generateBatchNo, generateId
} from '@/utils/constants'
import dayjs from 'dayjs'

const activeTab = ref('allocation')
const allocationOrders = ref([])
const receiveRecords = ref([])
const plots = ref([])
const materials = ref([])
const lossRecords = ref([])

const showAllocationForm = ref(false)
const showReceiveForm = ref(false)
const showPlotForm = ref(false)
const completeVisible = ref(false)
const currentAllocation = ref(null)

const stats = computed(() => {
  const now = dayjs()
  const monthStart = now.startOf('month')
  return {
    allocationCount: allocationOrders.value.filter(a =>
      dayjs(a.allocationDate).isAfter(monthStart)
    ).length,
    totalSeedlings: allocationOrders.value.reduce((sum, a) => sum + a.quantity, 0),
    receiveCount: receiveRecords.value.filter(r =>
      dayjs(r.receiveDate).isAfter(monthStart)
    ).length
  }
})

const allocationForm = ref({
  allocationNo: '',
  species: '',
  ageClass: '',
  quantity: 0,
  fromLocation: '中心苗圃',
  toPlot: '',
  allocationDate: '',
  transporter: '',
  status: 'pending',
  lossCount: 0,
  remark: ''
})

const receiveForm = ref({
  receiveNo: '',
  receiver: '',
  materialId: '',
  materialName: '',
  materialType: '',
  quantity: 0,
  unit: '',
  purpose: '',
  receiveDate: '',
  operator: ''
})

const plotForm = ref({
  plotNo: '',
  area: 0,
  location: '',
  altitude: 0,
  slope: '缓坡',
  soilType: '',
  status: 'preparing',
  treeSpecies: null,
  plantingYear: null,
  plantCount: 0,
  survivalRate: 0,
  manager: '',
  remark: ''
})

const completeForm = ref({
  arrivedCount: 0,
  lossCount: 0,
  lossReason: '',
  remark: ''
})

const loadData = async () => {
  allocationOrders.value = await getList(STORES.ALLOCATION_ORDERS)
  receiveRecords.value = await getList(STORES.RECEIVE_RECORDS)
  plots.value = await getList(STORES.PLOTS)
  materials.value = await getList(STORES.MATERIALS)
  lossRecords.value = []
}

const onReceiveMaterialChange = (materialId) => {
  const material = materials.value.find(m => m.id === materialId)
  if (material) {
    receiveForm.value.materialName = material.name
    receiveForm.value.materialType = material.type
    receiveForm.value.unit = material.unit
  }
}

const saveAllocation = async () => {
  const newOrder = {
    ...allocationForm.value,
    id: generateId(),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.ALLOCATION_ORDERS, newOrder)
  ElMessage.success('调拨单创建成功')
  showAllocationForm.value = false
  loadData()
}

const saveReceive = async () => {
  const newRecord = {
    ...receiveForm.value,
    id: generateId(),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.RECEIVE_RECORDS, newRecord)
  const material = materials.value.find(m => m.id === receiveForm.value.materialId)
  if (material) {
    await updateItem(STORES.MATERIALS, material.id, { stock: Math.max(0, material.stock - receiveForm.value.quantity) })
  }
  ElMessage.success('领用登记成功')
  showReceiveForm.value = false
  loadData()
}

const savePlot = async () => {
  const newPlot = {
    ...plotForm.value,
    id: generateId()
  }
  await addItem(STORES.PLOTS, newPlot)
  ElMessage.success('地块添加成功')
  showPlotForm.value = false
  loadData()
}

const viewAllocationDetail = (row) => {
  ElMessage.info('查看详情功能开发中')
}

const startTransport = async (row) => {
  await updateItem(STORES.ALLOCATION_ORDERS, row.id, { status: 'transporting' })
  ElMessage.success('已开始运输')
  loadData()
}

const completeAllocation = (row) => {
  currentAllocation.value = row
  completeForm.value = {
    arrivedCount: row.quantity,
    lossCount: 0,
    lossReason: '',
    remark: ''
  }
  completeVisible.value = true
}

const confirmComplete = async () => {
  if (currentAllocation.value) {
    await updateItem(STORES.ALLOCATION_ORDERS, currentAllocation.value.id, {
      status: 'completed',
      lossCount: completeForm.value.lossCount
    })
    if (completeForm.value.lossCount > 0) {
      const lossRecord = {
        id: generateId(),
        lossNo: generateBatchNo('SH'),
        allocationNo: currentAllocation.value.allocationNo,
        species: currentAllocation.value.species,
        lossCount: completeForm.value.lossCount,
        lossReason: completeForm.value.lossReason,
        recordDate: dayjs().format('YYYY-MM-DD'),
        handler: '管理员'
      }
      lossRecords.value.push(lossRecord)
    }
    ElMessage.success('调拨完成')
    completeVisible.value = false
    loadData()
  }
}

const printTransportList = () => {
  ElMessage.success('运输清单打印功能开发中')
}

onMounted(() => {
  loadData()
  allocationForm.value.allocationNo = generateBatchNo('DB')
  receiveForm.value.receiveNo = generateBatchNo('LY')
  allocationForm.value.allocationDate = dayjs().format('YYYY-MM-DD')
  receiveForm.value.receiveDate = dayjs().format('YYYY-MM-DD')
})
</script>

<style scoped>
.unit {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}
</style>
