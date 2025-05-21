import { Modal } from 'ant-design-vue';
import {h} from 'vue';

 type ConfirmOptions = {
    title: string;
    content: any;
    okText?: string;
    cancelText?: string;
 }

export function useConfirm() {
    // 通用确认弹窗
    /**
     * @param options - 弹窗配置项
     * @param okCallback - 确认回调函数
     * @param cancelCallback - 取消回调函数
     */
    function showConfirm(options: ConfirmOptions, okCallback?: () => void, cancelCallback?: () => void) {
            const modalInstance = Modal.confirm({
                title: options.title || '',
                content: options.content,
                okText: options.okText || '确认',
                cancelText: options.cancelText || '取消',
                onOk() {
                    // 执行确认操作
                    console.log('确认删除');
                    okCallback?.();
                },
                onCancel() {
                    // 执行取消操作
                    console.log('取消删除');
                    modalInstance?.destroy?.();
                    cancelCallback?.();
                },
            });
        }

    // 区级预回复确认提示框
    function showQuReplyConfirm(okCallback: (resolve: any) => void) {
        // 内容区域展示一个提示信息：填写区级预回复表单，一个radioGroup选择框，是否，
        return new Promise((resolve) => {
            const modalInstance = Modal.confirm({
                title:  '提示',
                content: h('div', {class :'pt-2'},[
                    h('div',{class:'mb-1'}, '是否填写区级预回复表单？'),
                ]),
                okText: '继续',
                cancelText: '不填写，直接保存',
                onOk() {
                    // 执行确认操作
                    console.log('确认');
                    okCallback(resolve);
                },
                onCancel() {
                    // 执行取消操作
                    console.log('取消');
                    modalInstance?.destroy?.();
                    resolve(null);
                },
            });
        })
       
    }

    return { showConfirm, showQuReplyConfirm };
}