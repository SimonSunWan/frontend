<template>
  <el-container class="layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo" :style="{ gap: isCollapse ? '0px' : '8px' }">
        <el-image src="/favicon.ico" alt="logo" class="logo-img" fit="contain" />
        <el-text
          size="large"
          tag="b"
          class="logo-text"
          :style="{ opacity: isCollapse ? 0 : 1, maxWidth: isCollapse ? '0px' : '200px' }"
          >管理系统</el-text
        >
      </div>
      <el-menu :default-active="route.path" :collapse="isCollapse" router>
        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/mine">个人中心</el-menu-item>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/role">角色管理</el-menu-item>
          <el-menu-item index="/system/dept">部门管理</el-menu-item>
          <el-menu-item index="/system/menu">菜单管理</el-menu-item>
          <el-menu-item index="/system/dict">字典管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="header-right">
          <UserDropdown />
        </div>
      </el-header>
      <el-main class="layout-main">
        <TabView />
        <div class="layout-content">
          <RouterView />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import TabView from '@/components/TabView.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import { Expand, Fold, Setting } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;

  .layout-aside {
    transition: width 0.3s;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);

    .logo {
      height: 60px;
      display: flex;
      padding-left: 20px;
      align-items: center;
      gap: 8px;
      transition: gap 0.3s;

      .logo-img {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .logo-text {
        white-space: nowrap;
        overflow: hidden;
        transition:
          opacity 0.3s,
          max-width 0.3s;
      }
    }

    .el-menu {
      border-right: none;
    }
  }

  .layout-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color);
    background: #fff;

    .collapse-btn {
      font-size: 22px;
      cursor: pointer;
      color: #606266;

      &:hover {
        color: #409eff;
      }
    }

    .header-right {
      margin-left: auto;
    }
  }

  .layout-main {
    background: #fafbfc;
    padding: 0;

    .layout-content {
      padding: 8px 16px 16px;
    }
  }
}
</style>
