<template>
  <el-container class="main-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="28" color="#409eff"><Tree /></el-icon>
        <span class="logo-text">林场苗圃管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409eff"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="current-page">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <el-badge :value="reminderCount" :hidden="reminderCount === 0" class="reminder-badge">
            <el-button type="primary" link @click="showReminders = true">
              <el-icon size="20"><Bell /></el-icon>
            </el-button>
          </el-badge>
          <span class="user-name">管理员</span>
          <el-avatar :size="32" class="avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <el-drawer v-model="showReminders" title="提醒事项" size="400px">
      <el-empty v-if="reminders.length === 0" description="暂无提醒" />
      <div v-else class="reminder-list">
        <div
          v-for="item in reminders"
          :key="item.id"
          class="reminder-item"
          :class="[`priority-${item.priority}`]"
        >
          <div class="reminder-title">
            <el-icon v-if="item.priority === 'high'" color="#f56c6c"><Warning /></el-icon>
            <el-icon v-else color="#e6a23c"><InfoFilled /></el-icon>
            <span>{{ item.title }}</span>
          </div>
          <div class="reminder-content">{{ item.content }}</div>
          <div class="reminder-time">{{ item.remindTime }}</div>
        </div>
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { STORES, getList } from '@/utils/db'

const route = useRoute()
const showReminders = ref(false)
const reminders = ref([])

const menuRoutes = computed(() => {
  return route.matched[0]?.children.filter(r => r.meta?.title) || []
})

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta?.title || '')

const reminderCount = computed(() => reminders.value.filter(r => r.status === 'pending').length)

const loadReminders = async () => {
  reminders.value = await getList(STORES.REMINDERS)
}

onMounted(() => {
  loadReminders()
})
</script>

<style scoped>
.main-container {
  height: 100%;
}

.sidebar {
  background: #001529;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(64, 158, 255, 0.2);
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 60px;
}

.header-left .current-page {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  color: #606266;
}

.avatar {
  background: #409eff;
  color: #fff;
}

.main-content {
  background: #f0f2f5;
  padding: 0;
  overflow: hidden;
}

.reminder-badge {
  margin-right: 10px;
}

.reminder-list {
  padding: 0 10px;
}

.reminder-item {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: #f5f7fa;
  border-left: 4px solid #409eff;
}

.reminder-item.priority-high {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.reminder-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.reminder-content {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.reminder-time {
  color: #909399;
  font-size: 12px;
}
</style>
