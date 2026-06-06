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
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #409eff;">
          <div class="label">本月调拨单</div>
          <div class="value" style="color: #409eff;">{{ stats.allocationCount }}</div>
          <div class="unit">单</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #67c23a;">
          <div class="label">调拨苗木总数</div>
          <div class="value" style="color: #67c23a;">{{ stats.totalSeedlings }}</div>
          <div class="unit">株</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #e6a23c;">
          <div class="label">运输中</div>
          <div class="value" style="color: #e6a23c;">{{ stats.transportingCount }}</div>
          <div class="unit">单</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="border-top: 4px solid #f56c6c;">
          <div class="label">异常单</div>
          <div class="value" style="color: #f56c6c;">{{ stats.abnormalCount }}</div>
          <div class="unit">单</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="mb-20">
      <el-tab-pane label="调拨管理" name="allocation">
        <div class="card-section">
          <el-form :inline="true" :model="allocationQuery" class="query-form">
            <el-form-item label="状态">
              <el-select v-model="allocationQuery.status" placeholder="全部" clearable style="width: 130px">
                <el-option label="待运输" value="pending" />
                <el-option label="运输中" value="transporting" />
                <el-option label="已完成" value="completed" />
                <el-option label="异常" value="abnormal" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
            <el-form-item label="树种">
              <el-select v-model="allocationQuery.species" placeholder="全部" clearable style="width: 130px">
                <el-option v-for="item in TREE_SPECIES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="调入地块">
              <el-select v-model="allocationQuery.toPlot" placeholder="全部" clearable style="width: 150px">
                <el-option v-for="plot in plots" :key="plot.id" :label="plot.plotNo" :value="plot.plotNo" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="allocationQuery.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadAllocationOrders">查询</el-button>
              <el-button @click="resetAllocationQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="card-section">
          <el-table :data="filteredAllocations" stripe border style="width: 100%">
            <el-table-column prop="allocationNo" label="调拨单号" width="160" />
            <el-table-column prop="outboundRequestNo" label="出圃申请号" width="160">
              <template #default="{ row }">
                <span v-if="row.outboundRequestNo" style="color: #409eff;">{{ row.outboundRequestNo }}</span>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="species" label="树种" width="80">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="80">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="调拨数量" width="100" />
            <el-table-column prop="arrivedCount" label="实到数量" width="100">
              <template #default="{ row }">
                <span v-if="row.arrivedCount !== undefined && row.arrivedCount !== null">
                  {{ row.arrivedCount }}
                </span>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="fromLocation" label="调出地点" width="120" />
            <el-table-column prop="toPlot" label="调入地块" width="120" />
            <el-table-column prop="allocationDate" label="调拨日期" width="110" />
            <el-table-column prop="transporter" label="运输负责人" width="100" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'pending'" type="warning">待运输</el-tag>
                <el-tag v-else-if="row.status === 'transporting'" type="primary">运输中</el-tag>
                <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
                <el-tag v-else-if="row.status === 'abnormal'" type="danger">异常</el-tag>
                <el-tag v-else-if="row.status === 'cancelled'" type="info">已取消</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lossCount" label="损耗(株)" width="90">
              <template #default="{ row }">
                <span v-if="row.lossCount > 0" style="color: #f56c6c; font-weight: 600;">
                  {{ row.lossCount }}
                </span>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewAllocationDetail(row)">详情</el-button>
                <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="startTransport(row)">发运</el-button>
                <el-button v-if="row.status === 'transporting'" type="warning" link size="small" @click="completeAllocation(row)">完成</el-button>
                <el-button v-if="row.status === 'transporting'" type="danger" link size="small" @click="reportAbnormal(row)">异常</el-button>
                <el-button v-if="row.status === 'abnormal'" type="success" link size="small" @click="handleAbnormal(row)">处理</el-button>
                <el-button type="info" link size="small" @click="viewFlowLog(row)">流转记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="出圃申请" name="outbound">
        <div class="card-section">
          <el-table :data="outboundRequests" stripe border style="width: 100%">
            <el-table-column prop="requestNo" label="申请单号" width="160" />
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="applyDate" label="申请日期" width="110" />
            <el-table-column prop="species" label="树种" width="80">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="ageClass" label="龄级" width="80">
              <template #default="{ row }">{{ getAgeClassLabel(row.ageClass) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量(株)" width="100" />
            <el-table-column prop="purpose" label="用途" width="100" />
            <el-table-column prop="plotNo" label="造林地块" width="120" />
            <el-table-column prop="status" label="申请状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getRequestStatusTag(row.status).type">
                  {{ getRequestStatusTag(row.status).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="allocationNo" label="关联调拨单" width="140">
              <template #default="{ row }">
                <span v-if="row.allocationNo" style="color: #409eff; cursor: pointer;" @click="viewAllocationByNo(row.allocationNo)">{{ row.allocationNo }}</span>
                <span v-else style="color: #909399;">未生成</span>
              </template>
            </el-table-column>
            <el-table-column label="调拨状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.allocationStatus === 'pending'" type="warning" size="small">待运输</el-tag>
                <el-tag v-else-if="row.allocationStatus === 'transporting'" type="primary" size="small">运输中</el-tag>
                <el-tag v-else-if="row.allocationStatus === 'completed'" type="success" size="small">已完成</el-tag>
                <el-tag v-else-if="row.allocationStatus === 'abnormal'" type="danger" size="small">异常</el-tag>
                <el-tag v-else-if="row.allocationStatus === 'cancelled'" type="info" size="small">已取消</el-tag>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="arrivedCount" label="实到数量" width="90">
              <template #default="{ row }">
                <span v-if="row.arrivedCount !== undefined && row.arrivedCount !== null">{{ row.arrivedCount }}</span>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="lossCount" label="损耗数量" width="90">
              <template #default="{ row }">
                <span v-if="row.lossCount > 0" style="color: #f56c6c;">{{ row.lossCount }}</span>
                <span v-else-if="row.lossCount === 0 && row.allocationStatus === 'completed'">0</span>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="completeTime" label="完成时间" width="160">
              <template #default="{ row }">
                <span v-if="row.completeTime">{{ row.completeTime }}</span>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'approved' && !row.allocationNo"
                  type="success"
                  link
                  size="small"
                  @click="generateAllocationFromOutbound(row)"
                >
                  生成调拨单
                </el-button>
                <el-button v-if="row.allocationNo" type="primary" link size="small" @click="viewAllocationByNo(row.allocationNo)">
                  查看调拨
                </el-button>
                <el-button type="info" link size="small" @click="viewOutboundDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="领用记录" name="receive">
        <div class="card-section">
          <el-table :data="receiveRecords" stripe border style="width: 100%">
            <el-table-column prop="receiveNo" label="领用单号" width="160" />
            <el-table-column prop="receiver" label="领用人" width="100" />
            <el-table-column prop="materialName" label="物资名称" width="150" />
            <el-table-column prop="materialType" label="类型" width="100">
              <template #default="{ row }">{{ getMaterialTypeLabel(row.materialType) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="purpose" label="用途" width="150" />
            <el-table-column prop="receiveDate" label="领用日期" width="110" />
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
            <el-table-column prop="lossNo" label="记录编号" width="160" />
            <el-table-column prop="allocationNo" label="关联调拨单" width="160" />
            <el-table-column prop="species" label="树种" width="80">
              <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
            </el-table-column>
            <el-table-column prop="lossCount" label="损耗数量" width="100" />
            <el-table-column prop="lossReason" label="损耗原因" min-width="200" />
            <el-table-column prop="recordDate" label="记录日期" width="110" />
            <el-table-column prop="handler" label="处理人" width="100" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新建调拨单 -->
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
                <el-option v-for="plot in plots" :key="plot.id" :label="`${plot.plotNo} (${plot.location})`" :value="plot.plotNo" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="调拨日期">
              <el-date-picker v-model="allocationForm.allocationDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
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

    <!-- 完成调拨 -->
    <el-dialog v-model="completeVisible" title="完成调拨确认" width="550px">
      <el-form :model="completeForm" label-width="110px">
        <el-form-item label="调拨单号">
          <el-input v-model="completeForm.allocationNo" disabled />
        </el-form-item>
        <el-form-item label="原调拨数量">
          <el-input v-model="completeForm.quantity" disabled />
        </el-form-item>
        <el-form-item label="实际到达数量">
          <el-input-number v-model="completeForm.arrivedCount" :min="0" :max="completeForm.quantity" style="width: 100%" @change="onArrivedCountChange" />
        </el-form-item>
        <el-form-item label="损耗数量">
          <el-input-number v-model="completeForm.lossCount" :min="0" :max="completeForm.quantity" style="width: 100%" @change="onLossCountChange" />
        </el-form-item>
        <el-form-item label="损耗原因">
          <el-select v-model="completeForm.lossReason" style="width: 100%">
            <el-option label="机械损伤" value="机械损伤" />
            <el-option label="高温脱水" value="高温脱水" />
            <el-option label="冻害" value="冻害" />
            <el-option label="病虫害" value="病虫害" />
            <el-option label="丢失" value="丢失" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="completeForm.remark" type="textarea" :rows="2" placeholder="请补充说明损耗情况" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmComplete">确认完成</el-button>
      </template>
    </el-dialog>

    <!-- 异常登记 -->
    <el-dialog v-model="abnormalVisible" title="运输异常登记" width="550px">
      <el-form :model="abnormalForm" label-width="110px">
        <el-form-item label="调拨单号">
          <el-input v-model="abnormalForm.allocationNo" disabled />
        </el-form-item>
        <el-form-item label="异常原因">
          <el-select v-model="abnormalForm.abnormalReason" style="width: 100%">
            <el-option label="车辆故障" value="车辆故障" />
            <el-option label="道路中断" value="道路中断" />
            <el-option label="天气原因" value="天气原因" />
            <el-option label="苗木大面积受损" value="苗木大面积受损" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="异常描述">
          <el-input v-model="abnormalForm.abnormalDesc" type="textarea" :rows="3" placeholder="请详细描述异常情况" />
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="abnormalForm.handler" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="abnormalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAbnormal">确认登记</el-button>
      </template>
    </el-dialog>

    <!-- 异常处理 -->
    <el-dialog v-model="handleAbnormalVisible" title="异常处理" width="600px">
      <el-descriptions :column="2" border size="small" class="mb-20">
        <el-descriptions-item label="调拨单号">{{ currentAbnormal?.allocationNo }}</el-descriptions-item>
        <el-descriptions-item label="异常原因">{{ currentAbnormal?.abnormalReason }}</el-descriptions-item>
        <el-descriptions-item label="树种">{{ getSpeciesLabel(currentAbnormal?.species) }}</el-descriptions-item>
        <el-descriptions-item label="调拨数量">{{ currentAbnormal?.quantity }} 株</el-descriptions-item>
        <el-descriptions-item label="异常描述" :span="2">{{ currentAbnormal?.abnormalDesc }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="handleAbnormalForm" label-width="110px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="handleAbnormalForm.handleType">
            <el-radio label="continue">继续运输</el-radio>
            <el-radio label="partial">部分完成</el-radio>
            <el-radio label="cancel">取消调拨</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="handleAbnormalForm.handleType === 'partial'">
          <el-form-item label="实际到达数量">
            <el-input-number v-model="handleAbnormalForm.arrivedCount" :min="0" :max="currentAbnormal?.quantity || 0" style="width: 100%" @change="onPartialArrivedChange" />
          </el-form-item>
          <el-form-item label="损耗数量">
            <el-input-number v-model="handleAbnormalForm.lossCount" :min="0" :max="currentAbnormal?.quantity || 0" style="width: 100%" @change="onPartialLossChange" />
          </el-form-item>
          <el-form-item label="损耗原因">
            <el-select v-model="handleAbnormalForm.lossReason" style="width: 100%">
              <el-option label="机械损伤" value="机械损伤" />
              <el-option label="高温脱水" value="高温脱水" />
              <el-option label="冻害" value="冻害" />
              <el-option label="病虫害" value="病虫害" />
              <el-option label="丢失" value="丢失" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="处理说明">
          <el-input v-model="handleAbnormalForm.handleResult" type="textarea" :rows="2" placeholder="请填写处理说明" />
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="handleAbnormalForm.handler" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleAbnormalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandleAbnormal">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 出圃申请详情 -->
    <el-dialog v-model="showOutboundDetail" title="出圃申请详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请单号">{{ currentOutbound?.requestNo }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ currentOutbound?.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentOutbound?.applicant }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getRequestStatusTag(currentOutbound?.status).type">
            {{ getRequestStatusTag(currentOutbound?.status).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="树种">{{ getSpeciesLabel(currentOutbound?.species) }}</el-descriptions-item>
        <el-descriptions-item label="龄级">{{ getAgeClassLabel(currentOutbound?.ageClass) }}</el-descriptions-item>
        <el-descriptions-item label="申请数量">{{ currentOutbound?.quantity }} 株</el-descriptions-item>
        <el-descriptions-item label="造林地块">{{ currentOutbound?.plotNo }}</el-descriptions-item>
        <el-descriptions-item label="用途">{{ currentOutbound?.purpose }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOutbound?.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider v-if="currentOutbound?.allocationNo">调拨执行情况</el-divider>
      <el-descriptions v-if="currentOutbound?.allocationNo" :column="2" border>
        <el-descriptions-item label="关联调拨单">{{ currentOutbound?.allocationNo }}</el-descriptions-item>
        <el-descriptions-item label="调拨状态">
          <el-tag v-if="currentOutbound?.allocationStatus === 'pending'" type="warning">待运输</el-tag>
          <el-tag v-else-if="currentOutbound?.allocationStatus === 'transporting'" type="primary">运输中</el-tag>
          <el-tag v-else-if="currentOutbound?.allocationStatus === 'completed'" type="success">已完成</el-tag>
          <el-tag v-else-if="currentOutbound?.allocationStatus === 'abnormal'" type="danger">异常</el-tag>
          <el-tag v-else-if="currentOutbound?.allocationStatus === 'cancelled'" type="info">已取消</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="实到数量">{{ currentOutbound?.arrivedCount !== undefined && currentOutbound?.arrivedCount !== null ? currentOutbound.arrivedCount + ' 株' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="损耗数量">
          <span v-if="currentOutbound?.lossCount > 0" style="color: #f56c6c;">{{ currentOutbound.lossCount }} 株</span>
          <span v-else-if="currentOutbound?.allocationStatus === 'completed'">0 株</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="完成时间" :span="2">{{ currentOutbound?.completeTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showOutboundDetail = false">关闭</el-button>
        <el-button v-if="currentOutbound?.allocationNo" type="primary" @click="viewAllocationByNo(currentOutbound.allocationNo); showOutboundDetail = false">
          查看调拨单
        </el-button>
      </template>
    </el-dialog>

    <!-- 调拨单详情 -->
    <el-dialog v-model="showAllocationDetail" title="调拨单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="调拨单号">{{ currentAllocationDetail?.allocationNo }}</el-descriptions-item>
        <el-descriptions-item label="调拨日期">{{ currentAllocationDetail?.allocationDate }}</el-descriptions-item>
        <el-descriptions-item label="树种">{{ getSpeciesLabel(currentAllocationDetail?.species) }}</el-descriptions-item>
        <el-descriptions-item label="龄级">{{ getAgeClassLabel(currentAllocationDetail?.ageClass) }}</el-descriptions-item>
        <el-descriptions-item label="调拨数量">{{ currentAllocationDetail?.quantity }} 株</el-descriptions-item>
        <el-descriptions-item label="调出地点">{{ currentAllocationDetail?.fromLocation }}</el-descriptions-item>
        <el-descriptions-item label="调入地块">{{ currentAllocationDetail?.toPlot }}</el-descriptions-item>
        <el-descriptions-item label="运输负责人">{{ currentAllocationDetail?.transporter || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentAllocationDetail?.status === 'pending'" type="warning">待运输</el-tag>
          <el-tag v-else-if="currentAllocationDetail?.status === 'transporting'" type="primary">运输中</el-tag>
          <el-tag v-else-if="currentAllocationDetail?.status === 'completed'" type="success">已完成</el-tag>
          <el-tag v-else-if="currentAllocationDetail?.status === 'abnormal'" type="danger">异常</el-tag>
          <el-tag v-else-if="currentAllocationDetail?.status === 'cancelled'" type="info">已取消</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="实到数量" v-if="currentAllocationDetail?.status === 'completed' || currentAllocationDetail?.arrivedCount !== null">
          {{ currentAllocationDetail?.arrivedCount !== undefined && currentAllocationDetail?.arrivedCount !== null ? currentAllocationDetail.arrivedCount + ' 株' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="损耗数量" v-if="currentAllocationDetail?.status === 'completed' || currentAllocationDetail?.lossCount > 0">
          <span v-if="currentAllocationDetail?.lossCount > 0" style="color: #f56c6c;">{{ currentAllocationDetail.lossCount }} 株</span>
          <span v-else-if="currentAllocationDetail?.status === 'completed'">0 株</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="损耗原因" v-if="currentAllocationDetail?.lossReason">
          {{ currentAllocationDetail.lossReason }}
        </el-descriptions-item>
        <el-descriptions-item label="异常原因" v-if="currentAllocationDetail?.abnormalReason" :span="2">
          <span style="color: #f56c6c;">【{{ currentAllocationDetail.abnormalReason }}】{{ currentAllocationDetail.abnormalDesc }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="关联出圃申请" v-if="currentAllocationDetail?.outboundRequestNo">
          {{ currentAllocationDetail.outboundRequestNo }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentAllocationDetail?.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showAllocationDetail = false">关闭</el-button>
        <el-button type="primary" @click="showAllocationDetail = false; viewFlowLog(currentAllocationDetail)">
          查看流转记录
        </el-button>
      </template>
    </el-dialog>

    <!-- 选择调拨单打印 -->
    <el-dialog v-model="showSelectAllocation" title="选择调拨单打印运输清单" width="650px">
      <el-table :data="allocationOrders" stripe border height="350" @row-click="onSelectAllocation" highlight-current-row>
        <el-table-column prop="allocationNo" label="调拨单号" width="160" />
        <el-table-column prop="species" label="树种" width="80">
          <template #default="{ row }">{{ getSpeciesLabel(row.species) }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量(株)" width="100" />
        <el-table-column prop="arrivedCount" label="实到(株)" width="90">
          <template #default="{ row }">{{ row.arrivedCount || '-' }}</template>
        </el-table-column>
        <el-table-column prop="toPlot" label="调入地块" min-width="120" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待运输</el-tag>
            <el-tag v-else-if="row.status === 'transporting'" type="primary">运输中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else type="danger">异常</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-20" style="text-align: right;">
        <el-button @click="showSelectAllocation = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 运输清单预览 -->
    <el-dialog v-model="showTransportPreview" title="运输清单预览" width="850px">
      <div id="transport-list-print" class="transport-print">
        <div class="print-header">
          <h2>苗木运输清单</h2>
          <p class="print-no">单号：{{ transportData.allocationNo }}</p>
        </div>
        <table class="print-table">
          <tr>
            <td width="18%" class="label">调拨单号</td>
            <td width="32%">{{ transportData.allocationNo }}</td>
            <td width="18%" class="label">打印日期</td>
            <td width="32%">{{ dayjs().format('YYYY-MM-DD') }}</td>
          </tr>
          <tr>
            <td class="label">树种</td>
            <td>{{ getSpeciesLabel(transportData.species) }}</td>
            <td class="label">龄级</td>
            <td>{{ getAgeClassLabel(transportData.ageClass) }}</td>
          </tr>
          <tr>
            <td class="label">调拨数量</td>
            <td>{{ transportData.quantity }} 株</td>
            <td class="label">调出地点</td>
            <td>{{ transportData.fromLocation }}</td>
          </tr>
          <tr>
            <td class="label">调入地块</td>
            <td>{{ transportData.toPlot }}</td>
            <td class="label">调拨日期</td>
            <td>{{ transportData.allocationDate }}</td>
          </tr>
          <tr>
            <td class="label">运输负责人</td>
            <td>{{ transportData.transporter || '-' }}</td>
            <td class="label">联系电话</td>
            <td>{{ transportData.phone || '-' }}</td>
          </tr>
          <tr v-if="transportData.status === 'completed' || transportData.arrivedCount !== undefined">
            <td class="label">实际到达</td>
            <td>{{ transportData.arrivedCount !== undefined ? transportData.arrivedCount + ' 株' : '-' }}</td>
            <td class="label">损耗数量</td>
            <td>
              <span :style="{ color: (transportData.lossCount || 0) > 0 ? '#f56c6c' : '#67c23a', fontWeight: 600 }">
                {{ transportData.lossCount || 0 }} 株
              </span>
            </td>
          </tr>
          <tr v-if="transportData.status === 'completed' && transportData.lossReason">
            <td class="label">损耗原因</td>
            <td colspan="3">{{ transportData.lossReason }}</td>
          </tr>
          <tr v-if="transportData.abnormalReason">
            <td class="label">异常情况</td>
            <td colspan="3" style="color: #f56c6c;">
              {{ transportData.abnormalReason }}：{{ transportData.abnormalDesc }}
            </td>
          </tr>
          <tr>
            <td class="label">备注</td>
            <td colspan="3">{{ transportData.remark || '无' }}</td>
          </tr>
        </table>
        <div class="print-footer">
          <div class="sign-item">
            <p>发货人签字：_______________</p>
          </div>
          <div class="sign-item">
            <p>收货人签字：_______________</p>
          </div>
          <div class="sign-item">
            <p>日期：_______________</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTransportPreview = false">关闭</el-button>
        <el-button type="primary" @click="doPrintTransport">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </template>
    </el-dialog>

    <!-- 流转记录 -->
    <el-dialog v-model="showFlowLog" title="流转记录" width="600px">
      <el-timeline v-if="currentFlowLogs.length > 0">
        <el-timeline-item
          v-for="(log, index) in currentFlowLogs"
          :key="index"
          :timestamp="log.time"
          :type="log.type"
          :color="log.color"
        >
          <h4 style="margin-bottom: 5px;">{{ log.title }}</h4>
          <p style="color: #606266; margin: 0 0 5px 0;">{{ log.content }}</p>
          <p v-if="log.operator" style="color: #909399; font-size: 12px; margin: 0;">操作人：{{ log.operator }}</p>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无流转记录" />
    </el-dialog>

    <!-- 领用登记 -->
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
              <el-date-picker v-model="receiveForm.receiveDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
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

    <!-- 新增地块 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORES, getList, addItem, updateItem, getItemById } from '@/utils/db'
import {
  TREE_SPECIES, AGE_CLASSES, MATERIAL_TYPES, REQUEST_STATUSES,
  getSpeciesLabel, getAgeClassLabel, getMaterialTypeLabel, getStatusTag,
  generateBatchNo, generateId
} from '@/utils/constants'
import dayjs from 'dayjs'

const activeTab = ref('allocation')
const allocationOrders = ref([])
const outboundRequests = ref([])
const receiveRecords = ref([])
const plots = ref([])
const materials = ref([])
const lossRecords = ref([])

const showAllocationForm = ref(false)
const showReceiveForm = ref(false)
const showPlotForm = ref(false)
const completeVisible = ref(false)
const abnormalVisible = ref(false)
const handleAbnormalVisible = ref(false)
const showSelectAllocation = ref(false)
const showTransportPreview = ref(false)
const showFlowLog = ref(false)
const showOutboundDetail = ref(false)
const showAllocationDetail = ref(false)
const currentAllocation = ref(null)
const currentAbnormal = ref(null)
const currentOutbound = ref(null)
const currentAllocationDetail = ref(null)
const transportData = ref({})
const currentFlowLogs = ref([])

const allocationQuery = ref({
  status: '',
  species: '',
  toPlot: '',
  dateRange: []
})

const filteredAllocations = computed(() => {
  return allocationOrders.value.filter(item => {
    const matchStatus = !allocationQuery.value.status || item.status === allocationQuery.value.status
    const matchSpecies = !allocationQuery.value.species || item.species === allocationQuery.value.species
    const matchPlot = !allocationQuery.value.toPlot || item.toPlot === allocationQuery.value.toPlot
    let matchDate = true
    if (allocationQuery.value.dateRange && allocationQuery.value.dateRange.length === 2) {
      const start = dayjs(allocationQuery.value.dateRange[0])
      const end = dayjs(allocationQuery.value.dateRange[1])
      const itemDate = dayjs(item.allocationDate)
      matchDate = itemDate.isAfter(start.subtract(1, 'day')) && itemDate.isBefore(end.add(1, 'day'))
    }
    return matchStatus && matchSpecies && matchPlot && matchDate
  })
})

const stats = computed(() => {
  const now = dayjs()
  const monthStart = now.startOf('month')
  return {
    allocationCount: allocationOrders.value.filter(a =>
      dayjs(a.allocationDate).isAfter(monthStart)
    ).length,
    totalSeedlings: allocationOrders.value.reduce((sum, a) => sum + a.quantity, 0),
    transportingCount: allocationOrders.value.filter(a => a.status === 'transporting').length,
    abnormalCount: allocationOrders.value.filter(a => a.status === 'abnormal').length
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
  remark: '',
  flowLogs: []
})

const completeForm = ref({
  id: '',
  allocationNo: '',
  quantity: 0,
  arrivedCount: 0,
  lossCount: 0,
  lossReason: '',
  remark: ''
})

const abnormalForm = ref({
  id: '',
  allocationNo: '',
  abnormalReason: '',
  abnormalDesc: '',
  handler: '',
  handleResult: ''
})

const handleAbnormalForm = ref({
  handleType: 'continue',
  arrivedCount: 0,
  lossCount: 0,
  lossReason: '',
  handleResult: '',
  handler: ''
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

const getRequestStatusTag = (status) => {
  return getStatusTag(status, REQUEST_STATUSES)
}

const loadAllocationOrders = async () => {
  allocationOrders.value = await getList(STORES.ALLOCATION_ORDERS)
}

const updateOutboundFromAllocation = async (allocation) => {
  if (!allocation.outboundRequestId) return
  const updateData = {
    allocationStatus: allocation.status
  }
  if (allocation.status === 'completed') {
    updateData.arrivedCount = allocation.arrivedCount
    updateData.lossCount = allocation.lossCount
    updateData.completeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  if (allocation.status === 'cancelled') {
    updateData.arrivedCount = 0
    updateData.lossCount = 0
    updateData.completeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await updateItem(STORES.OUTBOUND_REQUESTS, allocation.outboundRequestId, updateData)
}

const loadData = async () => {
  await loadAllocationOrders()
  outboundRequests.value = await getList(STORES.OUTBOUND_REQUESTS)
  receiveRecords.value = await getList(STORES.RECEIVE_RECORDS)
  plots.value = await getList(STORES.PLOTS)
  materials.value = await getList(STORES.MATERIALS)
  lossRecords.value = allocationOrders.value.filter(a => a.lossCount > 0).map(a => ({
    lossNo: `SH${a.allocationNo.slice(-8)}`,
    allocationNo: a.allocationNo,
    species: a.species,
    lossCount: a.lossCount,
    lossReason: a.lossReason || '未记录',
    recordDate: a.allocationDate,
    handler: a.transporter || '-'
  }))
}

const resetAllocationQuery = () => {
  allocationQuery.value = { status: '', species: '', toPlot: '', dateRange: [] }
  loadAllocationOrders()
}

const saveAllocation = async () => {
  if (!allocationForm.value.species || !allocationForm.value.quantity) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const newOrder = {
    ...allocationForm.value,
    id: generateId(),
    arrivedCount: null,
    lossReason: null,
    flowLogs: [{
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      title: '创建调拨单',
      content: `创建调拨单，数量：${allocationForm.value.quantity}株`,
      operator: '管理员',
      type: 'primary',
      color: '#409eff'
    }],
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await addItem(STORES.ALLOCATION_ORDERS, newOrder)
  ElMessage.success('调拨单创建成功')
  showAllocationForm.value = false
  loadData()
  allocationForm.value.allocationNo = generateBatchNo('DB')
}

const startTransport = async (row) => {
  const flowLogs = row.flowLogs || []
  flowLogs.push({
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    title: '开始运输',
    content: '苗木已从苗圃发出，正在运输途中',
    operator: '管理员',
    type: 'primary',
    color: '#409eff'
  })
  const updateData = {
    status: 'transporting',
    flowLogs
  }
  await updateItem(STORES.ALLOCATION_ORDERS, row.id, updateData)
  await updateOutboundFromAllocation({ ...row, ...updateData })
  ElMessage.success('已开始运输')
  loadData()
}

const completeAllocation = (row) => {
  currentAllocation.value = row
  completeForm.value = {
    id: row.id,
    allocationNo: row.allocationNo,
    quantity: row.quantity,
    arrivedCount: row.quantity,
    lossCount: 0,
    lossReason: '',
    remark: ''
  }
  completeVisible.value = true
}

const onArrivedCountChange = (val) => {
  completeForm.value.lossCount = completeForm.value.quantity - val
}

const onLossCountChange = (val) => {
  completeForm.value.arrivedCount = completeForm.value.quantity - val
}

const confirmComplete = async () => {
  if (!completeForm.value.lossReason && completeForm.value.lossCount > 0) {
    ElMessage.warning('存在损耗时请填写损耗原因')
    return
  }
  const flowLogs = currentAllocation.value.flowLogs || []
  flowLogs.push({
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    title: '运输完成',
    content: `到达${currentAllocation.value.toPlot}，实到${completeForm.value.arrivedCount}株，损耗${completeForm.value.lossCount}株${completeForm.value.lossReason ? `（${completeForm.value.lossReason}）` : ''}`,
    operator: '管理员',
    type: 'success',
    color: '#67c23a'
  })
  const updateData = {
    status: 'completed',
    arrivedCount: completeForm.value.arrivedCount,
    lossCount: completeForm.value.lossCount,
    lossReason: completeForm.value.lossReason,
    remark: completeForm.value.remark,
    flowLogs,
    completeTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  await updateItem(STORES.ALLOCATION_ORDERS, completeForm.value.id, updateData)
  await updateOutboundFromAllocation({ ...currentAllocation.value, ...updateData })
  ElMessage.success('调拨完成')
  completeVisible.value = false
  loadData()
}

const reportAbnormal = (row) => {
  currentAllocation.value = row
  abnormalForm.value = {
    id: row.id,
    allocationNo: row.allocationNo,
    abnormalReason: '',
    abnormalDesc: '',
    handler: '',
    handleResult: ''
  }
  abnormalVisible.value = true
}

const confirmAbnormal = async () => {
  if (!abnormalForm.value.abnormalReason || !abnormalForm.value.abnormalDesc) {
    ElMessage.warning('请填写异常原因和描述')
    return
  }
  const flowLogs = currentAllocation.value.flowLogs || []
  flowLogs.push({
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    title: '运输异常',
    content: `【${abnormalForm.value.abnormalReason}】${abnormalForm.value.abnormalDesc}`,
    operator: abnormalForm.value.handler || '管理员',
    type: 'danger',
    color: '#f56c6c'
  })
  const updateData = {
    status: 'abnormal',
    abnormalReason: abnormalForm.value.abnormalReason,
    abnormalDesc: abnormalForm.value.abnormalDesc,
    abnormalHandler: abnormalForm.value.handler,
    flowLogs
  }
  await updateItem(STORES.ALLOCATION_ORDERS, abnormalForm.value.id, updateData)
  await updateOutboundFromAllocation({ ...currentAllocation.value, ...updateData })
  ElMessage.success('异常已登记')
  abnormalVisible.value = false
  loadData()
}

const handleAbnormal = (row) => {
  currentAbnormal.value = row
  handleAbnormalForm.value = {
    handleType: 'continue',
    arrivedCount: row.quantity,
    lossCount: 0,
    lossReason: '',
    handleResult: '',
    handler: ''
  }
  handleAbnormalVisible.value = true
}

const onPartialArrivedChange = (val) => {
  handleAbnormalForm.value.lossCount = (currentAbnormal.value?.quantity || 0) - val
}

const onPartialLossChange = (val) => {
  handleAbnormalForm.value.arrivedCount = (currentAbnormal.value?.quantity || 0) - val
}

const confirmHandleAbnormal = async () => {
  const flowLogs = currentAbnormal.value.flowLogs || []
  let updateData = {}
  let newStatus = ''

  if (handleAbnormalForm.value.handleType === 'continue') {
    newStatus = 'transporting'
    flowLogs.push({
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      title: '异常处理-继续运输',
      content: `异常已排除，继续运输。${handleAbnormalForm.value.handleResult || ''}`,
      operator: handleAbnormalForm.value.handler || '管理员',
      type: 'primary',
      color: '#409eff'
    })
    updateData = {
      status: newStatus,
      flowLogs
    }
  } else if (handleAbnormalForm.value.handleType === 'partial') {
    if (!handleAbnormalForm.value.lossReason && handleAbnormalForm.value.lossCount > 0) {
      ElMessage.warning('存在损耗时请填写损耗原因')
      return
    }
    newStatus = 'completed'
    flowLogs.push({
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      title: '异常处理-部分完成',
      content: `异常后部分完成，实到${handleAbnormalForm.value.arrivedCount}株，损耗${handleAbnormalForm.value.lossCount}株${handleAbnormalForm.value.lossReason ? `（${handleAbnormalForm.value.lossReason}）` : ''}。${handleAbnormalForm.value.handleResult || ''}`,
      operator: handleAbnormalForm.value.handler || '管理员',
      type: 'warning',
      color: '#e6a23c'
    })
    updateData = {
      status: newStatus,
      arrivedCount: handleAbnormalForm.value.arrivedCount,
      lossCount: handleAbnormalForm.value.lossCount,
      lossReason: handleAbnormalForm.value.lossReason,
      completeTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      flowLogs
    }
  } else if (handleAbnormalForm.value.handleType === 'cancel') {
    newStatus = 'cancelled'
    flowLogs.push({
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      title: '异常处理-取消调拨',
      content: `因异常取消调拨。${handleAbnormalForm.value.handleResult || ''}`,
      operator: handleAbnormalForm.value.handler || '管理员',
      type: 'info',
      color: '#909399'
    })
    updateData = {
      status: newStatus,
      flowLogs
    }
  }

  await updateItem(STORES.ALLOCATION_ORDERS, currentAbnormal.value.id, updateData)
  await updateOutboundFromAllocation({ ...currentAbnormal.value, ...updateData })
  ElMessage.success('异常处理完成')
  handleAbnormalVisible.value = false
  loadData()
}

const viewAllocationDetail = (row) => {
  currentAllocationDetail.value = row
  showAllocationDetail.value = true
}

const viewOutboundDetail = (row) => {
  currentOutbound.value = row
  showOutboundDetail.value = true
}

const viewFlowLog = (row) => {
  currentFlowLogs.value = row.flowLogs || []
  showFlowLog.value = true
}

const printTransportList = () => {
  if (allocationOrders.value.length === 0) {
    ElMessage.warning('暂无调拨单数据')
    return
  }
  showSelectAllocation.value = true
}

const onSelectAllocation = (row) => {
  transportData.value = { ...row }
  showSelectAllocation.value = false
  showTransportPreview.value = true
}

const doPrintTransport = () => {
  const printContent = document.getElementById('transport-list-print')
  if (!printContent) return
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器弹窗设置')
    return
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>苗木运输清单</title>
      <style>
        body { font-family: 'Microsoft YaHei', sans-serif; padding: 20px; }
        .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .print-header h2 { margin: 0 0 10px 0; font-size: 24px; }
        .print-no { color: #666; margin: 0; }
        .print-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .print-table td { border: 1px solid #333; padding: 10px 15px; font-size: 14px; }
        .print-table .label { background: #f5f5f5; font-weight: 600; }
        .print-footer { display: flex; justify-content: space-between; margin-top: 50px; }
        .sign-item { text-align: center; }
        @media print { body { padding: 0; } }
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

const generateAllocationFromOutbound = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要为出圃申请 ${row.requestNo} 生成调拨单吗？\n将自动带出树种、数量、地块等信息。`,
      '生成确认',
      { type: 'info' }
    )
    const newAllocation = {
      id: generateId(),
      allocationNo: generateBatchNo('DB'),
      outboundRequestId: row.id,
      outboundRequestNo: row.requestNo,
      species: row.species,
      ageClass: row.ageClass,
      quantity: row.quantity,
      fromLocation: '中心苗圃',
      toPlot: row.plotNo,
      allocationDate: dayjs().format('YYYY-MM-DD'),
      transporter: '',
      phone: '',
      status: 'pending',
      arrivedCount: null,
      lossCount: 0,
      lossReason: null,
      remark: row.remark || '',
      purpose: row.purpose,
      flowLogs: [{
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        title: '由出圃申请生成',
        content: `关联出圃申请：${row.requestNo}`,
        operator: '管理员',
        type: 'primary',
        color: '#409eff'
      }],
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    await addItem(STORES.ALLOCATION_ORDERS, newAllocation)
    await updateItem(STORES.OUTBOUND_REQUESTS, row.id, {
      allocationNo: newAllocation.allocationNo,
      allocationId: newAllocation.id,
      allocationStatus: 'pending',
      arrivedCount: null,
      lossCount: null,
      completeTime: null
    })
    ElMessage.success('调拨单生成成功')
    loadData()
  } catch (e) {}
}

const viewAllocationByNo = (allocationNo) => {
  const target = allocationOrders.value.find(a => a.allocationNo === allocationNo)
  if (target) {
    viewAllocationDetail(target)
  }
}

const onReceiveMaterialChange = (materialId) => {
  const material = materials.value.find(m => m.id === materialId)
  if (material) {
    receiveForm.value.materialName = material.name
    receiveForm.value.materialType = material.type
    receiveForm.value.unit = material.unit
  }
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
  receiveForm.value.receiveNo = generateBatchNo('LY')
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

onMounted(async () => {
  await loadData()
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

.query-form {
  margin-bottom: 0;
}

.transport-print {
  background: #fff;
  padding: 20px;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #333;
  padding-bottom: 15px;
}

.print-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.print-no {
  color: #606266;
  margin: 0;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.print-table td {
  border: 1px solid #dcdfe6;
  padding: 10px 15px;
  font-size: 14px;
}

.print-table .label {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.print-footer {
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