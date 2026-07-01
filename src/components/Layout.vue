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
        <template v-for="menu in menuStore.menuList" :key="menu.path">
          <el-sub-menu v-if="menu.children?.length" :index="menu.path">
            <template #title>
              <span>{{ menu.meta?.title || menu.name }}</span>
            </template>
            <template v-for="child in menu.children" :key="child.path">
              <el-menu-item v-if="!child.meta?.isLink" :index="child.path">
                {{ child.meta?.title || child.name }}
              </el-menu-item>
            </template>
          </el-sub-menu>
          <el-menu-item v-else-if="!menu.meta?.isLink" :index="menu.path">
            {{ menu.meta?.title || menu.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <el-autocomplete
          v-model="searchKeyword"
          class="menu-search"
          style="width: 240px; flex-shrink: 0; margin-left: auto"
          placeholder="搜索菜单"
          :fetch-suggestions="searchMenu"
          clearable
          @select="handleSearchSelect"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #default="{ item }">
            <div class="search-item">
              <span class="search-item-title">{{ item.title }}</span>
              <span class="search-item-path">{{ item.path }}</span>
            </div>
          </template>
        </el-autocomplete>
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
import { useMenuStore } from '@/stores/menu'
import { Expand, Fold, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const isCollapse = ref(false)
const searchKeyword = ref('')

// 递归收集所有可跳转的叶子菜单
const flattenMenus = (list, result = []) => {
  list.forEach((item) => {
    if (item.meta?.isLink) return
    if (item.children?.length) {
      flattenMenus(item.children, result)
    } else if (item.path) {
      result.push({
        title: item.meta?.title || item.name,
        path: item.path,
      })
    }
  })
  return result
}

const searchMenu = (query, cb) => {
  if (!query) {
    cb([])
    return
  }
  const all = flattenMenus(menuStore.menuList)
  const results = all.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  )
  cb(results)
}

const handleSearchSelect = (item) => {
  if (item.path) {
    router.push(item.path)
    searchKeyword.value = ''
  }
}
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
    gap: 16px;
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
    }
  }

  .layout-main {
    background: #fafbfc;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .layout-content {
      padding: 8px 16px 16px;
      flex: 1;
      overflow-y: auto;
    }
  }
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .search-item-title {
    color: var(--el-text-color-primary);
  }

  .search-item-path {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}
</style>
