<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerDrawer"
    :title="'选择需要导出的字段'"
    :width="900"
    @ok="handleSubmit"
    :showFooter="showFooterExport"
    destroyOnClose
    :maskClosable="false"
  >
    <div class="pl-8">
      <div class="item-selector-container">
        <draggable
          v-model="allColumnsOptions"
          item-key="value"
          class="draggable-area"
          ghost-class="ghost"
          chosen-class="chosen"
          animation="200"
          @start="dragging = true"
          @end="dragging = false"
        >
          <template #item="{ element }">
            <div :class="['data-item', { selected: element.selected, dragging }]" @click="toggleSelection(element)">
              {{ element.label }}
              <div v-if="element.selected" class="checkmark-corner">
                <span class="checkmark-icon">✓</span>
              </div>
            </div>
          </template>
        </draggable>
      </div>
      <!-- <JCheckbox v-model:value="userColumns" :options="allColumnsOptions" /> -->
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { getExportDayExcel } from './manager.api';
import { BasicModal, useModalInner } from '/@/components/Modal';
// import { editComplain, getManageInfo } from './manager.api';
import { downloadByUrl } from '/@/utils/file/download';
//@ts-ignore
import draggable from 'vuedraggable'; // For Vue 3

const dragging = ref(false);

const toggleSelection = (item) => {
  // Prevent toggling selection while dragging to avoid accidental clicks
  if (dragging.value) return;
  item.selected = !item.selected;
};

// 声明Emits
const emit = defineEmits(['success', 'register']);
const showFooterExport = ref(true);
const allColumnsOptions = ref([]);
const userColumns = ref([]);
const params = ref({});

//表单赋值
const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
  allColumnsOptions.value = data?.allColumns ?? [];
  params.value = data?.params ?? [];
  showFooterExport.value = data?.showFooterExport ?? true;
  setModalProps({ confirmLoading: false });
  // 隐藏底部时禁用整个表单
});

// 下载
function handleDownload(res) {
  let url = res?.fileKey;
  let fileName = res?.fileName;
  // 兼容新的上传接口
  if (url.indexOf('app-data/tmp/download') > -1) {
    url = `/citizen-voice/sys/common/static/${res.fileKey}`;
  }
  downloadByUrl({ url, fileName });
}

//提交事件
async function handleSubmit() {
  const columnsOptions = unref(allColumnsOptions);
  //@ts-ignore
  const columnNames = columnsOptions
    //@ts-ignore
    .filter((item) => item.selected)
    //@ts-ignore
    .map((v) => v.value)
    .join(',');
  const param = unref(params);
  const res = await getExportDayExcel({ ...param, columnNames });
  handleDownload(res);
  closeModal();
}
</script> 
<style scoped lang="less">
.item-selector-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin: 20px auto;
}

.draggable-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Spacing between items */
}

.data-item {
  position: relative; /* For absolute positioning of the checkmark corner */
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: grab;
  font-size: 14px;
  width: 150px; /* Ensure items have a decent width */
  text-align: center;
  box-sizing: border-box;
  user-select: none; /* Prevent text selection during drag */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  /* For text truncation if content is too long */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-item.selected {
  border-color: #ff4d4f; /* Red border for selected items */
  /* color: #ff4d4f; */ /* Optionally make text red too, image shows black text */
}

.data-item:hover {
  border-color: #40a9ff; /* Blue border on hover for non-selected */
}

.data-item.selected:hover {
  border-color: #ff7875; /* Lighter red on hover for selected */
}

.checkmark-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 22px 22px 0; /* Adjust size of the triangle */
  border-color: transparent #ff4d4f transparent transparent; /* Red triangle */
  z-index: 1;
}

.checkmark-icon {
  position: absolute;
  top: 1px; /* Fine-tune position of checkmark */
  right: -20px; /* Fine-tune position of checkmark */
  color: white;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
  transform: rotate(0deg); /* Checkmark itself is not rotated on the diagonal */
}

/* Styling for vuedraggable */
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border: 1px dashed #40a9ff;
}

.chosen {
  /* box-shadow: 0 0 5px rgba(0,0,0,0.2); */
  /* The chosen class is applied to the item being dragged */
}

.data-item.dragging {
  cursor: grabbing;
}
</style>