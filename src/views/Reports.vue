<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">盘点报表</h2>
      <div>
        <el-button type="primary" @click="activeTab = 'check'; showCheckForm = true">
          <el-icon><Plus /></el-icon>
          新建盘点
        </el-button>
        <el-button type="success" @click="showCertificateForm = true">
          <el-icon><Document /></el-icon>
          苗木合格证
        </el-button>
        <el-button type="warning" @click="exportAnnualReport">
          <el-icon><Download /></el-icon>
          导出年度报表
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #409eff;">
          <div class="label">本年度育苗总量</div>
          <div class="value" style="color: #409eff;">{{ annualStats.totalSeedlings }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">已出圃苗木</div>
          <div class="value" style="color: #67c23a;">{{ annualStats.outboundCount }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">平均成活率</div>
          <div class="value" style="color: #e6a23c;">{{ annualStats.avgSurvivalRate }}%</div>
          <div class="unit"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #909399;">
          <div class="label">盘点次数</div>
          <div class="value" style="color: #909399;">{{ annualStats.checkCount }}</div>
          <div class="unit">次</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mb-20">
      <el-tab-pane label="盘点记录" name="check">
        <div class="card-section">
          <el-form :inline="true" :model="queryForm" class="query-form">
            <el-form-item label="树种">
              <el-select v-model="queryForm.species" placeholder="全部" clearable style="width: 150px">
                <el-option v-for="item in TREE_SPECIES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="龄级">
              <el-select v-model="queryForm.ageClass" placeholder="全部" clearable style="width: 150px">
                <el-option v-for="item in AGE_CLASSES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadCheckRecords">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="card-section">
          <el-table :data="filteredCheckRecords" stripe border style="width: 100%">
            <el-table-column prop="checkNo" label="盘点编号" width="180" />
            <el-table-column prop="checkDate" label="盘点日期" width="120" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="100">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="theoreticalCount" label="账面数量" width="120" />
            <el-table-column prop="actualCount" label="实际数量" width="120" />
            <el-table-column prop="diffCount" label="差异" width="100">
              <template #default="{ row }">
                <span :style="{ color: row.diffCount >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ row.diffCount > 0 ? '+' : '' }}{{ row.diffCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="盘点人" width="100" />
            <el-table-column prop="createTime" label="记录时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small">详情</el-button>
                <el-button type="success" link size="small" @click="printCheckReport(row)">打印</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="苗木合格证" name="certificate">
        <div class="card-section">
          <el-table :data="certificates" stripe border style="width: 100%">
            <el-table-column prop="certNo" label="合格证编号" width="180" />
            <el-table-column prop="species" label="树种" width="100">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="100">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量(株)" width="120" />
            <el-table-column prop="avgHeight" label="平均苗高(cm)" width="130" />
            <el-table-column prop="avgDiameter" label="平均地径(cm)" width="130" />
            <el-table-column prop="issuingUnit" label="签发单位" width="180" />
            <el-table-column prop="issueDate" label="签发日期" width="120" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="previewCertificate(row)">预览</el-button>
                <el-button type="success" link size="small" @click="printCertificate(row)">打印</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="年度汇总" name="annual">
        <div class="card-section">
          <div class="flex-between mb-20">
            <div class="section-title" style="margin-bottom: 0;">年度供应情况汇总</div>
            <el-date-picker
              v-model="selectedYear"
              type="year"
              placeholder="选择年份"
              @change="loadAnnualData"
            />
          </div>
          <v-chart class="annual-chart" :option="annualChartOption" autoresize />
        </div>
        <div class="card-section">
          <div class="section-title">分树种统计</div>
          <el-table :data="speciesSummary" stripe border style="width: 100%">
            <el-table-column prop="species" label="树种" width="120">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="100">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="stockCount" label="库存量(株)" width="120" />
            <el-table-column prop="inboundCount" label="本年新育(株)" width="130" />
            <el-table-column prop="outboundCount" label="本年出圃(株)" width="130" />
            <el-table-column prop="avgHeight" label="平均苗高(cm)" width="130" />
            <el-table-column prop="avgDiameter" label="平均地径(cm)" width="130" />
            <el-table-column prop="qualifiedRate" label="合格率(%)" width="110" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showCheckForm" title="新建盘点记录" width="600px">
      <el-form :model="checkForm" label-width="100px">
        <el-form-item label="盘点编号">
          <el-input v-model="checkForm.checkNo" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="盘点日期">
              <el-date-picker v-model="checkForm.checkDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="盘点苗床">
              <el-select v-model="checkForm.bedId" style="width: 100%" @change="onCheckBedChange">
                <el-option
                  v-for="bed in beds"
                  :key="bed.id"
                  :label="`${bed.bedNo} - ${getSpeciesLabel(bed.species)}`"
                  :value="bed.id"
                  :disabled="!bed.species"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账面数量">
              <el-input-number v-model="checkForm.theoreticalCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际数量">
              <el-input-number v-model="checkForm.actualCount" :min="0" style="width: 100%" @change="calcDiff" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="差异">
          <el-input :value="checkForm.diffCount" disabled />
        </el-form-item>
        <el-form-item label="差异原因">
          <el-input v-model="checkForm.remark" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="盘点人">
          <el-input v-model="checkForm.operator" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCheckForm = false">取消</el-button>
        <el-button type="primary" @click="saveCheckRecord">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCertificateForm" title="苗木质量合格证" width="600px">
      <el-form :model="certForm" label-width="100px">
        <el-form-item label="合格证编号">
          <el-input v-model="certForm.certNo" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="树种">
              <el-select v-model="certForm.species" style="width: 100%">
                <el-option v-for="item in TREE_SPECIES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="龄级">
              <el-select v-model="certForm.ageClass" style="width: 100%">
                <el-option v-for="item in AGE_CLASSES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="数量(株)">
          <el-input-number v-model="certForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平均苗高(cm)">
              <el-input-number v-model="certForm.avgHeight" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平均地径(cm)">
              <el-input-number v-model="certForm.avgDiameter" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="质检结果">
          <el-radio-group v-model="certForm.qualityResult">
            <el-radio label="qualified">合格</el-radio>
            <el-radio label="unqualified">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="签发单位">
          <el-input v-model="certForm.issuingUnit" />
        </el-form-item>
        <el-form-item label="签发日期">
          <el-date-picker v-model="certForm.issueDate" type="date" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCertificateForm = false">取消</el-button>
        <el-button type="primary" @click="saveCertificate">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="苗木质量合格证预览" width="700px">
      <div id="certificate-preview" class="certificate-preview">
        <div class="cert-header">
          <h2>苗木质量合格证</h2>
          <p class="cert-no">编号：{{ currentCert.certNo }}</p>
        </div>
        <div class="cert-body">
          <table class="cert-table">
            <tr>
              <td width="25%">树种</td>
              <td width="25%">{{ getSpeciesLabel(currentCert.species) }}</td>
              <td width="25%">龄级</td>
              <td width="25%">{{ getAgeClassLabel(currentCert.ageClass) }}</td>
            </tr>
            <tr>
              <td>数量</td>
              <td>{{ currentCert.quantity }} 株</td>
              <td>批号</td>
              <td>{{ currentCert.batchNo || '-' }}</td>
            </tr>
            <tr>
              <td>平均苗高</td>
              <td>{{ currentCert.avgHeight }} cm</td>
              <td>平均地径</td>
              <td>{{ currentCert.avgDiameter }} cm</td>
            </tr>
            <tr>
              <td>质检结果</td>
              <td colspan="3">
                <span :style="{ color: currentCert.qualityResult === 'qualified' ? '#67c23a' : '#f56c6c' }">
                  {{ currentCert.qualityResult === 'qualified' ? '合格' : '不合格' }}
                </span>
              </td>
            </tr>
            <tr>
              <td>出圃日期</td>
              <td>{{ currentCert.issueDate }}</td>
              <td>有效期</td>
              <td>30天</td>
            </tr>
          </table>
          <div class="cert-remark">
            <p>备注：本合格证一式两份，苗圃、用苗单位各执一份。</p>
          </div>
          <div class="cert-footer">
            <div class="issuer">
              <p>签发单位：{{ currentCert.issuingUnit }}</p>
              <p>签发人：____________</p>
            </div>
            <div class="issue-date">
              <p>签发日期：{{ currentCert.issueDate }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="printCurrentCertificate">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import { STORES, getList, addItem } from '@/utils/db'
import {
  TREE_SPECIES, AGE_CLASSES,
  getSpeciesLabel, getAgeClassLabel,
  generateBatchNo, generateId
} from '@/utils/constants'
import dayjs from 'dayjs'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
])

const activeTab = ref('check')
const checkRecords = ref([])
const certificates = ref([])
const beds = ref([])

const showCheckForm = ref(false)
const showCertificateForm = ref(false)
const previewVisible = ref(false)
const currentCert = ref({})
const selectedYear = ref(new Date())

const queryForm = ref({
  species: '',
  ageClass: ''
})

const filteredCheckRecords = computed(() => {
  return checkRecords.value.filter(r => {
    const matchSpecies = !queryForm.value.species || r.species === queryForm.value.species
    const matchAgeClass = !queryForm.value.ageClass || r.ageClass === queryForm.value.ageClass
    return matchSpecies && matchAgeClass
  })
})

const annualStats = computed(() => {
  const totalSeedlings = beds.value.reduce((sum, b) => sum + b.seedlingCount, 0)
  const plots = beds.value.filter(b => b.status === 'ready').reduce((sum, b) => sum + b.seedlingCount, 0)
  return {
    totalSeedlings,
    outboundCount: plots,
    avgSurvivalRate: 92,
    checkCount: checkRecords.value.length
  }
})

const speciesSummary = computed(() => {
  const summary = []
  const speciesMap = {}
  beds.value.forEach(bed => {
    if (bed.species) {
      const key = `${bed.species}_${bed.ageClass}`
      if (!speciesMap[key]) {
        speciesMap[key] = {
          species: bed.species,
          ageClass: bed.ageClass,
          stockCount: 0,
          inboundCount: 0,
          outboundCount: 0,
          totalHeight: 0,
          totalDiameter: 0,
          count: 0
        }
      }
      speciesMap[key].stockCount += bed.seedlingCount
      speciesMap[key].totalHeight += bed.avgHeight * bed.seedlingCount
      speciesMap[key].totalDiameter += bed.avgDiameter * bed.seedlingCount
      speciesMap[key].count += bed.seedlingCount
    }
  })
  Object.values(speciesMap).forEach(item => {
    summary.push({
      ...item,
      avgHeight: item.count > 0 ? (item.totalHeight / item.count).toFixed(1) : 0,
      avgDiameter: item.count > 0 ? (item.totalDiameter / item.count).toFixed(2) : 0,
      qualifiedRate: 95
    })
  })
  return summary
})

const annualChartOption = computed(() => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return markRaw({
    tooltip: { trigger: 'axis' },
    legend: { data: ['新育数量', '出圃数量'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新育数量',
        type: 'bar',
        data: [0, 0, 2000, 3000, 5000, 0, 0, 0, 0, 1000, 0, 0]
      },
      {
        name: '出圃数量',
        type: 'bar',
        data: [0, 0, 0, 0, 1000, 2000, 0, 0, 0, 0, 1500, 0]
      }
    ]
  })
})

const checkForm = ref({
  checkNo: '',
  checkDate: '',
  bedId: '',
  species: '',
  ageClass: '',
  theoreticalCount: 0,
  actualCount: 0,
  diffCount: 0,
  operator: '',
  remark: ''
})

const certForm = ref({
  certNo: '',
  species: '',
  ageClass: '',
  quantity: 0,
  avgHeight: 0,
  avgDiameter: 0,
  qualityResult: 'qualified',
  issuingUnit: '国有XX林场苗圃',
  issueDate: '',
  batchNo: ''
})

const loadData = async () => {
  checkRecords.value = await getList(STORES.INVENTORY_CHECK)
  certificates.value = await getList(STORES.CERTIFICATES)
  beds.value = await getList(STORES.SEEDLING_BEDS)
}

const loadCheckRecords = () => {
  loadData()
}

const resetQuery = () => {
  queryForm.value = { species: '', ageClass: '' }
  loadData()
}

const onCheckBedChange = (bedId) => {
  const bed = beds.value.find(b => b.id === bedId)
  if (bed) {
    checkForm.value.species = bed.species
    checkForm.value.ageClass = bed.ageClass
    checkForm.value.theoreticalCount = bed.seedlingCount
  }
}

const calcDiff = () => {
  checkForm.value.diffCount = checkForm.value.actualCount - checkForm.value.theoreticalCount
}

const saveCheckRecord = async () => {
  const newRecord = {
    ...checkForm.value,
    id: generateId(),
    diffCount: checkForm.value.actualCount - checkForm.value.theoreticalCount,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.INVENTORY_CHECK, newRecord)
  ElMessage.success('盘点记录保存成功')
  showCheckForm.value = false
  loadData()
}

const saveCertificate = async () => {
  const newCert = {
    ...certForm.value,
    id: generateId(),
    batchNo: generateBatchNo('PC'),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.CERTIFICATES, newCert)
  certificates.value.push(newCert)
  ElMessage.success('合格证创建成功')
  showCertificateForm.value = false
}

const previewCertificate = (row) => {
  currentCert.value = row
  previewVisible.value = true
}

const printCertificate = (row) => {
  currentCert.value = row
  previewVisible.value = true
}

const printCurrentCertificate = () => {
  ElMessage.success('正在准备打印...')
}

const printCheckReport = (row) => {
  ElMessage.success('盘点报表打印功能开发中')
}

const loadAnnualData = () => {
  ElMessage.info('年度数据已更新')
}

const exportAnnualReport = () => {
  ElMessage.success('年度报表导出功能开发中')
}

onMounted(() => {
  loadData()
  checkForm.value.checkNo = generateBatchNo('PD')
  certForm.value.certNo = generateBatchNo('HGZ')
  checkForm.value.checkDate = dayjs().format('YYYY-MM-DD')
  certForm.value.issueDate = dayjs().format('YYYY-MM-DD')
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
.annual-chart {
  height: 350px;
}

.certificate-preview {
  background: #fff;
  padding: 30px;
  border: 1px solid #dcdfe6;
}

.cert-header {
  text-align: center;
  margin-bottom: 30px;
}

.cert-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.cert-no {
  color: #606266;
}

.cert-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.cert-table td {
  border: 1px solid #dcdfe6;
  padding: 10px 15px;
  font-size: 14px;
}

.cert-remark {
  margin-top: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.cert-remark p {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.cert-footer {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}

.cert-footer p {
  margin: 5px 0;
  color: #606266;
}
</style>
