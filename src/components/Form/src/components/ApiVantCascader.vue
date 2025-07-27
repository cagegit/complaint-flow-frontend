<template>
  <!-- <Cascader @dropdownVisibleChange="handleFetch" v-bind="attrs_" @change="handleChange" :style="styles" :options="getOptions" v-model:value="state">
    <template #[item]="data" v-for="item in Object.keys($slots)">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template #suffixIcon v-if="loading">
      <LoadingOutlined spin />
    </template>
    <template #notFoundContent v-if="loading">
      <span>
        <LoadingOutlined spin class="mr-1" />
        {{ t('component.form.apiSelectNotFound') }}
      </span>
    </template>
  </Cascader> -->
  <van-popup v-model:show="showCascaderPopup" round position="bottom">
    <van-cascader
        title=""
        @close="showCascaderPopup = false"
        @finish="onFinish"
        @change="handleChange" 
        :style="styles" 
        :options="getOptions"
        v-model="state"
        @opened="handleFetch"
        :field-names="fieldNames"
    />
    </van-popup>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watchEffect, computed, unref, watch } from 'vue';
  //   import { Cascader } from 'ant-design-vue';
  import { Cascader as VanCascader, Popup as VanPopup } from 'vant';
  import { isFunction } from '/@/utils/is';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { get } from 'lodash-es';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { propTypes } from '/@/utils/propTypes';

  type OptionsItem = { 
    label: string; 
    value: string; 
    disabled?: boolean;
    children?: OptionsItem[];
    // 设置为false时会强制标记为父节点，即使当前没有子节点，也会显示展示图标
    isLeaf?: boolean; 
};

  export default defineComponent({
    name: 'ApiCascader',
    components: {
      VanCascader,
      VanPopup,
      LoadingOutlined,
    },
    inheritAttrs: false,
    props: {
      value: [Array, Object, String, Number],
      numberToString: propTypes.bool,
      api: {
        type: Function as PropType<(arg?: Recordable) => Promise<OptionsItem[]>>,
        default: null,
      },
      // api params
      params: {
        type: Object as PropType<Recordable>,
        default: () => ({}),
      },
      // support xxx.xxx.xx
      resultField: propTypes.string.def(''),
      labelField: propTypes.string.def('label'),
      valueField: propTypes.string.def('value'),
      immediate: propTypes.bool.def(true),
      styles: {
        type: Object as PropType<Recordable>,
        default: () => ({
          maxWidth: '100%',
        }),
      },
    },
    emits: ['options-change', 'change'],
    setup(props, { emit }) {
      const options = ref<OptionsItem[]>([]);
      const loading = ref(false);
      const isFirstLoad = ref(true);
      const emitData = ref<any[]>([]);
      const attrs = useAttrs();
      const { t } = useI18n();

      const showCascaderPopup = ref(false);

     const fieldNames = {
      text: 'label',
      value: 'value',
      children: 'children',
    };

      // Embedded in the form, just use the hook binding to perform form verification
      const [state, setState] = useRuleFormItem(props, 'value', 'change', emitData);
      // update-begin--author:liaozhiyang---date:20230830---for：【QQYUN-6308】解决警告
      let vModalValue: any;
      const attrs_ = computed(() => {
        let obj: any = unref(attrs) || {};
        if (obj && obj['onUpdate:value']) {
          vModalValue = obj['onUpdate:value'];
          delete obj['onUpdate:value'];
        }
        // update-begin--author:liaozhiyang---date:20231017---for：【issues/5467】ApiSelect修复覆盖了用户传递的方法
        if (obj['filterOption'] === undefined) {
          // update-begin--author:liaozhiyang---date:20230904---for：【issues/5305】无法按照预期进行搜索
          obj['filterOption'] = (inputValue, option) => {
            if (typeof option['label'] === 'string') {
              return option['label'].toLowerCase().indexOf(inputValue.toLowerCase()) != -1;
            } else {
              return true;
            }
          };
          // update-end--author:liaozhiyang---date:20230904---for：【issues/5305】无法按照预期进行搜索
        }
        // update-end--author:liaozhiyang---date:20231017---for：【issues/5467】ApiSelect修复覆盖了用户传递的方法
        return obj;
      });
      // update-begin--author:liaozhiyang---date:20230830---for：【QQYUN-6308】解决警告
      const getOptions = computed(() => {
        const { labelField, valueField, numberToString } = props;
        // options value的值，为id name parentId level,转换为 label value children isLeaf 结构
        const transformOptions = (options: any[]): OptionsItem[] => {
          if (!options || options.length === 0) return [];
          
          // Create a map for faster parent lookup
          const optionsMap = new Map();
          options.forEach(item => {
            const value = item[valueField];
            optionsMap.set(item.id, { ...item, label: item[labelField], value: numberToString ? `${value}` : value, children: [] });
          });
          
          // Build tree structure
          const result: OptionsItem[] = [];
          options.forEach(item => {
            const currentItem = optionsMap.get(item.id);
            
            if (item.parentId && optionsMap.has(item.parentId)) {
              // Add as child to parent
              optionsMap.get(item.parentId).children.push(currentItem);
            } else {
              // Root level item
              result.push(currentItem);
            }
          });
          
          return result;
        };
        let newList: OptionsItem[] = [];
        // Apply transformation if needed
        if (unref(options).length > 0 && unref(options)[0].id !== undefined) {
          newList = transformOptions(unref(options));
        }
        console.log('newList', newList);
        return newList;

        // return unref(options).reduce((prev, next: Recordable) => {
        //   if (next) {
        //     const value = next[valueField];
        //     prev.push({
        //       ...omit(next, [labelField, valueField]),
        //       label: next[labelField],
        //       value: numberToString ? `${value}` : value,
        //       disabled: next.disabled,
        //       children: next.children?.map((item: Recordable) => {
        //         return {
        //             ...omit(item, [labelField, valueField]),
        //             label: item[labelField],
        //             value: numberToString ? `${item[valueField]}` : item[valueField],
        //             disabled: item.disabled,
        //         };
        //       }) || [],
        //       isLeaf: next.isLeaf ?? false,
        //     });
        //   }
        //   return prev;
        // }, [] as OptionsItem[]);
      });
      // update-begin--author:liaozhiyang---date:20240823---for：【issues/6999】ApiSelect联动更新字段不生效（代码还原）
      watchEffect(() => {
        props.immediate && fetch();
      });
      // update-end--author:liaozhiyang---date:20240823---for：【issues/6999】ApiSelect联动更新字段不生效（代码还原）

      watch(
        () => props.params,
        () => {
          !unref(isFirstLoad) && fetch();
        },
        { deep: true }
      );
     //监听数值修改，查询数据
      watchEffect(() => {
        props.value && handleFetch();
      });

      async function fetch() {
        const api = props.api;
        if (!api || !isFunction(api)) return;
        options.value = [];
        try {
          loading.value = true;
          const res = await api(props.params);
          if (Array.isArray(res)) {
            options.value = res;
            emitChange();
            return;
          }
          if (props.resultField) {
            options.value = get(res, props.resultField) || [];
          }
          emitChange();
        } catch (error) {
          console.warn(error);
        } finally {
          loading.value = false;
          //--@updateBy-begin----author:liusq---date:20210914------for:判断选择模式，multiple多选情况下的value值空的情况下需要设置为数组------
          unref(attrs).mode == 'multiple' && !Array.isArray(unref(state)) && setState([]);
          //--@updateBy-end----author:liusq---date:20210914------for:判断选择模式，multiple多选情况下的value值空的情况下需要设置为数组------

          //update-begin---author:wangshuai ---date:20230505  for：初始化value值，如果是多选字符串的情况下显示不出来------------
          initValue();
          //update-end---author:wangshuai ---date:20230505  for：初始化value值，如果是多选字符串的情况下显示不出来------------
        }
      }

      function initValue() {
        let value = props.value;
        if (value && typeof value === 'string' && value != 'null' && value != 'undefined') {
          state.value = value.split(',');
        }
      }

      async function handleFetch() {
        if (!props.immediate && unref(isFirstLoad)) {
          await fetch();
          isFirstLoad.value = false;
        }
      }

      function emitChange() {
        emit('options-change', unref(getOptions));
      }

      function handleChange(_, ...args) {
        vModalValue && vModalValue(_);
        emitData.value = args;
      }

      function onFinish() {
        showCascaderPopup.value = false;
        // 触发change事件
        handleChange(state.value);
      }

      return { state, fieldNames, showCascaderPopup, attrs_, attrs, getOptions, loading, t, handleFetch, handleChange, onFinish };
    },
  });
</script>
