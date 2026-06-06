<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">苗床总览</h2>
      <div>
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #409eff;">
          <div class="label">苗床总数</div>
          <div class="value" style="color: #409eff;">{{ stats.totalBeds }}</div>
          <div class="unit">个</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">在育苗木</div>
          <div class="value" style="color: #67c23a;">{{ stats.totalSeedlings }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">可出圃</div>
          <div class="value" style="color: #e6a23c;">{{ stats.readyCount }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #f56c6c;">
          <div class="label">养护中</div>
          <div class="value" style="color: #f56c6c;">{{ stats.maintenanceCount }}</div>
          <div class="unit">个苗床</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card-section">
          <div class="section-title">苗床分布图</div>
          <div class="bed-map">
            <div
              v-for="bed in beds"
              :key="bed.id"
              class="bed-block"
              :class="`status-${bed.status}`"
              @click="showBedDetail(bed)"
            >
              <div class="bed-no">{{ bed.bedNo }}</div>
              <div class="bed-info" v-if="bed.species">
                <div>{{ getSpeciesLabel(bed.species) }}</div>
                <div class="count">{{ bed.seedlingCount }}株</div>
              </div>
              <div v-else class="bed-empty">空置</div>
            </div>
          </div>
          <div class="legend mt-20">
            <div v-for="status in bedStatuses" :key="status.value" class="legend-item">
              <span class="legend-color" :class="`status-${status.value}`"></span>
              <span>{{ status.label }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="card-section">
          <div class="section-title">树种分布</div>
          <v-chart class="chart" :option="speciesChartOption" autoresize />
        </div>
        <div class="card-section">
          <div class="section-title">苗床状态统计</div>
          <v-chart class="chart" :option="statusChartOption" autoresize />
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="detailVisible" title="苗床详情" width="600px">
      <el-descriptions :column="2" border v-if="currentBed">
        <el-descriptions-item label="苗床编号">{{ currentBed.bedNo }}</el-descriptions-item>
        <el-descriptions-item label="面积(㎡)">{{ currentBed.area }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentBed.status, bedStatuses).type">
            {{ getStatusTag(currentBed.status, bedStatuses).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="行数">{{ currentBed.rowCount }}</el-descriptions-item>
        <el-descriptions-item label="树种" v-if="currentBed.species">
          {{ getSpeciesLabel(currentBed.species) }}
        </el-descriptions-item>
        <el-descriptions-item label="龄级" v-if="currentBed.ageClass">
          {{ getAgeClassLabel(currentBed.ageClass) }}
        </el-descriptions-item>
        <el-descriptions-item label="苗木数量">{{ currentBed.seedlingCount }}株</el-descriptions-item>
        <el-descriptions-item label="平均苗高">{{ currentBed.avgHeight }}cm</el-descriptions-item>
        <el-descriptions-item label="平均地径">{{ currentBed.avgDiameter }}cm</el-descriptions-item>
        <el-descriptions-item label="播种日期">{{ currentBed.sowingDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次灌溉">{{ currentBed.lastIrrigation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次施肥">{{ currentBed.lastFertilization || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentBed.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { STORES, getList } from '@/utils/db'
import { BED_STATUSES, getSpeciesLabel, getAgeClassLabel, getStatusTag } from '@/utils/constants'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

const beds = ref([])
const bedStatuses = BED_STATUSES
const detailVisible = ref(false)
const currentBed = ref(null)

const stats = computed(() => {
  const total = beds.value.length
  const seedlings = beds.value.reduce((sum, b) => sum + b.seedlingCount, 0)
  const ready = beds.value.filter(b => b.status === 'ready').reduce((sum, b) => sum + b.seedlingCount, 0)
  const maintenance = beds.value.filter(b => b.status === 'maintenance').length
  return {
    totalBeds: total,
    totalSeedlings: seedlings,
    readyCount: ready,
    maintenanceCount: maintenance
  }
})

const speciesChartOption = computed(() => {
  const speciesMap = {}
  beds.value.forEach(b => {
    if (b.species) {
      const label = getSpeciesLabel(b.species)
      speciesMap[label] = (speciesMap[label] || 0) + b.seedlingCount
    }
  })
  const data = Object.entries(speciesMap).map(([name, value]) => ({ name, value }))
  return markRaw({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data
    }]
  })
})

const statusChartOption = computed(() => {
  const statusMap = {}
  beds.value.forEach(b => {
    const label = getStatusTag(b.status, bedStatuses).label
    statusMap[label] = (statusMap[label] || 0) + 1
  })
  const data = Object.entries(statusMap).map(([name, value]) => ({ name, value }))
  return markRaw({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      label: {
        show: true,
        formatter: '{b}: {c}个'
      },
      data
    }]
  })
})

const loadData = async () => {
  beds.value = await getList(STORES.SEEDLING_BEDS)
}

const refreshData = () => {
  loadData()
}

const showBedDetail = (bed) => {
  currentBed.value = bed
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.bed-map {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.bed-block {
  width: 120px;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.bed-block:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bed-block.status-empty {
  background: #f4f4f5;
  color: #909399;
}

.bed-block.status-sowing {
  background: #ecf5ff;
  color: #409eff;
  border-color: #409eff;
}

.bed-block.status-growing {
  background: #f0f9eb;
  color: #67c23a;
  border-color: #67c23a;
}

.bed-block.status-ready {
  background: #fdf6ec;
  color: #e6a23c;
  border-color: #e6a23c;
}

.bed-block.status-maintenance {
  background: #fef0f0;
  color: #f56c6c;
  border-color: #f56c6c;
}

.bed-no {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.bed-info {
  text-align: center;
  font-size: 12px;
}

.bed-info .count {
  font-weight: 600;
}

.bed-empty {
  font-size: 14px;
}

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.legend-color.status-empty { background: #f4f4f5; }
.legend-color.status-sowing { background: #ecf5ff; border-color: #409eff; }
.legend-color.status-growing { background: #f0f9eb; border-color: #67c23a; }
.legend-color.status-ready { background: #fdf6ec; border-color: #e6a23c; }
.legend-color.status-maintenance { background: #fef0f0; border-color: #f56c6c; }

.chart {
  height: 200px;
}

.unit {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}
</style>
