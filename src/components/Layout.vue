<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="header-left">
        <el-image src="/favicon.ico" alt="logo" class="logo-img" fit="contain" />
        <el-text size="large" tag="b" class="logo-text">智慧社区服务平台</el-text>
        <i
          class="iconfont collapse-btn"
          @click="isCollapse = !isCollapse"
          v-html="isCollapse ? '&#xea8f;' : '&#xea8e;'"
        ></i>
      </div>
      <el-autocomplete
        v-model="searchKeyword"
        class="menu-search"
        style="width: 240px; flex-shrink: 0"
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
        <ThemeToggle />
        <UserDropdown />
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
        <el-menu :default-active="route.path" :collapse="isCollapse" unique-opened router>
          <template v-for="menu in menuStore.menuList" :key="menu.path">
            <el-sub-menu v-if="menu.children?.length" :index="menu.path">
              <template #title>
                <i v-if="menu.meta?.icon" class="iconfont menu-icon" :class="menu.meta.icon"></i>
                <span>{{ menu.meta?.title || menu.name }}</span>
              </template>
              <template v-for="child in menu.children" :key="child.path">
                <el-menu-item v-if="!child.meta?.isLink" :index="child.path">
                  <i v-if="child.meta?.icon" class="iconfont menu-icon" :class="child.meta.icon"></i>
                  <span>{{ child.meta?.title || child.name }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <el-menu-item v-else-if="!menu.meta?.isLink" :index="menu.path">
              <i v-if="menu.meta?.icon" class="iconfont menu-icon" :class="menu.meta.icon"></i>
              <span>{{ menu.meta?.title || menu.name }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main class="layout-main">
          <TabView />
          <div class="layout-content">
            <RouterView />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup>
import TabView from '@/components/TabView.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import { useMenuStore } from '@/stores/menu'
import { Search } from '@element-plus/icons-vue'
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
  flex-direction: column;

  .layout-header {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--el-border-color);
    background:
      url('@/assets/images/top-bg.png') no-repeat left center / auto 100%,
      linear-gradient(221deg, #4f8aff, #3d50f1);
    height: 60px;
    flex-shrink: 0;
    color: #fff;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-right: auto;
    }

    .logo-img {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 20px;
      white-space: nowrap;
      color: #fff;
    }

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #fff;

      &:hover {
        color: #e6f0ff;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-search {
      :deep(.el-input__inner) {
        color: #fff;

        &::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      }

      :deep(.el-input__prefix),
      :deep(.el-input__suffix) {
        color: #fff;
      }
    }
  }

  .layout-aside {
    transition: width 0.3s;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);
    display: flex;
    flex-direction: column;

    .el-menu {
      border-right: none;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      padding: 4px 0;

      &::-webkit-scrollbar {
        width: 0;
      }

      // 菜单项通用样式（宽度留白 + 圆角 + 高度）
      .el-menu-item,
      :deep(.el-sub-menu__title) {
        width: calc(100% - 16px);
        height: 42px;
        margin-left: 8px;
        margin-bottom: 4px;
        line-height: 42px;
        border-radius: 6px;
        font-size: var(--var-font-size-base);

        span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      // hover 态（非选中项）
      .el-menu-item:not(.is-active):hover,
      :deep(.el-sub-menu__title:hover) {
        background-color: var(--var-bg-hover);
      }

      // active 态
      .el-menu-item.is-active {
        color: #4b5eff;
        font-weight: var(--var-font-weight-medium);
        background-color: #eef3ff;
      }

      // 右侧展开箭头颜色
      :deep(.el-sub-menu__icon-arrow) {
        color: var(--var-text-secondary);
      }
    }

    .menu-icon {
      margin-right: 8px;
      font-size: 20px;
      vertical-align: middle;
    }
  }

  .layout-main {
    background: #fafbfc;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .layout-content {
      padding: 12px;
      flex: 1;
      min-height: 0;
      overflow: hidden;
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

<style>
.layout-header .el-input__wrapper {
  background-color: #fff !important;
  box-shadow: none !important;
  border-radius: 50px !important;
}

.layout-header .el-input__wrapper:hover,
.layout-header .el-input__wrapper.is-focus {
  box-shadow: none !important;
}

.layout-header .el-input__inner {
  color: var(--el-text-color-regular, #606266);
}

.layout-header .el-input__inner::placeholder {
  color: var(--el-text-color-placeholder, #a8abb2);
}

.layout-header .el-input__prefix,
.layout-header .el-input__suffix {
  color: var(--el-text-color-regular, #606266);
}

/* 暗黑模式 */
html.dark .layout .layout-main {
  background: var(--el-bg-color-page) !important;
}
</style>
