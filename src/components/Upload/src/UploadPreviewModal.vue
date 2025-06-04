<template>
  <BasicModal
    width="800px"
    :title="t('component.upload.preview')"
    wrapClassName="upload-preview-modal"
    v-bind="$attrs"
    @register="register"
    :showOkBtn="false"
  >
    <FileList :dataSource="fileListRef" :columns="columns" :actionColumn="actionColumn" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, watch, ref, h } from 'vue';
  //   import { BasicTable, useTable } from '/@/components/Table';
  import FileList from './FileList.vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { previewProps } from './props';
  import { PreviewFileItem } from './typing';
  import { downloadByUrl } from '/@/utils/file/download';
  import { createPreviewColumns, createPreviewActionColumn } from './data';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isArray } from '/@/utils/is';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { createImgPreview } from '/@/components/Preview/index';
  import { Modal } from 'ant-design-vue';

  export default defineComponent({
    components: { BasicModal, FileList },
    props: previewProps,
    emits: ['list-change', 'register', 'delete'],
    setup(props, { emit }) {
      const [register, { closeModal }] = useModalInner();
      const { t } = useI18n();
      const { createMessage } = useMessage();
      const fileListRef = ref<PreviewFileItem[]>([]);
      watch(
        () => props.value,
        (value:any) => {
          if (!isArray(value)) value = [];
          let list:any[] = [];
          if(typeof(value[0])==='string') {
            list = value.filter((item) => !!item).map((item) => {
              return {
                url: item,
                type: item.split('.').pop() || '',
                name: item.split('/').pop() || '',
              };
            });
          } else if(typeof(value[0])==='object') {
            list = value.filter((item:any) => !!item.url).map((item:any) => {
              return {
                url: item.url,
                type: item.type ||  '',
                name: item.name ||'',
              };
            });
          }
          fileListRef.value = list;
        },
        { immediate: true }
      );

      // 删除
      function handleRemove(record: PreviewFileItem) {
        const index = fileListRef.value.findIndex((item) => item.url === record.url);
        if (index !== -1) {
          const removed = fileListRef.value.splice(index, 1);
          emit('delete', removed[0].url);
          emit(
            'list-change',
            fileListRef.value.map((item) => item.url)
          );
        }
      }

    // 预览
    function handlePreview(record: PreviewFileItem) {
      const { url = '', type = '', name = '' } = record;
      
      // 如果没有url，直接返回
      if (!url) {
        createMessage.warning('文件路径不存在，无法预览');
        return;
      }
      
      // 处理文件URL - 兼容新上传接口
      let fileUrl = url;
      if(url.indexOf('app-data/complain/') > -1) {
        fileUrl = `/citizen-voice/sys/common/static/${url}`;
      } else if(url.indexOf('/app-data/tmp/') > -1) {
        fileUrl = `/citizen-voice/sys/common/static/${url.replace('/citizen-voice/', '')}`;
      }

      // 从文件名或URL中获取扩展名
      const fileType = type.toLowerCase() || url.split('.').pop()?.toLowerCase() || '';
      
      // 图片类型
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      if (imageTypes.includes(fileType)) {
        // 使用图片预览组件
        createImgPreview({
          imageList: [fileUrl],
          maskClosable: true
        });
        return;
      }
      
      // PDF类型
      if (fileType === 'pdf') {
        openPdfPreview(fileUrl, name);
        return;
      }
      
      // 音频类型
      const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
      if (audioTypes.includes(fileType)) {
        openAudioPreview(fileUrl, name);
        return;
      }
      
      // 视频类型
      const videoTypes = ['mp4', 'webm', 'ogg'];
      if (videoTypes.includes(fileType)) {
        openVideoPreview(fileUrl, name);
        return;
      }
      
      // 其他类型文件，提示下载
      createMessage.info('该文件类型不支持在线预览，即将下载');
      setTimeout(() => {
        handleDownload(record);
      }, 300);
    }

    // 打开PDF预览
    function openPdfPreview(url: string, title: string) {
      Modal.info({
        title: title || 'PDF预览',
        width: 1000,
        footer: null,
        maskClosable: true,
        content: () => {
          return h('div', { style: 'height: 70vh;' }, [
            h('iframe', {
              src: url,
              style: 'width: 100%; height: 100%; border: none;'
            })
          ]);
        }
      });
    }

    // 打开音频预览
    function openAudioPreview(url: string, title: string) {
       Modal.info({
        title: title || '音频预览',
        width: 400,
        footer: null,
        maskClosable: true,
        content: () => {
          return h('div', { class: 'flex justify-center py-4' }, [
            h('audio', {
              controls: true,
              autoplay: false,
              style: 'width: 100%;',
            }, [
              h('source', {
                src: url,
                type: `audio/${url.split('.').pop()}`
              }),
              '您的浏览器不支持音频播放'
            ])
          ]);
        }
      });
    }

    // 打开视频预览
    function openVideoPreview(url: string, title: string) {
       Modal.info({
        title: title || '视频预览',
        width: 800,
        footer: null,
        maskClosable: true,
        content: () => {
          return h('div', { class: 'flex justify-center py-4' }, [
            h('video', {
              controls: true,
              autoplay: false,
              style: 'width: 100%; max-height: 70vh;',
            }, [
              h('source', {
                src: url,
                type: `video/${url.split('.').pop()}`
              }),
              '您的浏览器不支持视频播放'
            ])
          ]);
        }
      });
    }

      // 下载
      function handleDownload(record: PreviewFileItem) {
        let { url = '' } = record;
        console.log('handleDownload', record);
        // 兼容新的上传接口
        if(url.indexOf('app-data/complain/') > -1) {
           url = `/citizen-voice/sys/common/static/${url}`;
        } else if(url.indexOf('/app-data/tmp/') > -1) {
           url = `/citizen-voice/sys/common/static/${url.replace('/citizen-voice/', '')}`;
        }
        console.log('url', url);
        downloadByUrl({ url });
      }

      const previewParams: any = {
        handleRemove,
        handleDownload,
        handlePreview,
        showDelete: props.showDelete
      }

      return {
        t,
        register,
        closeModal,
        fileListRef,
        columns: createPreviewColumns() as any[],
        actionColumn: createPreviewActionColumn(previewParams) as any,
      };
    },
  });
</script>
<style lang="less">
  .upload-preview-modal {
    .ant-upload-list {
      display: none;
    }

    .ant-table-wrapper .ant-spin-nested-loading {
      padding: 0;
    }
  }
</style>
