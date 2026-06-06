<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">播种移栽</h2>
      <div>
        <el-button type="primary" @click="activeTab = 'sowing'; showSowingForm = true">
          <el-icon><Plus /></el-icon>
          新增播种
        </el-button>
        <el-button type="success" @click="activeTab = 'transplant'; showTransplantForm = true">
          <el-icon><Transfer /></el-icon>
          移栽记录
        </el-button>
        <el-button type="warning" @click="showScanDialog = true">
          <el-icon><Search /></el-icon>
          扫描标签
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="mb-20">
      <el-tab-pane label="播种记录" name="sowing">
        <div class="card-section">
          <el-table :data="sowingRecords" stripe border style="width: 100%">
            <el-table-column prop="sowingNo" label="播种编号" width="180" />
            <el-table-column prop="bedNo" label="苗床号" width="100" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="seedBatchNo" label="种子批次" width="180" />
            <el-table-column prop="sowingDate" label="播种日期" width="120" />
            <el-table-column prop="sowingAmount" label="播种量(kg)" width="120" />
            <el-table-column prop="sowingMethod" label="播种方式" width="100" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="success">已完成</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewSowingDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="移栽记录" name="transplant">
        <div class="card-section">
          <el-table :data="transplantRecords" stripe border style="width: 100%">
            <el-table-column prop="transplantNo" label="移栽编号" width="180" />
            <el-table-column prop="fromBedNo" label="来源苗床" width="120" />
            <el-table-column prop="toBedNo" label="目标苗床" width="120" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="移栽数量" width="120" />
            <el-table-column prop="transplantDate" label="移栽日期" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewTransplantDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showSowingForm" title="新增播种记录" width="600px">
      <el-form :model="sowingForm" label-width="100px">
        <el-form-item label="播种编号">
          <el-input v-model="sowingForm.sowingNo" disabled />
        </el-form-item>
        <el-form-item label="苗床">
          <el-select v-model="sowingForm.bedId" placeholder="选择苗床" style="width: 100%" @change="onBedChange">
            <el-option
              v-for="bed in emptyBeds"
              :key="bed.id"
              :label="`${bed.bedNo} (${bed.area}㎡)`"
              :value="bed.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="种子批次">
          <el-select v-model="sowingForm.seedBatchId" placeholder="选择种子批次" style="width: 100%" @change="onBatchChange">
            <el-option
              v-for="batch in seedBatches"
              :key="batch.id"
              :label="`${batch.batchNo} - ${getSpeciesLabel(batch.species)}`"
              :value="batch.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="播种日期">
              <el-date-picker v-model="sowingForm.sowingDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="播种量(kg)">
              <el-input-number v-model="sowingForm.sowingAmount" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="播种方式">
              <el-select v-model="sowingForm.sowingMethod" style="width: 100%">
                <el-option label="条播" value="条播" />
                <el-option label="撒播" value="撒播" />
                <el-option label="点播" value="点播" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人">
              <el-input v-model="sowingForm.operator" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行距(cm)">
              <el-input-number v-model="sowingForm.rowSpacing" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="覆土厚度(cm)">
              <el-input-number v-model="sowingForm.coveringSoil" :min="0" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="sowingForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSowingForm = false">取消</el-button>
        <el-button type="primary" @click="saveSowing">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTransplantForm" title="移栽记录" width="600px">
      <el-form :model="transplantForm" label-width="100px">
        <el-form-item label="移栽编号">
          <el-input v-model="transplantForm.transplantNo" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="来源苗床">
              <el-select v-model="transplantForm.fromBedId" placeholder="选择" style="width: 100%" @change="onFromBedChange">
                <el-option
                  v-for="bed in growingBeds"
                  :key="bed.id"
                  :label="`${bed.bedNo} - ${getSpeciesLabel(bed.species)}`"
                  :value="bed.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标苗床">
              <el-select v-model="transplantForm.toBedId" placeholder="选择" style="width: 100%">
                <el-option
                  v-for="bed in emptyBeds"
                  :key="bed.id"
                  :label="`${bed.bedNo} (${bed.area}㎡)`"
                  :value="bed.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="移栽数量">
              <el-input-number v-model="transplantForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="移栽日期">
              <el-date-picker v-model="transplantForm.transplantDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作人">
          <el-input v-model="transplantForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="transplantForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransplantForm = false">取消</el-button>
        <el-button type="primary" @click="saveTransplant">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showScanDialog" title="扫描标签查询" width="500px">
      <el-form label-width="80px">
        <el-form-item label="标签编号">
          <el-input v-model="scanCode" placeholder="输入或扫描标签编号">
            <template #append>
              <el-button @click="scanQuery">查询</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <div v-if="scanResult" class="scan-result">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="批次号">{{ scanResult.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="树种">{{ getSpeciesLabel(scanResult.species) }}</el-descriptions-item>
          <el-descriptions-item label="种子来源">{{ scanResult.seedSource }}</el-descriptions-item>
          <el-descriptions-item label="采集日期">{{ scanResult.collectDate }}</el-descriptions-item>
          <el-descriptions-item label="发芽率">{{ scanResult.germinationRate }}%</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { STORES, getList, addItem } from '@/utils/db'
import { getSpeciesLabel, generateBatchNo, generateId } from '@/utils/constants'
import dayjs from 'dayjs'

const activeTab = ref('sowing')
const sowingRecords = ref([])
const transplantRecords = ref([])
const seedBatches = ref([])
const beds = ref([])

const showSowingForm = ref(false)
const showTransplantForm = ref(false)
const showScanDialog = ref(false)
const scanCode = ref('')
const scanResult = ref(null)

const emptyBeds = computed(() => beds.value.filter(b => b.status === 'empty'))
const growingBeds = computed(() => beds.value.filter(b => b.status === 'growing' || b.status === 'sowing'))

const sowingForm = ref({
  sowingNo: '',
  bedId: '',
  bedNo: '',
  seedBatchId: '',
  seedBatchNo: '',
  species: '',
  sowingDate: '',
  sowingAmount: 0,
  sowingMethod: '条播',
  operator: '',
  rowSpacing: 20,
  coveringSoil: 2,
  remark: ''
})

const transplantForm = ref({
  transplantNo: '',
  fromBedId: '',
  fromBedNo: '',
  toBedId: '',
  toBedNo: '',
  species: '',
  quantity: 0,
  transplantDate: '',
  operator: '',
  remark: ''
})

const loadData = async () => {
  sowingRecords.value = await getList(STORES.SOWING_RECORDS)
  transplantRecords.value = await getList(STORES.TRANSPLANT_RECORDS)
  seedBatches.value = await getList(STORES.SEED_BATCHES)
  beds.value = await getList(STORES.SEEDLING_BEDS)
}

const onBedChange = (bedId) => {
  const bed = beds.value.find(b => b.id === bedId)
  if (bed) {
    sowingForm.value.bedNo = bed.bedNo
  }
}

const onBatchChange = (batchId) => {
  const batch = seedBatches.value.find(b => b.id === batchId)
  if (batch) {
    sowingForm.value.seedBatchNo = batch.batchNo
    sowingForm.value.species = batch.species
  }
}

const onFromBedChange = (bedId) => {
  const bed = beds.value.find(b => b.id === bedId)
  if (bed) {
    transplantForm.value.fromBedNo = bed.bedNo
    transplantForm.value.species = bed.species
  }
}

const saveSowing = async () => {
  const newRecord = {
    ...sowingForm.value,
    id: generateId(),
    status: 'completed',
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.SOWING_RECORDS, newRecord)
  ElMessage.success('播种记录添加成功')
  showSowingForm.value = false
  loadData()
}

const saveTransplant = async () => {
  const newRecord = {
    ...transplantForm.value,
    id: generateId(),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.TRANSPLANT_RECORDS, newRecord)
  ElMessage.success('移栽记录添加成功')
  showTransplantForm.value = false
  loadData()
}

const scanQuery = () => {
  const result = seedBatches.value.find(b => b.batchNo === scanCode.value)
  if (result) {
    scanResult.value = result
  } else {
    ElMessage.warning('未找到对应批次信息')
  }
}

const viewSowingDetail = (row) => {
  ElMessage.info('查看详情功能开发中')
}

const viewTransplantDetail = (row) => {
  ElMessage.info('查看详情功能开发中')
}

onMounted(() => {
  loadData()
  sowingForm.value.sowingNo = generateBatchNo('BZ')
  transplantForm.value.transplantNo = generateBatchNo('YZ')
  sowingForm.value.sowingDate = dayjs().format('YYYY-MM-DD')
  transplantForm.value.transplantDate = dayjs().format('YYYY-MM-DD')
})
</script>

<style scoped>
.scan-result {
  margin-top: 20px;
}
</style>
