<template>
  <div class="knowledge-detail-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="py-4">
        <a-button type="link" style="color: #0c3c3a" @click="goBack" preIcon="ant-design:arrow-left-outlined">返回知识库</a-button>
     </div>
    </div>
    
    <div class="detail-container">
      <!-- 文档标题 -->
      <h1 class="document-title">
         {{ title }}
      </h1>
      
      <!-- 文档元信息 -->
      <div class="document-meta">
        <!-- <div class="meta-item">
          <span class="meta-label">点击量：</span>
          <span class="meta-value">137</span>
        </div> -->
        <div class="meta-item">
          <span class="meta-label">来源：</span>
          <span class="meta-value">{{ source }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">时间：</span>
          <span class="meta-value">{{ time }}</span>
        </div>
      </div>
      
      <!-- 文档正文 -->
      <div class="document-content">
        <div class="content-info" v-html="documentContent"></div>
        <!-- 二维码 -->
        <!-- <div class="qrcode-container">
          <img src="/@/assets/images/qrcode.png" alt="二维码" class="qrcode-image">
        </div> -->
      </div>

      <!-- 附件列表 -->
      <div v-if="attachments && attachments.length > 0" class="document-attachments">
        <h2 class="attachments-title">附件列表</h2>
        <ul class="attachments-list">
          <li v-for="(attachment, index) in attachments" :key="index" class="attachment-item">
            <i class="attachment-icon" :class="getFileIconClass(attachment.name)"></i>
            <a :href="attachment.url" target="_blank" class="attachment-link">
              {{ attachment.name }}
              <span class="attachment-size" v-if="attachment.size">({{ formatFileSize(attachment.size) }})</span>
            </a>
            <a class="download-btn" :href="attachment.url" download>下载</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="KnowledgeDetail">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDetail } from'/@/api/complaint/knowledge';

const route = useRoute();
const router = useRouter();
// 标题
const title = ref('关于对《昌平区加快独角兽、专精特新企业培育发展支持办法2.0版本（征求意见稿）》 公开征集意见的反馈');
// 来源
const source = ref('区科委');
// 时间
const time = ref('2025-04-29 17:12');
// 点击量
const clickCount = ref(137);
// 文档正文
const documentContent = ref(`
2025年4月21日至4月27日，昌平区科学技术委员会在昌平区人民政府网站对《昌平区加快独角兽、专精特新企业培育发展支持办法2.0版本（征求意见稿）》向社会公开征集意见。
<br/>
意见征集期间，我委未收到与征求意见稿相关的意见建议。
<br/>
感谢社会各界对我们工作的关心和支持。
`);

// 附件数据
const attachments = ref([
  {
    name: '昌平区加快独角兽、专精特新企业培育发展支持办法2.0版本（征求意见稿）.pdf',
    url: '/api/attachments/policy_draft.pdf',
    size: 2457600 // 2.4MB
  },
  {
    name: '附件1：企业申报材料清单.docx',
    url: '/api/attachments/materials_list.docx',
    size: 567890 // 555KB
  },
  {
    name: '附件2：支持申请表.xlsx',
    url: '/api/attachments/application_form.xlsx',
    size: 345610 // 337KB
  }
]);

onMounted(() => {
  // 可以通过路由参数获取文档ID，然后请求详细数据
  const documentId = route.query.id;
  if (documentId) {
    getDetail({id:documentId}).then((response) => {
      // 处理获取到的文档详情数据
      console.log('文档详情数据：', response);
      // 如果API返回附件数据，可以更新attachments
      // if (response.data.attachments && response.data.attachments.length > 0) {
      //   attachments.value = response.data.attachments;
      // }
    }).catch((error) => {
      console.error('获取文档详情失败：', error);
    });
  }
});

// 返回上一页
function goBack() {
  console.log('goBack');
  router.back();
}

// 获取文件图标类
const getFileIconClass = (fileName: string) => {
  if (!fileName) return 'file-generic';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'file-pdf';
    case 'doc':
    case 'docx':
      return 'file-word';
    case 'xls':
    case 'xlsx':
      return 'file-excel';
    case 'ppt':
    case 'pptx':
      return 'file-ppt';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'file-image';
    case 'zip':
    case 'rar':
    case '7z':
      return 'file-archive';
    default:
      return 'file-generic';
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style lang="less" scoped>
.knowledge-detail-page {
  padding: 20px;
  padding-top: 82px;
  background-color: #fff;
  min-height: calc(100vh - 120px);
  max-width: 1280px;
  margin: 0 auto;
  
  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
    color: #666;
    
    .breadcrumb-item {
      cursor: pointer;
      
      &:hover {
        color: #0c3c3a;
      }
      
      &.active {
        color: #0c3c3a;
        font-weight: bold;
      }
    }
    
    .breadcrumb-separator {
      margin: 0 5px;
    }
  }
  
  .detail-container {
    padding: 20px 0;
    border-top: 1px solid #eee;
    
    .document-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin-bottom: 25px;
      line-height: 1.5;
    }
    
    .document-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #666;
      
      .meta-item {
        margin-right: 15px;
        display: flex;
        align-items: center;
      }
    }
    
    .document-content {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 30px;
      word-break: break-all;
    }
    .content-info {
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      word-break: break-all;
      text-indent: 1em;
      text-align: justify;
    }
    
    .document-attachments {
      margin-top: 30px;
      padding: 20px;
      border-top: 1px dashed #e0e0e0;
      
      .attachments-title {
        font-size: 18px;
        color: #333;
        margin-bottom: 15px;
        font-weight: bold;
      }
      
      .attachments-list {
        list-style-type: none;
        padding: 0;
        
        .attachment-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .attachment-icon {
            width: 24px;
            height: 24px;
            margin-right: 10px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            
            // 不同文件类型的图标样式
            &.file-pdf {
              background-color: #f44336;
              border-radius: 3px;
            }
            
            &.file-word {
              background-color: #2196f3;
              border-radius: 3px;
            }
            
            &.file-excel {
              background-color: #4caf50;
              border-radius: 3px;
            }
            
            &.file-ppt {
              background-color: #ff9800;
              border-radius: 3px;
            }
            
            &.file-image {
              background-color: #9c27b0;
              border-radius: 3px;
            }
            
            &.file-archive {
              background-color: #795548;
              border-radius: 3px;
            }
            
            &.file-generic {
              background-color: #607d8b;
              border-radius: 3px;
            }
          }
          
          .attachment-link {
            flex: 1;
            color: #0c3c3a;
            text-decoration: none;
            
            &:hover {
              text-decoration: underline;
            }
            
            .attachment-size {
              color: #999;
              font-size: 12px;
              margin-left: 5px;
            }
          }
          
          .download-btn {
            padding: 4px 12px;
            background-color: #0c3c3a;
            color: white;
            border-radius: 4px;
            font-size: 13px;
            text-decoration: none;
            
            &:hover {
              background-color: darken(#0c3c3a, 5%);
            }
          }
        }
      }
    }
  }
}

// 打印样式
@media print {
  .knowledge-detail-page {
    padding: 0;
  }
  
  .breadcrumb,
  .download-btn {
    display: none !important;
  }
}
</style>