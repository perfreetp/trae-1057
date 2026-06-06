<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">灌溉施肥</h2>
      <div>
        <el-button type="primary" @click="activeTab = 'irrigation'; showIrrigationForm = true">
          <el-icon><Watermelon /></el-icon>
          新增灌溉
        </el-button>
        <el-button type="success" @click="activeTab = 'fertilization'; showFertilizationForm = true">
          <el-icon><Food /></el-icon>
          新增施肥
        </el-button>
        <el-button type="warning" @click="showReminderForm = true">
          <el-icon><AlarmClock /></el-icon>
          设置提醒
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #409eff;">
          <div class="label">本月灌溉次数</div>
          <div class="value" style="color: #409eff;">{{ monthStats.irrigationCount }}</div>
          <div class="unit">次</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">本月施肥次数</div>
          <div class="value" style="color: #67c23a;">{{ monthStats.fertilizationCount }}</div>
          <div class="unit">次</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">待办提醒</div>
          <div class="value" style="color: #e6a23c;">{{ pendingReminders }}</div>
          <div class="unit">条</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mb-20">
      <el-tab-pane label="灌溉记录" name="irrigation">
        <div class="card-section">
          <el-table :data="irrigationRecords" stripe border style="width: 100%">
            <el-table-column prop="recordNo" label="记录编号" width="180" />
            <el-table-column prop="bedNos" label="苗床号" width="150">
              <template #default="{ row }">{{ row.bedNos.join(', ') }}</template>
            </el-table-column>
            <el-table-column prop="irrigationDate" label="灌溉日期" width="120" />
            <el-table-column prop="irrigationMethod" label="灌溉方式" width="100" />
            <el-table-column prop="duration" label="时长(分钟)" width="100" />
            <el-table-column prop="waterVolume" label="用水量(方)" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="createTime" label="记录时间" width="180" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link>详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="施肥记录" name="fertilization">
        <div class="card-section">
          <el-table :data="fertilizationRecords" stripe border style="width: 100%">
            <el-table-column prop="recordNo" label="记录编号" width="180" />
            <el-table-column prop="bedNos" label="苗床号" width="150">
              <template #default="{ row }">{{ row.bedNos.join(', ') }}</template>
            </el-table-column>
            <el-table-column prop="fertilizationDate" label="施肥日期" width="120" />
            <el-table-column prop="fertilizerType" label="肥料类型" width="150" />
            <el-table-column prop="fertilizerAmount" label="施肥量(kg)" width="120" />
            <el-table-column prop="fertilizationMethod" label="施肥方式" width="100" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="createTime" label="记录时间" width="180" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link>详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="养护提醒" name="reminder">
        <div class="card-section">
          <el-table :data="reminders" stripe border style="width: 100%">
            <el-table-column prop="title" label="提醒标题" min-width="200" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.type === 'irrigation'" type="primary">灌溉</el-tag>
                <el-tag v-else-if="row.type === 'fertilization'" type="success">施肥</el-tag>
                <el-tag v-else type="warning">其他</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="提醒内容" min-width="250" />
            <el-table-column prop="remindTime" label="提醒时间" width="180" />
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.priority === 'high'" type="danger">高</el-tag>
                <el-tag v-else-if="row.priority === 'medium'" type="warning">中</el-tag>
                <el-tag v-else type="info">低</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
                <el-tag v-else type="success">已完成</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="success" link size="small" v-if="row.status === 'pending'">完成</el-button>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showIrrigationForm" title="新增灌溉记录" width="600px">
      <el-form :model="irrigationForm" label-width="100px">
        <el-form-item label="记录编号">
          <el-input v-model="irrigationForm.recordNo" disabled />
        </el-form-item>
        <el-form-item label="选择苗床">
          <el-select v-model="irrigationForm.bedIds" multiple placeholder="选择苗床" style="width: 100%" @change="onIrrigationBedChange">
            <el-option
              v-for="bed in activeBeds"
              :key="bed.id"
              :label="`${bed.bedNo} - ${getSpeciesLabel(bed.species)}`"
              :value="bed.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灌溉日期">
              <el-date-picker v-model="irrigationForm.irrigationDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="灌溉方式">
              <el-select v-model="irrigationForm.irrigationMethod" style="width: 100%">
                <el-option label="喷灌" value="喷灌" />
                <el-option label="漫灌" value="漫灌" />
                <el-option label="滴灌" value="滴灌" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时长(分钟)">
              <el-input-number v-model="irrigationForm.duration" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用水量(方)">
              <el-input-number v-model="irrigationForm.waterVolume" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作人">
          <el-input v-model="irrigationForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="irrigationForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showIrrigationForm = false">取消</el-button>
        <el-button type="primary" @click="saveIrrigation">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showFertilizationForm" title="新增施肥记录" width="600px">
      <el-form :model="fertilizationForm" label-width="100px">
        <el-form-item label="记录编号">
          <el-input v-model="fertilizationForm.recordNo" disabled />
        </el-form-item>
        <el-form-item label="选择苗床">
          <el-select v-model="fertilizationForm.bedIds" multiple placeholder="选择苗床" style="width: 100%" @change="onFertilizationBedChange">
            <el-option
              v-for="bed in activeBeds"
              :key="bed.id"
              :label="`${bed.bedNo} - ${getSpeciesLabel(bed.species)}`"
              :value="bed.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="施肥日期">
              <el-date-picker v-model="fertilizationForm.fertilizationDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="肥料类型">
              <el-select v-model="fertilizationForm.fertilizerType" style="width: 100%">
                <el-option label="复合肥" value="复合肥" />
                <el-option label="尿素" value="尿素" />
                <el-option label="有机肥" value="有机肥" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="施肥量(kg)">
              <el-input-number v-model="fertilizationForm.fertilizerAmount" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="施肥方式">
              <el-select v-model="fertilizationForm.fertilizationMethod" style="width: 100%">
                <el-option label="沟施" value="沟施" />
                <el-option label="撒施" value="撒施" />
                <el-option label="叶面喷施" value="叶面喷施" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作人">
          <el-input v-model="fertilizationForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="fertilizationForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFertilizationForm = false">取消</el-button>
        <el-button type="primary" @click="saveFertilization">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showReminderForm" title="设置养护提醒" width="500px">
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="提醒类型">
          <el-select v-model="reminderForm.type" style="width: 100%">
            <el-option label="灌溉" value="irrigation" />
            <el-option label="施肥" value="fertilization" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联苗床">
          <el-select v-model="reminderForm.relatedId" placeholder="选择苗床" style="width: 100%">
            <el-option
              v-for="bed in activeBeds"
              :key="bed.id"
              :label="`${bed.bedNo} - ${getSpeciesLabel(bed.species)}`"
              :value="bed.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒标题">
          <el-input v-model="reminderForm.title" placeholder="请输入提醒标题" />
        </el-form-item>
        <el-form-item label="提醒内容">
          <el-input v-model="reminderForm.content" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="提醒时间">
          <el-date-picker v-model="reminderForm.remindTime" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="reminderForm.priority">
            <el-radio value="high" label="高" />
            <el-radio value="medium" label="中" />
            <el-radio value="low" label="低" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReminderForm = false">取消</el-button>
        <el-button type="primary" @click="saveReminder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { STORES, getList, addItem } from '@/utils/db'
import { getSpeciesLabel, generateBatchNo, generateId } from '@/utils/constants'
import dayjs from 'dayjs'

const activeTab = ref('irrigation')
const irrigationRecords = ref([])
const fertilizationRecords = ref([])
const reminders = ref([])
const beds = ref([])

const showIrrigationForm = ref(false)
const showFertilizationForm = ref(false)
const showReminderForm = ref(false)

const activeBeds = computed(() => beds.value.filter(b => b.species))

const monthStats = computed(() => {
  const now = dayjs()
  const monthStart = now.startOf('month')
  const irrigationCount = irrigationRecords.value.filter(r =>
    dayjs(r.irrigationDate).isAfter(monthStart)
  ).length
  const fertilizationCount = fertilizationRecords.value.filter(r =>
    dayjs(r.fertilizationDate).isAfter(monthStart)
  ).length
  return { irrigationCount, fertilizationCount }
})

const pendingReminders = computed(() => reminders.value.filter(r => r.status === 'pending').length)

const irrigationForm = ref({
  recordNo: '',
  bedIds: [],
  bedNos: [],
  irrigationDate: '',
  irrigationMethod: '喷灌',
  duration: 60,
  waterVolume: 10,
  operator: '',
  remark: ''
})

const fertilizationForm = ref({
  recordNo: '',
  bedIds: [],
  bedNos: [],
  fertilizationDate: '',
  fertilizerType: '复合肥',
  fertilizerAmount: 10,
  fertilizationMethod: '沟施',
  operator: '',
  remark: ''
})

const reminderForm = ref({
  type: 'irrigation',
  relatedId: '',
  title: '',
  content: '',
  remindTime: '',
  priority: 'medium',
  status: 'pending'
})

const loadData = async () => {
  irrigationRecords.value = await getList(STORES.IRRIGATION_RECORDS)
  fertilizationRecords.value = await getList(STORES.FERTILIZATION_RECORDS)
  reminders.value = await getList(STORES.REMINDERS)
  beds.value = await getList(STORES.SEEDLING_BEDS)
}

const onIrrigationBedChange = (ids) => {
  irrigationForm.value.bedNos = beds.value
    .filter(b => ids.includes(b.id))
    .map(b => b.bedNo)
}

const onFertilizationBedChange = (ids) => {
  fertilizationForm.value.bedNos = beds.value
    .filter(b => ids.includes(b.id))
    .map(b => b.bedNo)
}

const saveIrrigation = async () => {
  const newRecord = {
    ...irrigationForm.value,
    id: generateId(),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.IRRIGATION_RECORDS, newRecord)
  ElMessage.success('灌溉记录添加成功')
  showIrrigationForm.value = false
  loadData()
}

const saveFertilization = async () => {
  const newRecord = {
    ...fertilizationForm.value,
    id: generateId(),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.FERTILIZATION_RECORDS, newRecord)
  ElMessage.success('施肥记录添加成功')
  showFertilizationForm.value = false
  loadData()
}

const saveReminder = async () => {
  const newReminder = {
    ...reminderForm.value,
    id: generateId(),
    remindTime: dayjs(reminderForm.value.remindTime).format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.REMINDERS, newReminder)
  ElMessage.success('提醒设置成功')
  showReminderForm.value = false
  loadData()
}

onMounted(() => {
  loadData()
  irrigationForm.value.recordNo = generateBatchNo('GG')
  fertilizationForm.value.recordNo = generateBatchNo('SF')
  irrigationForm.value.irrigationDate = dayjs().format('YYYY-MM-DD')
  fertilizationForm.value.fertilizationDate = dayjs().format('YYYY-MM-DD')
})
</script>

<style scoped>
.unit {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}
</style>
