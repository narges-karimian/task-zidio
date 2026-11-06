<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue?: string | number | null
  type?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  error?: string
  min?: number
  minlength?: number
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  autocomplete: undefined,
  required: false,
  error: '',
  min: undefined,
  minlength: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function update(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="grid gap-2">
    <label :for="props.id" class="text-sm font-medium text-ink">
      {{ label }} <span v-if="required" class="text-red-600">*</span>
    </label>
    <input
      :id="props.id"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :min="min"
      :minlength="minlength"
      :dir="['email', 'password', 'number', 'date'].includes(type) ? 'ltr' : undefined"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${props.id}-error` : undefined"
      class="min-h-12 w-full rounded-control border border-border bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
      @input="update"
    >
    <p v-if="error" :id="`${props.id}-error`" class="text-xs text-red-700">{{ error }}</p>
  </div>
</template>
