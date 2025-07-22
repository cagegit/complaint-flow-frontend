/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

export function formatToDateTime(date: dayjs.Dayjs | undefined = undefined, format = DATE_TIME_FORMAT): string {
  return dayjs(date).format(format);
}

export function formatToDate(date: dayjs.Dayjs | undefined = undefined, format = DATE_FORMAT): string {
  return dayjs(date).format(format);
}

// 获取两个日期a,b之前相差的天数和小时数，b默认为当前时间
export function getDateDiff(a: dayjs.Dayjs, b: dayjs.Dayjs = dayjs()): { expires: boolean; days: number; hours: number } {
  let diffInMilliseconds = a.diff(b); // 计算两个日期之间的毫秒差
  let expires = false;
  // 判断是否为负数，
  if (diffInMilliseconds < 0) {
    expires = true;
    // 如果是负数，取绝对值
    diffInMilliseconds = Math.abs(diffInMilliseconds);
  }
  const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { expires, days, hours };
}

export const dateUtil = dayjs;
