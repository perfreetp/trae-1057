<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">批次档案</h2>
      <div>
        <el-button type="primary" @click="showAdd">
          <el-icon><Plus /></el-icon>
          新增批次
        </el-button>
      </div>
    </div>

    <div class="card-section">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="树种">
          <el-select v-model="queryForm.species" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="item in treeSpecies" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="queryForm.keyword" placeholder="搜索批次号/来源" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card-section">
      <el-table :data="filteredBatches" stripe border style="width: 100%">
        <el-table-column prop="batchNo" label="批次编号" width="180" />
        <el-table-column prop="species" label="树种" width="100">
          <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
        </el-table-column>
        <el-table-column prop="seedSource" label="种子来源" min-width="180" />
        <el-table-column prop="collectDate" label="采集日期" width="120" />
        <el-table-column prop="weight" label="重量(kg)" width="100" />
        <el-table-column prop="germinationRate" label="发芽率(%)" width="100" />
        <el-table-column prop="purity" label="净度(%)" width="100" />
        <el-table-column prop="moisture" label="含水量(%)" width="100" />
        <el-table-column prop="createTime" label="登记时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button type="primary" link @click="editBatch(row)">编辑</el-button>
            <el-button type="danger" link @click="deleteBatch(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="批次详情" width="700px">
      <el-descriptions :column="2" border v-if="currentBatch">
        <el-descriptions-item label="批次编号">{{ currentBatch.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="树种">{{ getSpeciesLabel(currentBatch.species) }}</el-descriptions-item>
        <el-descriptions-item label="种子来源">{{ currentBatch.seedSource }}</el-descriptions-item>
        <el-descriptions-item label="采集日期">{{ currentBatch.collectDate }}</el-descriptions-item>
        <el-descriptions-item label="重量">{{ currentBatch.weight }} kg</el-descriptions-item>
        <el-descriptions-item label="发芽率">{{ currentBatch.germinationRate }}%</el-descriptions-item>
        <el-descriptions-item label="净度">{{ currentBatch.purity }}%</el-descriptions-item>
        <el-descriptions-item label="含水量">{{ currentBatch.moisture }}%</el-descriptions-item>
        <el-descriptions-item label="登记时间">{{ currentBatch.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentBatch.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑批次' : '新增批次'" width="600px">
      <el-form :model="batchForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="批次编号" prop="batchNo">
          <el-input v-model="batchForm.batchNo" disabled />
        </el-form-item>
        <el-form-item label="树种" prop="species">
          <el-select v-model="batchForm.species" placeholder="请选择树种" style="width: 100%">
            <el-option v-for="item in treeSpecies" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="种子来源" prop="seedSource">
          <el-input v-model="batchForm.seedSource" placeholder="请输入种子来源" />
        </el-form-item>
        <el-form-item label="采集日期" prop="collectDate">
          <el-date-picker v-model="batchForm.collectDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="重量(kg)" prop="weight">
              <el-input-number v-model="batchForm.weight" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发芽率(%)" prop="germinationRate">
              <el-input-number v-model="batchForm.germinationRate" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="净度(%)" prop="purity">
              <el-input-number v-model="batchForm.purity" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="含水量(%)" prop="moisture">
              <el-input-number v-model="batchForm.moisture" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="batchForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBatch">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORES, getList, addItem, updateItem, deleteItem } from '@/utils/db'
import { TREE_SPECIES, getSpeciesLabel, generateBatchNo, generateId } from '@/utils/constants'
import dayjs from 'dayjs'

const treeSpecies = TREE_SPECIES
const batches = ref([])
const detailVisible = ref(false)
const formVisible = ref(false)
const isEdit = ref(false)
const currentBatch = ref(null)
const formRef = ref(null)

const queryForm = ref({
  species: '',
  keyword: ''
})

const filteredBatches = computed(() => {
  return batches.value.filter(b => {
    const matchSpecies = !queryForm.value.species || b.species === queryForm.value.species
    const matchKeyword = !queryForm.value.keyword ||
      b.batchNo.includes(queryForm.value.keyword) ||
      b.seedSource.includes(queryForm.value.keyword)
    return matchSpecies && matchKeyword
  })
})

const batchForm = ref({
  id: '',
  batchNo: '',
  species: '',
  seedSource: '',
  collectDate: '',
  weight: 0,
  germinationRate: 0,
  purity: 0,
  moisture: 0,
  remark: ''
})

const formRules = {
  species: [{ required: true, message: '请选择树种', trigger: 'change' }],
  seedSource: [{ required: true, message: '请输入种子来源', trigger: 'blur' }],
  collectDate: [{ required: true, message: '请选择采集日期', trigger: 'change' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }]
}

const loadData = async () => {
  batches.value = await getList(STORES.SEED_BATCHES)
}

const resetQuery = () => {
  queryForm.value = { species: '', keyword: '' }
  loadData()
}

const viewDetail = (row) => {
  currentBatch.value = row
  detailVisible.value = true
}

const editBatch = (row) => {
  isEdit.value = true
  batchForm.value = { ...row }
  if (batchForm.value.collectDate && typeof batchForm.value.collectDate === 'string') {
    batchForm.value.collectDate = new Date(batchForm.value.collectDate)
  }
  formVisible.value = true
}

const showAdd = () => {
  isEdit.value = false
  batchForm.value = {
    id: '',
    batchNo: generateBatchNo('ZZ'),
    species: '',
    seedSource: '',
    collectDate: dayjs().format('YYYY-MM-DD'),
    weight: 0,
    germinationRate: 0,
    purity: 0,
    moisture: 0,
    remark: ''
  }
  formVisible.value = true
}

const saveBatch = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const saveData = { ...batchForm.value }
      if (saveData.collectDate && typeof saveData.collectDate !== 'string') {
        saveData.collectDate = dayjs(saveData.collectDate).format('YYYY-MM-DD')
      }
      if (isEdit.value) {
        await updateItem(STORES.SEED_BATCHES, saveData.id, saveData)
        ElMessage.success('更新成功')
      } else {
        const newItem = {
          ...saveData,
          id: generateId(),
          status: 'active',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        await addItem(STORES.SEED_BATCHES, newItem)
        ElMessage.success('添加成功')
      }
      formVisible.value = false
      loadData()
    }
  })
}

const deleteBatch = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该批次吗？', '提示', {
      type: 'warning'
    })
    await deleteItem(STORES.SEED_BATCHES, row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.query-form {
  margin-bottom: 0;
}
</style>
