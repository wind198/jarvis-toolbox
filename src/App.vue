<script setup lang="ts">
import { NTabPane, NTabs } from 'naive-ui'
import { ref } from 'vue'
import Jiratab from './tabs/JiraTab.vue'
import GitTab from './tabs/GitTab.vue'

type ITabs = 'jira' | 'git'

const currentTab = ref<ITabs>('jira')
</script>

<template>
  <div class="app min-w-xl shadow-sm app-container bg-white">
    <n-tabs
      type="line"
      animated
      v-model="currentTab"
      pane-wrapper-class="main-tab-content"
      class="px-4"
    >
      <n-tab-pane name="jira" tab="Jira">
        <Jiratab />
      </n-tab-pane>
      <n-tab-pane name="git" tab="Git">
        <GitTab />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
