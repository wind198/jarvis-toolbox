<script setup lang="ts">
/// <reference types="chrome" />

import { NButton, NIcon, NSelect, NText } from 'naive-ui'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CopyOutlined } from '@vicons/antd'
import { kebabCase } from 'lodash-es'

type IGitAction =
  | 'feat'
  | 'fix'
  | 'chore'
  | 'refactor'
  | 'test'
  | 'style'
  | 'perf'
  | 'docs'
  | 'test'
  | 'perf'
  | 'style'
  | 'build'
  | 'ci'
  | 'revert'

const gitActionTypes = [
  { label: 'Feature', value: 'feat' },
  { label: 'Fix', value: 'fix' },
  { label: 'Chore', value: 'chore' },
  { label: 'Refactor', value: 'refactor' },
  { label: 'Test', value: 'test' },
  { label: 'Style', value: 'style' },
  { label: 'Performance', value: 'perf' },
  { label: 'Documentation', value: 'docs' },
  { label: 'Build', value: 'build' },
  { label: 'CI', value: 'ci' },
  { label: 'Revert', value: 'revert' },
]
const isInJiraIssuePage = ref<{ url: false | string; tabId?: string; title?: string }>({
  url: false,
})

const checkIsInJiraIssuePage = (url: string) => {
  return !!url.match(/atlassian\.net\/browse\/[A-Z0-9-]+/)
}

const isPollingLastTabChange = ref(false)

const pollingLastTabChangeInterval = ref<number | null>(null)
const pollLastTabChange = () => {
  isPollingLastTabChange.value = true
  chrome.storage.local
    .get('JARVIS_TOOLBOX_LAST_TAB_CHANGE')
    .then(({ JARVIS_TOOLBOX_LAST_TAB_CHANGE: lastTabChange }: any) => {
      try {
        if (!lastTabChange) {
          throw new Error('Not found')
        }
        if (lastTabChange.tabId === isInJiraIssuePage.value.tabId) {
          throw new Error('Tab id is the same')
        } else {
          if (checkIsInJiraIssuePage(lastTabChange.url)) {
            isInJiraIssuePage.value = {
              url: lastTabChange.url,
              tabId: lastTabChange.tabId,
              title: lastTabChange.title,
            }
          } else {
            isInJiraIssuePage.value = { url: false }
          }
        }
      } catch (_: any) {
        // don't care about the error
      } finally {
        isPollingLastTabChange.value = false
      }
    })
}
onMounted(() => {
  console.log('mounted')
  pollLastTabChange()
  pollingLastTabChangeInterval.value = setInterval(pollLastTabChange, 5000)
})

onUnmounted(() => {
  if (pollingLastTabChangeInterval.value) {
    clearInterval(pollingLastTabChangeInterval.value)
  }
})

const handleClickGenerateGitNaming = () => {
  generateGitNaming()
  //   chrome.runtime.sendMessage({
  //     type: 'EXTRACT_DOM',
  //     tabId: isInJiraIssuePage.value.tabId,
  //   })
}

// watch(
//   isInJiraIssuePage,
//   () => {
//     generateGitNaming()
//   },
//   { immediate: true },
// )

const removeRedundantFragmentFromPageTitle = (fragments: string[]) => {
  const lastFragment = fragments[fragments.length - 1]
  if (lastFragment.toLowerCase() === 'jira') {
    return fragments.slice(0, -1)
  }
  return fragments
}

const generateGitNaming = () => {
  if (!isInJiraIssuePage.value.title || !isInJiraIssuePage.value.url) {
    return
  }

  let fragments = isInJiraIssuePage.value.title
    .split(/\s+-\s+/)
    .map((i) => i.trim())
    .filter(Boolean)
  fragments = removeRedundantFragmentFromPageTitle(fragments)
  if (fragments.length !== 3) {
    return
  }
  const ticketId = isInJiraIssuePage.value.url.split('/').pop()?.toUpperCase()
  const issueType = fragments[0].replace(/[\[\]]/g, '').toLowerCase()
  const action = fragments[1]
  const context = fragments[2]
    .split('/')
    .map((i) => i.trim())
    .filter(Boolean)

  if (!ticketId || !issueType || !action || !context) {
    return
  }

  const gitActionType = gitNaming.value.actionType ?? issueType
  gitNaming.value.branch = [
    ticketId,
    gitActionType,
    kebabCase(action),
    ...context.map((i) => kebabCase(i)),
  ].join('/')

  gitNaming.value.commit = `${ticketId}: (${gitActionType}) ${action} (${context.join('/')})`
  gitNaming.value.pullRequest = gitNaming.value.commit
}
const gitNaming = ref<{
  branch: string
  commit: string
  pullRequest: string
  actionType: IGitAction
}>({
  branch: '',
  commit: '',
  pullRequest: '',
  actionType: 'feat' as IGitAction,
})

watch(
  () => gitNaming.value.actionType,
  () => {
    generateGitNaming()
  },
)

const noGitNaming = computed(() => {
  return !gitNaming.value.branch || !gitNaming.value.commit || !gitNaming.value.pullRequest
})

const gitNamingDataToRender = computed(() => {
  if (noGitNaming.value) {
    return []
  }
  return [
    { key: 'branch', label: 'Branch', value: gitNaming.value.branch },
    { key: 'commit', label: 'Commit', value: gitNaming.value.commit },
    { key: 'pullRequest', label: 'Pull Request', value: gitNaming.value.pullRequest },
  ]
})

const showingCopiedIndicator = ref(false)
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
  showingCopiedIndicator.value = true
  setTimeout(() => {
    showingCopiedIndicator.value = false
  }, 2000)
}
</script>
<template>
  <div class="git-naming min-h-40 flex flex-col">
    <div class="text-instruction text-sm mb-3 text-center">
      <NText v-if="isInJiraIssuePage.url">{{ isInJiraIssuePage.title }}</NText>
      <NText type="warning" v-else
        >You are not in a Jira issue page, the URL should be like this:
        https://your-jira-domain.atlassian.net/browse/JIRA-123</NText
      >
    </div>
    <NButton
      @click="handleClickGenerateGitNaming"
      class="self-center"
      type="primary"
      :disabled="!isInJiraIssuePage.url"
      >Generate git naming</NButton
    >

    <div v-if="!noGitNaming" class="git-naming-result mt-3 flex flex-col space-y-2">
      <div class="w-full flex space-x-2 justify-between items-center">
        <NSelect class="w-[160px]!" v-model:value="gitNaming.actionType" :options="gitActionTypes">
        </NSelect>
        <NText type="info" class="text-sm" v-if="showingCopiedIndicator">Copied to clipboard</NText>
      </div>
      <NText
        class="block cursor-pointer"
        @click="copyToClipboard(item.value)"
        v-for="item in gitNamingDataToRender"
        :key="item.key"
      >
        <span class="font-bold mr-2">✅ {{ item.label }}:</span>
        <span class="text-gray-500">{{ item.value }}</span>
        <NIcon class="ml-2 align-middle"><CopyOutlined /></NIcon>
      </NText>
    </div>
  </div>
</template>
