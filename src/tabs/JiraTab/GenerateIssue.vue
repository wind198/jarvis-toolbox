<script setup lang="ts">
import { computed, ref } from 'vue'

import { NSelect, NForm, NFormItem, NInput, NButton, type FormRules, NIcon, NText } from 'naive-ui'
import { CopyOutlined } from '@vicons/antd'

type IIssueType = 'task' | 'bug' | 'epic' | 'story'

type IFormValue = {
  type: IIssueType
  action: string
  context: string
}
const formRef = ref()
const formValue = ref<IFormValue>({
  type: 'task' as IIssueType,
  action: '',
  context: '',
})
const rules: FormRules = {
  type: [{ required: true, message: 'Please select issue type' }],
  action: [
    { required: true, message: 'Please input action' },
    { min: 5, max: 200, message: 'Length between 5 and 200 characters' },
  ],
  context: [
    { required: true, message: 'Please input at least 1 context' },
    { min: 5, max: 200, message: 'Length between 5 and 200 characters' },
  ],
}
const issueTypeOptions = [
  { label: 'Task', value: 'task' },
  { label: 'Bug', value: 'bug' },
  { label: 'Epic', value: 'epic' },
  { label: 'Story', value: 'story' },
]
const currentErrors = ref<{ field: string; message: string }[][]>([])

const generateIssueName = (data: IFormValue) => {
  const { type, action, context } = data
  const issueName = `[${type.toUpperCase()}] - ${action} - ${context
    .split(',')
    .map((i) => i.trim())
    .filter(Boolean)
    .join('/')}`
  generatedIssueName.value = issueName
}
const generatedIssueName = ref('')

const handleSubmit = (e: Event) => {
  e.preventDefault()
  formRef.value.validate((errors: any) => {
    if (!errors) {
      currentErrors.value = []
      generateIssueName(formValue.value)
    } else {
      currentErrors.value = errors
    }
  })
}
const feedbackForContext = computed(() => {
  const errors = currentErrors.value?.find((fieldErrors) =>
    fieldErrors.find((error) => error.field === 'context'),
  )
  if (errors) {
    return errors[0].message
  }
  return 'Nested contexts separated by comma'
})

const showingCopyIndicator = ref(false)
const copyIssueName = () => {
  navigator.clipboard.writeText(generatedIssueName.value)
  showingCopyIndicator.value = true
  setTimeout(() => {
    showingCopyIndicator.value = false
  }, 3000)
}
</script>
<template>
  <div class="generate-issue">
    <n-form
      class="form issue-info-form"
      ref="formRef"
      :label-width="80"
      :model="formValue"
      :rules="rules"
      @submit="handleSubmit"
    >
      <n-form-item label="Type" path="type" class="min-w-[250px] w-full">
        <n-select v-model:value="formValue.type" :options="issueTypeOptions" />
      </n-form-item>
      <n-form-item label="Action" path="action" class="min-w-[250px] w-full">
        <n-input v-model:value="formValue.action" placeholder="Input Action" />
      </n-form-item>
      <n-form-item label="Context" path="context" class="min-w-[250px] w-full">
        <n-input v-model:value="formValue.context" placeholder="Input Context" />
        <template #feedback> {{ feedbackForContext }} </template>
      </n-form-item>
      <n-form-item>
        <n-button type="primary" attr-type="submit">Generate </n-button>
      </n-form-item>
    </n-form>
    <div class="generated-issue-name" v-if="generatedIssueName">
      <p class="text cursor-pointer" @click="copyIssueName">
        ✅ Generated issue name: {{ generatedIssueName }}
        <n-icon class="align-middle">
          <CopyOutlined />
        </n-icon>
        <n-text class="align-baseline text-md" type="info" v-if="showingCopyIndicator"
          >Copied to clipboard</n-text
        >
      </p>
    </div>
  </div>
</template>
