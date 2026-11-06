<script setup lang="ts">
await navigateTo(useSupabaseSession().value ? '/dashboard' : '/login')
</script>
