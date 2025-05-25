<script setup lang="ts">
import { ref } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import GenerateIssue from './JiraTab/GenerateIssue.vue'

type ITabs = 'generate-issue'

const currentTab = ref<ITabs>('generate-issue')
</script>

<template>
  <main class="jira-tab">
    <p class="text-sm mb-4">Jira helpers, pick features from the sidebar</p>
    <NTabs v-model="currentTab" placement="left" size="small" pane-class="panel-wrapper">
      <NTabPane name="generate-issue" tab="Generate issue">
        <GenerateIssue />
      </NTabPane>
    </NTabs>
  </main>
</template>

<style scoped></style>
