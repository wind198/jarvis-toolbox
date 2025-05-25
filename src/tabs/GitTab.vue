<script setup lang="ts">
import { ref } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import GitNaming from './GitTab/GitNaming.vue'

type ITabs = 'git-naming'

const currentTab = ref<ITabs>('git-naming')
</script>

<template>
  <main class="git-tab">
    <p class="text-sm mb-4">Git helpers, pick features from the sidebar</p>
    <NTabs v-model="currentTab" placement="left" size="small" pane-class="panel-wrapper">
      <NTabPane name="git-naming" tab="Git naming">
        <GitNaming />
      </NTabPane>
    </NTabs>
  </main>
</template>
