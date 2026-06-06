<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">病害处理</h2>
      <div>
        <el-button type="primary" @click="showAddForm = true">
          <el-icon><Plus /></el-icon>
          新增病害记录
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #f56c6c;">
          <div class="label">病害总数</div>
          <div class="value" style="color: #f56c6c;">{{ stats.total }}</div>
          <div class="unit">起</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">治疗中</div>
          <div class="value" style="color: #e6a23c;">{{ stats.treating }}</div>
          <div class="unit">起</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">已恢复</div>
          <div class="value" style="color: #67c23a;">{{ stats.recovered }}</div>
          <div class="unit">起</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #909399;">
          <div class="label">损失苗木</div>
          <div class="value" style="color: #909399;">{{ stats.totalLoss }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
    </el-row>

    <div class="card-section">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="item in DISEASE_STATUSES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="树种">
          <el-select v-model="queryForm.species" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="item in TREE_SPECIES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card-section">
      <el-table :data="filteredRecords" stripe border style="width: 100%">
        <el-table-column prop="diseaseNo" label="病害编号" width="180" />
        <el-table-column prop="bedNo" label="苗床号" width="100" />
        <el-table-column prop="species" label="树种" width="100">
          <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
        </el-table-column>
        <el-table-column prop="diseaseName" label="病害名称" min-width="150" />
        <el-table-column prop="detectDate" label="发现日期" width="120" />
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.severity === '轻微'" type="success">轻微</el-tag>
            <el-tag v-else-if="row.severity === '中等'" type="warning">中等</el-tag>
            <el-tag v-else type="danger">严重</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="affectedCount" label="受害株数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status, DISEASE_STATUSES).type">
              {{ getStatusTag(row.status, DISEASE_STATUSES).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lossCount" label="损失株数" width="100" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button type="success" link v-if="row.status !== 'recovered' && row.status !== 'lost'" @click="updateStatus(row)">更新</el-button>
            <el-button type="danger" link @click="deleteRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="病害详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="病害编号">{{ currentRecord.diseaseNo }}</el-descriptions-item>
        <el-descriptions-item label="苗床号">{{ currentRecord.bedNo }}</el-descriptions-item>
        <el-descriptions-item label="树种">{{ getSpeciesLabel(currentRecord.species) }}</el-descriptions-item>
        <el-descriptions-item label="病害名称">{{ currentRecord.diseaseName }}</el-descriptions-item>
        <el-descriptions-item label="发现日期">{{ currentRecord.detectDate }}</el-descriptions-item>
        <el-descriptions-item label="严重程度">{{ currentRecord.severity }}</el-descriptions-item>
        <el-descriptions-item label="受害面积(%)">{{ currentRecord.affectedArea }}</el-descriptions-item>
        <el-descriptions-item label="受害株数">{{ currentRecord.affectedCount }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusTag(currentRecord.status, DISEASE_STATUSES).type">
            {{ getStatusTag(currentRecord.status, DISEASE_STATUSES).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="症状" :span="2">{{ currentRecord.symptoms }}</el-descriptions-item>
        <el-descriptions-item label="防治措施" :span="2">{{ currentRecord.treatment }}</el-descriptions-item>
        <el-descriptions-item label="防治日期">{{ currentRecord.treatmentDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="损失株数">{{ currentRecord.lossCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentRecord.operator }}</el-descriptions-item>
        <el-descriptions-item label="记录时间">{{ currentRecord.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showAddForm" :title="isEdit ? '更新病害' : '新增病害记录'" width="600px">
      <el-form :model="diseaseForm" label-width="100px">
        <el-form-item label="病害编号" v-if="!isEdit">
          <el-input v-model="diseaseForm.diseaseNo" disabled />
        </el-form-item>
        <el-form-item label="苗床">
          <el-select v-model="diseaseForm.bedId" placeholder="选择苗床" style="width: 100%" @change="onBedChange">
            <el-option
              v-for="bed in beds"
              :key="bed.id"
              :label="`${bed.bedNo} - ${getSpeciesLabel(bed.species)}`"
              :value="bed.id"
              :disabled="!bed.species"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="病害名称">
          <el-input v-model="diseaseForm.diseaseName" placeholder="如：猝倒病、立枯病等" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发现日期">
              <el-date-picker v-model="diseaseForm.detectDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="严重程度">
              <el-select v-model="diseaseForm.severity" style="width: 100%">
                <el-option label="轻微" value="轻微" />
                <el-option label="中等" value="中等" />
                <el-option label="严重" value="严重" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="受害面积(%)">
              <el-input-number v-model="diseaseForm.affectedArea" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="受害株数">
              <el-input-number v-model="diseaseForm.affectedCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="症状描述">
          <el-input v-model="diseaseForm.symptoms" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="防治措施">
          <el-input v-model="diseaseForm.treatment" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="20" v-if="isEdit">
          <el-col :span="12">
            <el-form-item label="当前状态">
              <el-select v-model="diseaseForm.status" style="width: 100%">
                <el-option v-for="item in DISEASE_STATUSES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="损失株数">
              <el-input-number v-model="diseaseForm.lossCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作人">
          <el-input v-model="diseaseForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="diseaseForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddForm = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORES, getList, addItem, updateItem, deleteItem } from '@/utils/db'
import { TREE_SPECIES, DISEASE_STATUSES, getSpeciesLabel, getStatusTag, generateBatchNo, generateId } from '@/utils/constants'
import dayjs from 'dayjs'

const diseaseRecords = ref([])
const beds = ref([])
const detailVisible = ref(false)
const showAddForm = ref(false)
const isEdit = ref(false)
const currentRecord = ref(null)

const queryForm = ref({
  status: '',
  species: ''
})

const filteredRecords = computed(() => {
  return diseaseRecords.value.filter(r => {
    const matchStatus = !queryForm.value.status || r.status === queryForm.value.status
    const matchSpecies = !queryForm.value.species || r.species === queryForm.value.species
    return matchStatus && matchSpecies
  })
})

const stats = computed(() => {
  return {
    total: diseaseRecords.value.length,
    treating: diseaseRecords.value.filter(r => r.status === 'treating').length,
    recovered: diseaseRecords.value.filter(r => r.status === 'recovered').length,
    totalLoss: diseaseRecords.value.reduce((sum, r) => sum + (r.lossCount || 0), 0)
  }
})

const diseaseForm = ref({
  diseaseNo: '',
  bedId: '',
  bedNo: '',
  species: '',
  diseaseName: '',
  detectDate: '',
  severity: '中等',
  affectedArea: 0,
  affectedCount: 0,
  symptoms: '',
  treatment: '',
  treatmentDate: '',
  status: 'detected',
  lossCount: 0,
  operator: '',
  remark: ''
})

const loadData = async () => {
  diseaseRecords.value = await getList(STORES.DISEASE_RECORDS)
  beds.value = await getList(STORES.SEEDLING_BEDS)
}

const resetQuery = () => {
  queryForm.value = { status: '', species: '' }
  loadData()
}

const onBedChange = (bedId) => {
  const bed = beds.value.find(b => b.id === bedId)
  if (bed) {
    diseaseForm.value.bedNo = bed.bedNo
    diseaseForm.value.species = bed.species
  }
}

const viewDetail = (row) => {
  currentRecord.value = row
  detailVisible.value = true
}

const updateStatus = (row) => {
  isEdit.value = true
  diseaseForm.value = { ...row, treatmentDate: dayjs().format('YYYY-MM-DD') }
  showAddForm.value = true
}

const saveRecord = async () => {
  if (isEdit.value) {
    await updateItem(STORES.DISEASE_RECORDS, diseaseForm.value.id, diseaseForm.value)
    ElMessage.success('更新成功')
  } else {
    const newRecord = {
      ...diseaseForm.value,
      id: generateId(),
      treatmentDate: dayjs().format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    await addItem(STORES.DISEASE_RECORDS, newRecord)
    ElMessage.success('添加成功')
  }
  showAddForm.value = false
  loadData()
}

const deleteRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
    await deleteItem(STORES.DISEASE_RECORDS, row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {}
}

onMounted(() => {
  loadData()
  diseaseForm.value.diseaseNo = generateBatchNo('BH')
  diseaseForm.value.detectDate = dayjs().format('YYYY-MM-DD')
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
</style>
