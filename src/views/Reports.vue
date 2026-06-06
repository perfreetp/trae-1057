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
        <el-button type="info" @click="exportBackup">
          <el-icon><Download /></el-icon>
          数据备份
        </el-button>
        <el-button type="danger" @click="showRestoreDialog = true">
          <el-icon><Upload /></el-icon>
          数据恢复
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
            <el-table-column prop="diffHandled" label="差异处理" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.diffCount !== 0 && row.diffHandle" type="success" size="small">已处理</el-tag>
                <el-tag v-else-if="row.diffCount !== 0" type="warning" size="small">待处理</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="盘点人" width="100" />
            <el-table-column prop="createTime" label="记录时间" width="180" />
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewCheckDetail(row)">详情</el-button>
                <el-button v-if="row.diffCount !== 0 && !row.diffHandle" type="warning" link size="small" @click="showDiffHandle(row)">差异处理</el-button>
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
      <el-tab-pane label="年度经营分析" name="analysis">
        <div class="card-section">
          <div class="flex-between mb-20">
            <div class="section-title" style="margin-bottom: 0;">年度经营分析</div>
            <el-date-picker
              v-model="analysisYear"
              type="year"
              placeholder="选择年份"
              @change="loadAnalysisData"
            />
          </div>
          <el-row :gutter="20" class="mb-20">
            <el-col :span="6">
              <div class="stat-card analysis-stat" style="border-left: 4px solid #409eff;">
                <div class="label">育苗总量</div>
                <div class="value" style="color: #409eff;">{{ analysisStats.totalSeedlings }}</div>
                <div class="unit">株</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card analysis-stat" style="border-left: 4px solid #67c23a;">
                <div class="label">出圃总量</div>
                <div class="value" style="color: #67c23a;">{{ analysisStats.totalOutbound }}</div>
                <div class="unit">株</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card analysis-stat" style="border-left: 4px solid #f56c6c;">
                <div class="label">损耗总量</div>
                <div class="value" style="color: #f56c6c;">{{ analysisStats.totalLoss }}</div>
                <div class="unit">株</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card analysis-stat" style="border-left: 4px solid #e6a23c;">
                <div class="label">盘点差异</div>
                <div class="value" style="color: #e6a23c;">{{ analysisStats.totalDiff }}</div>
                <div class="unit">株</div>
              </div>
            </el-col>
          </el-row>
          <v-chart class="analysis-chart" :option="analysisChartOption" autoresize />
        </div>
        <div class="card-section">
          <div class="section-title">月度明细统计</div>
          <el-table :data="monthlyAnalysisData" stripe border style="width: 100%">
            <el-table-column prop="month" label="月份" width="100" fixed />
            <el-table-column prop="seedlingCount" label="育苗数量" width="120" />
            <el-table-column prop="outboundCount" label="出圃数量" width="120" />
            <el-table-column prop="lossCount" label="损耗数量" width="120" />
            <el-table-column prop="checkDiff" label="盘点差异" width="120" />
            <el-table-column label="树种分布" min-width="300">
              <template #default="{ row }">
                <el-tag v-for="(item, key) in row.speciesData" :key="key" size="small" style="margin-right: 5px;">
                  {{ getSpeciesLabel(key) }}: {{ item }}株
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="card-section">
          <div class="section-title">分树种龄级统计</div>
          <el-table :data="speciesAgeAnalysis" stripe border style="width: 100%">
            <el-table-column prop="species" label="树种" width="120">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="100">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="seedlingCount" label="育苗数量" width="120" />
            <el-table-column prop="outboundCount" label="出圃数量" width="120" />
            <el-table-column prop="lossCount" label="损耗数量" width="120" />
            <el-table-column prop="stockCount" label="当前库存" width="120" />
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

    <el-dialog v-model="showCheckPreview" title="盘点记录预览" width="700px">
      <div id="check-record-print" class="check-print">
        <div class="check-header">
          <h2>苗木盘点记录单</h2>
          <p class="check-no">盘点编号：{{ currentCheckRecord?.checkNo }}</p>
        </div>
        <table class="check-table">
          <tr>
            <td class="label">盘点编号</td>
            <td>{{ currentCheckRecord?.checkNo }}</td>
            <td class="label">盘点日期</td>
            <td>{{ currentCheckRecord?.checkDate }}</td>
          </tr>
          <tr>
            <td class="label">树种</td>
            <td>{{ currentCheckRecord?.species ? getSpeciesLabel(currentCheckRecord.species) : '-' }}</td>
            <td class="label">龄级</td>
            <td>{{ currentCheckRecord?.ageClass ? getAgeClassLabel(currentCheckRecord.ageClass) : '-' }}</td>
          </tr>
          <tr>
            <td class="label">账面数量</td>
            <td>{{ currentCheckRecord?.theoreticalCount }} 株</td>
            <td class="label">实际数量</td>
            <td>{{ currentCheckRecord?.actualCount }} 株</td>
          </tr>
          <tr>
            <td class="label">差异数量</td>
            <td colspan="3">
              <span :class="(currentCheckRecord?.diffCount || 0) >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ (currentCheckRecord?.diffCount || 0) > 0 ? '+' : '' }}{{ currentCheckRecord?.diffCount || 0 }} 株
              </span>
            </td>
          </tr>
          <tr>
            <td class="label">差异原因</td>
            <td colspan="3">{{ currentCheckRecord?.remark || '无' }}</td>
          </tr>
          <tr v-if="currentCheckRecord?.diffHandle">
            <td class="label">处理方式</td>
            <td>{{ getDiffHandleLabel(currentCheckRecord.diffHandle.handleType) }}</td>
            <td class="label">处理人</td>
            <td>{{ currentCheckRecord.diffHandle.handler }}</td>
          </tr>
          <tr v-if="currentCheckRecord?.diffHandle">
            <td class="label">处理结果</td>
            <td colspan="3">{{ currentCheckRecord.diffHandle.handleResult }}</td>
          </tr>
          <tr>
            <td class="label">盘点人</td>
            <td>{{ currentCheckRecord?.operator || '-' }}</td>
            <td class="label">记录时间</td>
            <td>{{ currentCheckRecord?.createTime || '-' }}</td>
          </tr>
        </table>
        <div class="check-footer">
          <div class="sign-item">
            <p>盘点人签字：_______________</p>
          </div>
          <div class="sign-item">
            <p>复核人签字：_______________</p>
          </div>
          <div class="sign-item">
            <p>日期：_______________</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCheckPreview = false">关闭</el-button>
        <el-button type="primary" @click="doPrintCheckRecord">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDiffHandleDialog" title="差异处理" width="500px">
      <el-form :model="diffHandleForm" label-width="100px">
        <el-form-item label="差异数量">
          <el-input :value="currentDiffCheck?.diffCount" disabled />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="diffHandleForm.handleType" style="width: 100%">
            <el-option label="正常损耗" value="normal_loss" />
            <el-option label="补录入库" value="supplementary" />
            <el-option label="盘亏确认" value="loss_confirm" />
            <el-option label="人工修正" value="manual_correction" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="diffHandleForm.handler" />
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="diffHandleForm.handleResult" type="textarea" :rows="3" placeholder="请输入处理说明..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDiffHandleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDiffHandle">确认处理</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCheckDetail" title="盘点详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="盘点编号">{{ currentCheckRecord?.checkNo }}</el-descriptions-item>
        <el-descriptions-item label="盘点日期">{{ currentCheckRecord?.checkDate }}</el-descriptions-item>
        <el-descriptions-item label="树种">{{ getSpeciesLabel(currentCheckRecord?.species) }}</el-descriptions-item>
        <el-descriptions-item label="龄级">{{ getAgeClassLabel(currentCheckRecord?.ageClass) }}</el-descriptions-item>
        <el-descriptions-item label="账面数量">{{ currentCheckRecord?.theoreticalCount }} 株</el-descriptions-item>
        <el-descriptions-item label="实际数量">{{ currentCheckRecord?.actualCount }} 株</el-descriptions-item>
        <el-descriptions-item label="差异">
          <span :style="{ color: (currentCheckRecord?.diffCount || 0) >= 0 ? '#67c23a' : '#f56c6c' }">
            {{ (currentCheckRecord?.diffCount || 0) > 0 ? '+' : '' }}{{ currentCheckRecord?.diffCount || 0 }} 株
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="盘点人">{{ currentCheckRecord?.operator || '-' }}</el-descriptions-item>
        <el-descriptions-item label="差异原因" :span="2">{{ currentCheckRecord?.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider v-if="currentCheckRecord?.diffHandle">差异处理记录</el-divider>
      <el-descriptions v-if="currentCheckRecord?.diffHandle" :column="2" border>
        <el-descriptions-item label="处理方式">{{ getDiffHandleLabel(currentCheckRecord.diffHandle.handleType) }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentCheckRecord.diffHandle.handler }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentCheckRecord.diffHandle.handleTime }}</el-descriptions-item>
        <el-descriptions-item label="处理说明" :span="2">{{ currentCheckRecord.diffHandle.handleResult }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showCheckDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRestoreDialog" title="数据恢复" width="500px">
      <el-alert
        title="恢复操作将覆盖当前所有数据，请谨慎操作！"
        type="warning"
        :closable="false"
        show-icon
        class="mb-20"
      />
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleRestoreFileChange"
        :show-file-list="true"
        accept=".json"
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将备份文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 .json 格式的备份文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="showRestoreDialog = false">取消</el-button>
        <el-button type="danger" :disabled="!restoreFile" @click="confirmRestore">
          确认恢复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORES, getList, addItem, updateItem, saveList } from '@/utils/db'
import {
  TREE_SPECIES, AGE_CLASSES,
  getSpeciesLabel, getAgeClassLabel,
  generateBatchNo, generateId
} from '@/utils/constants'
import dayjs from 'dayjs'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
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
  LineChart,
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
const allocations = ref([])

const showCheckForm = ref(false)
const showCertificateForm = ref(false)
const previewVisible = ref(false)
const currentCert = ref({})
const selectedYear = ref(new Date())
const analysisYear = ref(new Date())

const showCheckPreview = ref(false)
const currentCheckRecord = ref(null)
const showDiffHandleDialog = ref(false)
const diffHandleForm = ref({
  handleType: '',
  handler: '',
  handleResult: ''
})
const currentDiffCheck = ref(null)
const showCheckDetail = ref(false)

const showRestoreDialog = ref(false)
const restoreFile = ref(null)

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

const analysisStats = ref({
  totalSeedlings: 0,
  totalOutbound: 0,
  totalLoss: 0,
  totalDiff: 0
})

const monthlyAnalysisData = ref([])
const speciesAgeAnalysis = ref([])

const analysisChartOption = computed(() => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const seedlingData = monthlyAnalysisData.value.map(m => m.seedlingCount)
  const outboundData = monthlyAnalysisData.value.map(m => m.outboundCount)
  const lossData = monthlyAnalysisData.value.map(m => m.lossCount)
  const diffData = monthlyAnalysisData.value.map(m => m.checkDiff)

  return markRaw({
    tooltip: { trigger: 'axis' },
    legend: { data: ['育苗数量', '出圃数量', '损耗数量', '盘点差异'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [
      {
        name: '育苗数量',
        type: 'line',
        smooth: true,
        data: seedlingData,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '出圃数量',
        type: 'line',
        smooth: true,
        data: outboundData,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '损耗数量',
        type: 'line',
        smooth: true,
        data: lossData,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '盘点差异',
        type: 'line',
        smooth: true,
        data: diffData,
        itemStyle: { color: '#e6a23c' }
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
  allocations.value = await getList(STORES.ALLOCATIONS)
  loadAnalysisData()
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
  const saveData = { ...certForm.value }
  if (saveData.issueDate && typeof saveData.issueDate !== 'string') {
    saveData.issueDate = dayjs(saveData.issueDate).format('YYYY-MM-DD')
  }
  const newCert = {
    ...saveData,
    id: generateId(),
    batchNo: generateBatchNo('PC'),
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.CERTIFICATES, newCert)
  certificates.value = await getList(STORES.CERTIFICATES)
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
  const printContent = document.getElementById('certificate-preview')
  if (!printContent) return
  const printWindow = window.open('', '_blank', 'width=700,height=900')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器弹窗设置')
    return
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>苗木质量合格证</title>
      <style>
        body { font-family: 'Microsoft YaHei', 'SimSun', sans-serif; padding: 30px; }
        .certificate-preview { max-width: 650px; margin: 0 auto; }
        .cert-header { text-align: center; margin-bottom: 25px; border-bottom: 3px double #333; padding-bottom: 15px; }
        .cert-header h2 { margin: 0 0 10px 0; font-size: 28px; letter-spacing: 4px; }
        .cert-no { color: #666; margin: 0; font-size: 14px; }
        .cert-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .cert-table td { border: 1px solid #333; padding: 12px 15px; font-size: 15px; }
        .cert-remark { margin-top: 20px; padding: 10px; background: #f9f9f9; border-left: 3px solid #409eff; }
        .cert-remark p { color: #666; font-size: 13px; margin: 0; }
        .cert-footer { margin-top: 40px; display: flex; justify-content: space-between; }
        .cert-footer p { margin: 8px 0; font-size: 14px; }
        @media print {
          body { padding: 0; }
          @page { margin: 20mm; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

const printCheckReport = (row) => {
  currentCheckRecord.value = row
  showCheckPreview.value = true
}

const doPrintCheckRecord = () => {
  const printContent = document.getElementById('check-record-print')
  if (!printContent) return
  const printWindow = window.open('', '_blank', 'width=700,height=600')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器弹窗设置')
    return
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>盘点记录单</title>
      <style>
        body { font-family: 'Microsoft YaHei', sans-serif; padding: 30px; }
        .check-print { max-width: 650px; margin: 0 auto; }
        .check-header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .check-header h2 { margin: 0 0 10px 0; font-size: 24px; }
        .check-no { color: #666; margin: 0; }
        .check-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .check-table td { border: 1px solid #333; padding: 12px 15px; font-size: 14px; }
        .check-table .label { background: #f5f5f5; font-weight: 600; width: 25%; }
        .diff-positive { color: #67c23a; }
        .diff-negative { color: #f56c6c; }
        .check-footer { margin-top: 50px; display: flex; justify-content: space-between; }
        .sign-item { text-align: center; }
        .sign-item p { margin: 5px 0; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 300)
}

const loadAnnualData = () => {
  ElMessage.info('年度数据已更新')
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    completed: '已完成'
  }
  return map[status] || status
}

const getDiffHandleLabel = (type) => {
  const map = {
    normal_loss: '正常损耗',
    supplementary: '补录入库',
    loss_confirm: '盘亏确认',
    manual_correction: '人工修正'
  }
  return map[type] || type
}

const showDiffHandle = (row) => {
  currentDiffCheck.value = row
  diffHandleForm.value = {
    handleType: '',
    handler: '',
    handleResult: ''
  }
  showDiffHandleDialog.value = true
}

const saveDiffHandle = async () => {
  if (!diffHandleForm.value.handleType) {
    ElMessage.warning('请选择处理方式')
    return
  }
  if (!diffHandleForm.value.handler) {
    ElMessage.warning('请输入处理人')
    return
  }
  const updateData = {
    diffHandle: {
      ...diffHandleForm.value,
      handleTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    diffHandled: true
  }
  await updateItem(STORES.INVENTORY_CHECK, currentDiffCheck.value.id, updateData)
  ElMessage.success('差异处理记录保存成功')
  showDiffHandleDialog.value = false
  loadData()
}

const viewCheckDetail = (row) => {
  currentCheckRecord.value = row
  showCheckDetail.value = true
}

const loadAnalysisData = () => {
  const year = dayjs(analysisYear.value).year()
  const months = 12

  const monthlyData = []
  for (let i = 1; i <= months; i++) {
    monthlyData.push({
      month: `${i}月`,
      seedlingCount: 0,
      outboundCount: 0,
      lossCount: 0,
      checkDiff: 0,
      speciesData: {}
    })
  }

  beds.value.forEach(bed => {
    if (bed.createTime) {
      const bedYear = dayjs(bed.createTime).year()
      if (bedYear === year) {
        const month = dayjs(bed.createTime).month()
        monthlyData[month].seedlingCount += bed.seedlingCount
        if (bed.species) {
          if (!monthlyData[month].speciesData[bed.species]) {
            monthlyData[month].speciesData[bed.species] = 0
          }
          monthlyData[month].speciesData[bed.species] += bed.seedlingCount
        }
      }
    }
  })

  allocations.value.forEach(alloc => {
    if (alloc.createTime) {
      const allocYear = dayjs(alloc.createTime).year()
      if (allocYear === year) {
        const month = dayjs(alloc.createTime).month()
        monthlyData[month].outboundCount += alloc.quantity || 0
        if (alloc.lossCount) {
          monthlyData[month].lossCount += alloc.lossCount
        }
      }
    }
  })

  checkRecords.value.forEach(check => {
    if (check.checkDate) {
      const checkYear = dayjs(check.checkDate).year()
      if (checkYear === year) {
        const month = dayjs(check.checkDate).month()
        monthlyData[month].checkDiff += Math.abs(check.diffCount || 0)
      }
    }
  })

  monthlyAnalysisData.value = monthlyData

  analysisStats.value = {
    totalSeedlings: monthlyData.reduce((sum, m) => sum + m.seedlingCount, 0),
    totalOutbound: monthlyData.reduce((sum, m) => sum + m.outboundCount, 0),
    totalLoss: monthlyData.reduce((sum, m) => sum + m.lossCount, 0),
    totalDiff: monthlyData.reduce((sum, m) => sum + m.checkDiff, 0)
  }

  const speciesAgeMap = {}
  beds.value.forEach(bed => {
    if (bed.species && bed.ageClass) {
      const key = `${bed.species}_${bed.ageClass}`
      if (!speciesAgeMap[key]) {
        speciesAgeMap[key] = {
          species: bed.species,
          ageClass: bed.ageClass,
          seedlingCount: 0,
          outboundCount: 0,
          lossCount: 0,
          stockCount: 0
        }
      }
      speciesAgeMap[key].seedlingCount += bed.seedlingCount
      speciesAgeMap[key].stockCount += bed.seedlingCount
    }
  })

  allocations.value.forEach(alloc => {
    if (alloc.species && alloc.ageClass) {
      const key = `${alloc.species}_${alloc.ageClass}`
      if (!speciesAgeMap[key]) {
        speciesAgeMap[key] = {
          species: alloc.species,
          ageClass: alloc.ageClass,
          seedlingCount: 0,
          outboundCount: 0,
          lossCount: 0,
          stockCount: 0
        }
      }
      speciesAgeMap[key].outboundCount += alloc.quantity || 0
      speciesAgeMap[key].lossCount += alloc.lossCount || 0
    }
  })

  speciesAgeAnalysis.value = Object.values(speciesAgeMap)
}

const exportBackup = async () => {
  try {
    const backupData = {}
    const stores = Object.values(STORES)
    for (const store of stores) {
      backupData[store] = await getList(store)
    }
    backupData._backupInfo = {
      exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      version: '1.0.0'
    }

    const jsonStr = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `苗圃数据备份_${dayjs().format('YYYYMMDD_HHmmss')}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('数据备份成功！')
  } catch (error) {
    console.error('备份失败:', error)
    ElMessage.error('备份失败，请重试')
  }
}

const handleRestoreFileChange = (file) => {
  restoreFile.value = file.raw
}

const confirmRestore = async () => {
  if (!restoreFile.value) return

  try {
    await ElMessageBox.confirm(
      '恢复操作将覆盖当前所有数据，建议先备份当前数据。确定要继续吗？',
      '数据恢复确认',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result)

        for (const storeKey of Object.keys(backupData)) {
          if (storeKey === '_backupInfo') continue
          if (Object.values(STORES).includes(storeKey)) {
            await saveList(storeKey, backupData[storeKey])
          }
        }

        ElMessage.success('数据恢复成功！请刷新页面。')
        showRestoreDialog.value = false
        restoreFile.value = null
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (parseError) {
        console.error('解析备份文件失败:', parseError)
        ElMessage.error('备份文件格式错误，请检查文件')
      }
    }
    reader.readAsText(restoreFile.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复失败:', error)
      ElMessage.error('恢复失败，请重试')
    }
  }
}

const exportAnnualReport = async () => {
  const year = dayjs(selectedYear.value).year()
  const bedsData = await getList(STORES.SEEDLING_BEDS)
  const outbounds = await getList(STORES.OUTBOUND_REQUESTS)
  const checkRecords = await getList(STORES.INVENTORY_CHECK)

  const totalSeedlings = bedsData.reduce((sum, b) => sum + b.seedlingCount, 0)
  const approvedOutbounds = outbounds.filter(o => o.status === 'approved' || o.status === 'completed')
  const totalOutbound = approvedOutbounds.reduce((sum, o) => sum + o.quantity, 0)

  const speciesData = {}
  bedsData.forEach(bed => {
    if (bed.species) {
      const key = `${bed.species}_${bed.ageClass || 'unknown'}`
      if (!speciesData[key]) {
        speciesData[key] = {
          species: bed.species,
          ageClass: bed.ageClass || 'unknown',
          stockCount: 0,
          totalHeight: 0,
          totalDiameter: 0,
          count: 0
        }
      }
      speciesData[key].stockCount += bed.seedlingCount
      speciesData[key].totalHeight += bed.avgHeight * bed.seedlingCount
      speciesData[key].totalDiameter += bed.avgDiameter * bed.seedlingCount
      speciesData[key].count += bed.seedlingCount
    }
  })

  const speciesSummary = Object.values(speciesData).map(item => ({
    ...item,
    avgHeight: item.count > 0 ? (item.totalHeight / item.count).toFixed(1) : 0,
    avgDiameter: item.count > 0 ? (item.totalDiameter / item.count).toFixed(2) : 0,
    qualifiedRate: 95
  }))

  let csvContent = '\uFEFF'
  csvContent += `${year}年度苗圃供应情况汇总报表\n\n`
  csvContent += `一、总体数据\n`
  csvContent += `年度育苗总量,${totalSeedlings}株\n`
  csvContent += `已出圃苗木,${totalOutbound}株\n`
  csvContent += `盘点次数,${checkRecords.length}次\n`
  csvContent += `平均成活率,92%\n\n`
  csvContent += `二、按树种龄级汇总\n`
  csvContent += `树种,龄级,库存量(株),平均苗高(cm),平均地径(cm),合格率(%)\n`
  speciesSummary.forEach(item => {
    csvContent += `${getSpeciesLabel(item.species)},${getAgeClassLabel(item.ageClass)},${item.stockCount},${item.avgHeight},${item.avgDiameter},${item.qualifiedRate}\n`
  })
  csvContent += `\n`
  csvContent += `三、出圃明细\n`
  csvContent += `申请单号,树种,龄级,数量(株),用途,造林地块,状态,申请日期\n`
  approvedOutbounds.forEach(item => {
    csvContent += `${item.requestNo},${getSpeciesLabel(item.species)},${getAgeClassLabel(item.ageClass)},${item.quantity},${item.purpose},${item.plotNo},${getStatusLabel(item.status)},${item.applyDate}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${year}年度苗圃供应汇总报表.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('年度报表导出成功！')
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
.analysis-chart {
  height: 400px;
}
.analysis-stat {
  padding: 15px;
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

.check-print {
  background: #fff;
  padding: 20px;
}

.check-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #333;
  padding-bottom: 15px;
}

.check-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.check-no {
  color: #606266;
  margin: 0;
}

.check-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.check-table td {
  border: 1px solid #dcdfe6;
  padding: 10px 15px;
  font-size: 14px;
}

.check-table .label {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.diff-positive {
  color: #67c23a;
  font-weight: 600;
}

.diff-negative {
  color: #f56c6c;
  font-weight: 600;
}

.check-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.sign-item {
  text-align: center;
}

.sign-item p {
  margin: 5px 0;
  color: #606266;
}

.mb-20 {
  margin-bottom: 20px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}
</style>
