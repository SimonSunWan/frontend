<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="header-left">
        <el-image src="/favicon.ico" alt="logo" class="logo-img" fit="contain" />
        <el-text size="large" tag="b" class="logo-text">INS DESIGN</el-text>
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
        <el-popover placement="bottom-end" trigger="hover" popper-class="user-dropdown-popper">
          <template #reference>
            <div class="user-info">
              <span class="user-name">{{ userStore.userInfo?.nickName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
          </template>
          <div class="user-menu">
            <div class="user-menu-item" @click="router.push('/system/mine')">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </div>
            <div class="user-menu-item" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出系统</span>
            </div>
          </div>
        </el-popover>
      </div>
    </el-header>
    <el-container class="layout-body">
      <el-aside :width="isCollapse ? '44px' : '220px'" class="layout-aside">
        <el-scrollbar>
          <el-menu :default-active="route.path" :collapse="isCollapse" unique-opened router>
            <InsMenuTree :menus="menuStore.menuList" />
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container class="layout-body">
        <el-main class="layout-main">
          <InsTabBar />
          <div class="layout-content">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" v-if="route.meta?.keepAlive" />
              </keep-alive>
              <component :is="Component" v-if="!route.meta?.keepAlive" />
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup>
import InsTabBar from '@/components/InsTabBar.vue'
import InsMenuTree from '@/components/InsMenuTree.vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { ArrowDown, Search, SwitchButton, User } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const userStore = useUserStore()
const isCollapse = ref(false)
const searchKeyword = ref('')

// 递归收集所有可跳转的叶子菜单
const flattenMenus = (list, result = []) => {
  list.forEach((item) => {
    if (item.meta?.isLink) return
    if (item.children?.length) {
      flattenMenus(item.children, result)
    } else if (item.path) {
      const title = item.meta?.title || item.name
      result.push({
        value: title,
        title,
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
  const results = all.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
  cb(results)
}

const handleSearchSelect = (item) => {
  if (item.path) {
    router.push(item.path)
    searchKeyword.value = ''
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  flex-direction: column;

  .layout-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    border-bottom: 1px solid var(--el-border-color);
    background:
      url('@/assets/images/layout-bg.png') no-repeat left center / auto 100%,
      var(--ins-gradient-brand);
    height: 60px;
    flex-shrink: 0;
    color: var(--ins-text-inverse);

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
      color: var(--ins-text-inverse);
    }

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: var(--ins-text-inverse);

      &:hover {
        color: var(--ins-color-primary-bg);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .user-info {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        color: var(--ins-text-inverse);

        .user-name {
          color: var(--ins-text-inverse);
          margin-right: 12px;
        }

        .el-icon {
          align-self: center;
        }
      }
    }

    .menu-search {
      :deep(.el-input__inner) {
        color: var(--ins-text-inverse);

        &::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      }

      :deep(.el-input__prefix),
      :deep(.el-input__suffix) {
        color: var(--ins-text-inverse);
      }
    }
  }

  .layout-body {
    min-height: 0;
    overflow: hidden;
  }

  .layout-aside {
    padding-top: 4px;
    transition: width 0.3s;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);
    display: flex;
    flex-direction: column;

    .el-menu {
      border-right: none;
      --el-menu-base-level-padding: 14px;
      --el-menu-level-padding: 28px;

      :deep(.el-menu--inline) {
        overflow: hidden;
      }

      :deep(.el-menu-item) {
        height: 40px;
        line-height: 40px;
        margin: 4px 0;
      }

      :deep(.el-menu-item):hover {
        color: var(--ins-color-primary);
        background-color: var(--ins-color-primary-bg);
      }

      :deep(.el-menu-item.is-active) {
        color: var(--ins-color-primary);
        background-color: var(--ins-color-primary-bg);
      }

      :deep(.el-sub-menu__title) {
        height: 40px;
        line-height: 40px;
      }

      :deep(.el-sub-menu__title):hover {
        color: var(--ins-color-primary);
        background-color: var(--ins-color-primary-bg);
      }

      :deep(.el-menu-item) > span,
      :deep(.el-sub-menu__title) > span {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    :deep(.menu-icon) {
      margin-right: 8px;
      font-size: 20px;
      vertical-align: middle;
    }
  }

  .layout-main {
    background: var(--ins-bg-page);
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .layout-content {
      padding: 16px;
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
  }
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;

  &-title {
    color: var(--ins-text-primary);
  }

  &-path {
    color: var(--ins-text-secondary);
    font-size: 12px;
  }
}

.user-menu {
  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    cursor: pointer;

    &:hover {
      background: var(--ins-color-primary-bg);
      color: var(--ins-color-primary);
    }
  }
}
</style>

<style lang="scss">
.layout-header {
  .el-input__wrapper {
    background-color: var(--ins-bg-container) !important;
    box-shadow: none !important;
    border-radius: 999px !important;

    &:hover,
    &.is-focus {
      box-shadow: none !important;
    }
  }

  .el-input__inner {
    color: var(--el-text-color-regular);

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  .el-input__prefix,
  .el-input__suffix {
    color: var(--el-text-color-regular);
  }
}

.user-dropdown-popper {
  min-width: 115px !important;
  width: 115px !important;
}
</style>
