<template>
  <main class="tinymce-container">
    <vue-tinymce v-model="content" :setting="setting" />
  </main>
</template>

<script>
export default {
  name: 'RichText',
  data() {
    return {
      content: '',
      setting: {
        toolbar: 'undo redo | fullscreen | formatselect alignleft aligncenter alignright alignjustify | link unlink | numlist bullist | image media table | fontselect fontsizeselect forecolor backcolor | bold italic underline strikethrough | indent outdent | superscript subscript | removeformat |',
        toolbar_drawer: 'sliding',
        quickbars_selection_toolbar: 'removeformat | bold italic underline strikethrough | fontsizeselect forecolor backcolor',
        plugins: 'link image media table lists fullscreen quickbars',
        language: 'zh_CN', // 本地化设置
        height: 350
      }
    }
  }
}
</script>

<style scoped>

</style>
