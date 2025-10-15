import { openWindow } from '..';
import { dataURLtoBlob, urlToBase64 } from './base64Conver';

/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByOnlineUrl(url: string, filename: string, mime?: string, bom?: BlobPart) {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom);
  });
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByBase64(buf: string, filename: string, mime?: string, bom?: BlobPart) {
  const base64Buf = dataURLtoBlob(buf);
  downloadByData(base64Buf, filename, mime, bom);
}

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export function downloadByData(data: BlobPart, filename: string, mime?: string, bom?: BlobPart) {
  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data];
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    window.URL.revokeObjectURL(blobURL);
  }
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({ url, target = '_blank', fileName }: { url: string; target?: TargetContext; fileName?: string }): boolean {
  const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return false;
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a');
    link.href = url;
    link.target = target;

    if (link.download !== undefined) {
      link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents');
      e.initEvent('click', true, true);
      link.dispatchEvent(e);
      return true;
    }
  } else if(document?.createElement) {
     const link = document.createElement('a');
    link.href = url;
    link.target = target;
    if (fileName) {
      link.download = fileName;
    } else {
      link.download = url.substring(url.lastIndexOf('/') + 1, url.length);
    }
    link.style.display = 'none';
    if(typeof link?.click === 'function') {
      // 兼容部分浏览器
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        // 延时移除，解决部分浏览器无法下载的问题
        document.body.removeChild(link);
      }, 500);
      return true;
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?download=true';
  } else if (url.indexOf('download') === -1) {
    url += '&download=true';
  }

  openWindow(url, { target });
  return true;
}

export function downloadFileByUrl({ url, fileName }: { url: string; target?: TargetContext; fileName?: string }): void {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isIOS = /(iPad|iPhone|iPod)/i.test(ua);

    // IE10+ 专用下载
    if (window?.navigator?.msSaveOrOpenBlob) {
        fetch(url, { mode: 'cors' })
            .then(res => {
                if (!res.ok) throw new Error('网络错误，请重试！');
                return res.blob();
            })
            .then(blob => {
                window.navigator.msSaveOrOpenBlob(blob, fileName || url.split('/').pop());
            })
            .catch(() => {
                window.open(url, '_blank');
            });
        return;
    }

    // iOS / Safari 特殊处理（只能打开预览）
    if (isIOS || isSafari) {
        window.open(url, '_blank');
        return;
    }

    // 现代浏览器强制下载（fetch 解决跨域文件名问题）
    fetch(url, { mode: 'cors' })
        .then(res => {
            if (!res.ok) throw new Error('网络错误，请重试！');
            return res.blob();
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = fileName || url.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
        })
        .catch(() => {
            // 如果 fetch 失败，直接尝试打开
            window.open(url, '_blank');
        });
}
